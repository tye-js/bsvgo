import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  categories as categoryTable,
  categoryTranslations,
  postTags,
  posts as postTable,
  postTranslations,
  tags as tagTable,
} from "@/db/schema";
import {
  CategorySlug,
  categories,
  getCategoryBySlug,
  posts,
} from "./content";
import { Locale } from "./i18n";

export type LocalizedCategory = {
  slug: CategorySlug;
  name: string;
  description: string;
};

export type LocalizedPost = {
  slug: string;
  featured: boolean;
  coverImage: string;
  publishedAt: string;
  categorySlug: CategorySlug | string;
  categoryName: string;
  title: string;
  excerpt: string;
  content: string;
  readingMinutes: number;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
};

export function getFallbackCategories(locale: Locale): LocalizedCategory[] {
  return categories.map((category) => ({
    slug: category.slug,
    ...category.translations[locale],
  }));
}

export function getFallbackPosts(locale: Locale): LocalizedPost[] {
  return posts
    .map((post) => {
      const category = getCategoryBySlug(post.categorySlug);

      if (!category) {
        return null;
      }

      return {
        slug: post.slug,
        featured: post.featured,
        coverImage: post.coverImage,
        publishedAt: post.publishedAt,
        categorySlug: post.categorySlug,
        categoryName: category.translations[locale].name,
        tags: post.tags,
        ...post.translations[locale],
      };
    })
    .filter(Boolean) as LocalizedPost[];
}

async function queryCategories(locale: Locale) {
  const { db } = await import("@/db");

  return db
    .select({
      slug: categoryTable.slug,
      name: categoryTranslations.name,
      description: categoryTranslations.description,
    })
    .from(categoryTable)
    .innerJoin(
      categoryTranslations,
      eq(categoryTranslations.categoryId, categoryTable.id)
    )
    .where(eq(categoryTranslations.locale, locale))
    .orderBy(asc(categoryTranslations.name));
}

async function queryPosts(locale: Locale) {
  const { db } = await import("@/db");

  return db
    .select({
      slug: postTable.slug,
      featured: postTable.featured,
      coverImage: postTable.coverImage,
      publishedAt: postTable.publishedAt,
      categorySlug: categoryTable.slug,
      categoryName: categoryTranslations.name,
      tags: sql<string[]>`coalesce(array_remove(array_agg(distinct ${tagTable.name}), null), '{}'::text[])`,
      title: postTranslations.title,
      excerpt: postTranslations.excerpt,
      content: postTranslations.content,
      readingMinutes: postTranslations.readingMinutes,
      seoTitle: postTranslations.seoTitle,
      seoDescription: postTranslations.seoDescription,
    })
    .from(postTable)
    .innerJoin(categoryTable, eq(categoryTable.id, postTable.categoryId))
    .innerJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categoryTable.id),
        eq(categoryTranslations.locale, locale)
      )
    )
    .innerJoin(postTranslations, eq(postTranslations.postId, postTable.id))
    .leftJoin(postTags, eq(postTags.postId, postTable.id))
    .leftJoin(tagTable, eq(tagTable.id, postTags.tagId))
    .where(eq(postTranslations.locale, locale))
    .groupBy(
      postTable.slug,
      postTable.featured,
      postTable.coverImage,
      postTable.publishedAt,
      categoryTable.slug,
      categoryTranslations.name,
      postTranslations.title,
      postTranslations.excerpt,
      postTranslations.content,
      postTranslations.readingMinutes,
      postTranslations.seoTitle,
      postTranslations.seoDescription
    )
    .orderBy(desc(postTable.publishedAt));
}

export async function getLocalizedCategories(
  locale: Locale
): Promise<LocalizedCategory[]> {
  try {
    const rows = await queryCategories(locale);
    return rows.length > 0
      ? rows.map((row) => ({ ...row, slug: row.slug as CategorySlug }))
      : getFallbackCategories(locale);
  } catch {
    return getFallbackCategories(locale);
  }
}

export async function getLocalizedPosts(locale: Locale): Promise<LocalizedPost[]> {
  try {
    const rows = await queryPosts(locale);
    return rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt.toISOString(),
      tags: Array.isArray(row.tags) ? row.tags : [],
    }));
  } catch {
    return getFallbackPosts(locale);
  }
}

export async function getFeaturedPost(locale: Locale) {
  const localizedPosts = await getLocalizedPosts(locale);
  return localizedPosts.find((post) => post.featured) ?? null;
}

export async function getPostData(locale: Locale, slug: string) {
  const localizedPosts = await getLocalizedPosts(locale);
  const post = localizedPosts.find((item) => item.slug === slug);

  if (!post) {
    return null;
  }

  const currentIndex = localizedPosts.findIndex((item) => item.slug === slug);

  return {
    ...post,
    previous: currentIndex > 0 ? localizedPosts[currentIndex - 1] : null,
    next:
      currentIndex < localizedPosts.length - 1
        ? localizedPosts[currentIndex + 1]
        : null,
  };
}
