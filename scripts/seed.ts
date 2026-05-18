import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  categories as categoryTable,
  categoryTranslations,
  postTags,
  posts as postTable,
  postTranslations,
  tags as tagTable,
} from "../db/schema";
import { categories, posts, slugifyTag } from "../lib/content";

async function main() {
  for (const category of categories) {
    const [row] = await db
      .insert(categoryTable)
      .values({
        slug: category.slug,
        name: category.translations.en.name,
        description: category.translations.en.description,
        color: "#6EE7B7",
      })
      .onConflictDoUpdate({
        target: categoryTable.slug,
        set: {
          name: category.translations.en.name,
          description: category.translations.en.description,
          color: "#6EE7B7",
        },
      })
      .returning();

    await db
      .delete(categoryTranslations)
      .where(eq(categoryTranslations.categoryId, row.id));

    for (const [locale, translation] of Object.entries(category.translations)) {
      await db.insert(categoryTranslations).values({
        categoryId: row.id,
        locale,
        name: translation.name,
        description: translation.description,
      });
    }
  }

  const dbCategories = await db.select().from(categoryTable);
  const tagRows = new Map<string, string>();

  for (const post of posts) {
    const category = dbCategories.find((item) => item.slug === post.categorySlug);

    if (!category) {
      throw new Error(`Missing category for post ${post.slug}`);
    }

    const [row] = await db
      .insert(postTable)
      .values({
        slug: post.slug,
        categoryId: category.id,
        featured: post.featured,
        coverImage: post.coverImage,
        publishedAt: new Date(post.publishedAt),
      })
      .onConflictDoUpdate({
        target: postTable.slug,
        set: {
          categoryId: category.id,
          featured: post.featured,
          coverImage: post.coverImage,
          publishedAt: new Date(post.publishedAt),
        },
      })
      .returning();

    await db.delete(postTranslations).where(eq(postTranslations.postId, row.id));
    await db.delete(postTags).where(eq(postTags.postId, row.id));

    for (const [locale, translation] of Object.entries(post.translations)) {
      await db.insert(postTranslations).values({
        postId: row.id,
        locale,
        title: translation.title,
        excerpt: translation.excerpt,
        content: translation.content,
        readingMinutes: translation.readingMinutes,
        seoTitle: translation.seoTitle,
        seoDescription: translation.seoDescription,
      });
    }

    for (const name of post.tags) {
      const slug = slugifyTag(name);

      let tagId = tagRows.get(slug);

      if (!tagId) {
        const [tag] = await db
          .insert(tagTable)
          .values({ slug, name })
          .onConflictDoUpdate({
            target: tagTable.slug,
            set: { name },
          })
          .returning();

        tagId = tag.id;
        tagRows.set(slug, tagId);
      }

      await db.insert(postTags).values({
        postId: row.id,
        tagId,
      });
    }
  }
}

main()
  .then(() => {
    console.log("Seeded BSVgo content");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
