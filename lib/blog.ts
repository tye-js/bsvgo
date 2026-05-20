import { cache } from "react";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  isNotNull,
  isNull,
  lt,
  ne,
  sql,
  type SQL,
} from "drizzle-orm";
import {
  categories as categoryTable,
  categoryTranslations,
  postPlacements,
  postTags,
  posts as postTable,
  postTranslations,
  tags as tagTable,
} from "@/db/schema";
import {
  getCategoryBySlug,
  posts as fallbackPostContent,
  categories as fallbackCategoryContent,
  tagToReference,
} from "./content";
import { Locale } from "./i18n";

export type LocalizedCategory = {
  slug: string;
  name: string;
  description: string;
};

export type LocalizedTagReference = {
  slug: string;
  name: string;
};

export type LocalizedPost = {
  slug: string;
  featured: boolean;
  pinned: boolean;
  mark: string;
  coverImage: string;
  publishedAt: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  excerpt: string;
  content: string;
  readingMinutes: number;
  seoTitle: string;
  seoDescription: string;
  tags: LocalizedTagReference[];
};

export type LocalizedPostWithNeighbors = LocalizedPost & {
  previous: LocalizedPost | null;
  next: LocalizedPost | null;
};

export type LocalizedTag = LocalizedTagReference & {
  count: number;
};

const fallbackCoverImages: Record<string, string> = {
  blockchain:
    "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=1600&q=80",
  ai: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  infrastructure:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
};

type RawPostRow = Omit<LocalizedPost, "publishedAt" | "tags" | "coverImage"> & {
  coverImage: string | null;
  publishedAt: Date | null;
  tags: unknown;
};

type PostQueryOptions = {
  slug?: string;
  categorySlug?: string;
  tagSlug?: string;
  excludeSlug?: string;
  featured?: boolean;
  pinned?: boolean;
  mark?: string;
  afterPublishedAt?: Date;
  beforePublishedAt?: Date;
  sort?: "newest" | "oldest";
  limit?: number;
};

type PlacementQueryOptions = {
  scope: "home" | "category";
  slot: "featured" | "promoted";
  categorySlug?: string;
  limit?: number;
};

function normalizeCoverImage(
  coverImage: string | null | undefined,
  categorySlug: string
) {
  const value = coverImage?.trim();

  if (value) {
    return value;
  }

  return fallbackCoverImages[categorySlug] ?? fallbackCoverImages.infrastructure;
}

function normalizeTags(value: unknown): LocalizedTagReference[] {
  const parsed =
    typeof value === "string"
      ? safeJsonParse<unknown>(value, [])
      : Array.isArray(value)
        ? value
        : [];
  const source = Array.isArray(parsed) ? parsed : [];

  return source
    .map((tag) => {
      if (
        tag &&
        typeof tag === "object" &&
        "slug" in tag &&
        "name" in tag &&
        typeof tag.slug === "string" &&
        typeof tag.name === "string"
      ) {
        return {
          slug: tag.slug,
          name: tag.name,
        };
      }

      return null;
    })
    .filter(Boolean) as LocalizedTagReference[];
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function logDatabaseFallback(scope: string, error: unknown) {
  console.error(`[bsvgo] Database read failed for ${scope}; using seed content.`, error);
}

function getFallbackCategory(locale: Locale, slug: string) {
  const category = getCategoryBySlug(slug);

  if (!category) {
    return null;
  }

  return {
    slug: category.slug,
    ...category.translations[locale],
  };
}

export function getFallbackCategories(locale: Locale): LocalizedCategory[] {
  return fallbackCategoryContent.map((category) => ({
    slug: category.slug,
    ...category.translations[locale],
  }));
}

export function getFallbackPosts(locale: Locale): LocalizedPost[] {
  return fallbackPostContent
    .map((post) => {
      const category = getCategoryBySlug(post.categorySlug);

      if (!category) {
        return null;
      }

      return {
        slug: post.slug,
        featured: post.featured,
        pinned: post.featured,
        mark: post.featured ? "featured" : "",
        coverImage: normalizeCoverImage(post.coverImage, post.categorySlug),
        publishedAt: post.publishedAt,
        categorySlug: post.categorySlug,
        categoryName: category.translations[locale].name,
        tags: post.tags.map(tagToReference),
        ...post.translations[locale],
      };
    })
    .filter(Boolean) as LocalizedPost[];
}

function getFallbackTags(locale: Locale): LocalizedTag[] {
  const counts = new Map<string, LocalizedTag>();

  for (const post of getFallbackPosts(locale)) {
    for (const tag of post.tags) {
      const current = counts.get(tag.slug);
      counts.set(tag.slug, {
        ...tag,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function mapPostRow(row: RawPostRow): LocalizedPost {
  return {
    ...row,
    coverImage: normalizeCoverImage(row.coverImage, row.categorySlug),
    publishedAt: row.publishedAt?.toISOString() ?? new Date().toISOString(),
    tags: normalizeTags(row.tags),
  };
}

function publishedPostConditions(locale: Locale): SQL[] {
  return [
    eq(postTranslations.locale, locale),
    eq(postTable.status, "published"),
    isNull(postTable.deletedAt),
    isNotNull(postTable.publishedAt),
  ];
}

async function queryCategories(locale: Locale) {
  const { readonlyDb } = await import("@/db");

  return readonlyDb
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

async function queryCategoryBySlug(locale: Locale, slug: string) {
  const { readonlyDb } = await import("@/db");

  return readonlyDb
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
    .where(and(eq(categoryTranslations.locale, locale), eq(categoryTable.slug, slug)))
    .limit(1);
}

async function queryPosts(locale: Locale, options: PostQueryOptions = {}) {
  const { readonlyDb } = await import("@/db");
  const conditions = publishedPostConditions(locale);

  if (options.slug) {
    conditions.push(eq(postTable.slug, options.slug));
  }

  if (options.categorySlug) {
    conditions.push(eq(categoryTable.slug, options.categorySlug));
  }

  if (options.tagSlug) {
    conditions.push(sql`exists (
      select 1
      from "post_tags" as "filter_post_tags"
      inner join "tags" as "filter_tags"
        on "filter_tags"."id" = "filter_post_tags"."tag_id"
      where "filter_post_tags"."post_id" = ${postTable.id}
        and "filter_tags"."slug" = ${options.tagSlug}
    )`);
  }

  if (options.excludeSlug) {
    conditions.push(ne(postTable.slug, options.excludeSlug));
  }

  if (typeof options.featured === "boolean") {
    conditions.push(eq(postTable.featured, options.featured));
  }

  if (typeof options.pinned === "boolean") {
    conditions.push(eq(postTable.pinned, options.pinned));
  }

  if (options.mark) {
    conditions.push(eq(postTable.mark, options.mark));
  }

  if (options.afterPublishedAt) {
    conditions.push(gt(postTable.publishedAt, options.afterPublishedAt));
  }

  if (options.beforePublishedAt) {
    conditions.push(lt(postTable.publishedAt, options.beforePublishedAt));
  }

  const query = readonlyDb
    .select({
      slug: postTable.slug,
      featured: postTable.featured,
      pinned: postTable.pinned,
      mark: postTable.mark,
      coverImage: postTable.coverImage,
      publishedAt: postTable.publishedAt,
      categorySlug: categoryTable.slug,
      categoryName: categoryTranslations.name,
      tags: sql<LocalizedTagReference[]>`coalesce(
        jsonb_agg(
          distinct jsonb_build_object(
            'slug', ${tagTable.slug},
            'name', ${tagTable.name}
          )
        ) filter (where ${tagTable.id} is not null),
        '[]'::jsonb
      )`,
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
    .where(and(...conditions))
    .groupBy(
      postTable.id,
      postTable.slug,
      postTable.featured,
      postTable.pinned,
      postTable.mark,
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
    .orderBy(
      options.sort === "oldest"
        ? asc(postTable.publishedAt)
        : desc(postTable.publishedAt)
    )
    .$dynamic();

  if (options.limit) {
    return query.limit(options.limit);
  }

  return query;
}

async function queryPlacedPosts(locale: Locale, options: PlacementQueryOptions) {
  const { readonlyDb } = await import("@/db");
  const now = new Date();
  const conditions = [
    ...publishedPostConditions(locale),
    eq(postPlacements.scope, options.scope),
    eq(postPlacements.slot, options.slot),
    eq(postPlacements.enabled, true),
    sql`(${postPlacements.startsAt} is null or ${postPlacements.startsAt} <= ${now})`,
    sql`(${postPlacements.endsAt} is null or ${postPlacements.endsAt} > ${now})`,
  ];

  if (options.scope === "home") {
    conditions.push(isNull(postPlacements.categoryId));
  }

  if (options.categorySlug) {
    conditions.push(sql`${postPlacements.categoryId} = (
      select "id" from "categories" where "slug" = ${options.categorySlug}
    )`);
  }

  const query = readonlyDb
    .select({
      slug: postTable.slug,
      featured: postTable.featured,
      pinned: postTable.pinned,
      mark: postTable.mark,
      coverImage: postTable.coverImage,
      publishedAt: postTable.publishedAt,
      categorySlug: categoryTable.slug,
      categoryName: categoryTranslations.name,
      tags: sql<LocalizedTagReference[]>`coalesce(
        jsonb_agg(
          distinct jsonb_build_object(
            'slug', ${tagTable.slug},
            'name', ${tagTable.name}
          )
        ) filter (where ${tagTable.id} is not null),
        '[]'::jsonb
      )`,
      title: postTranslations.title,
      excerpt: postTranslations.excerpt,
      content: postTranslations.content,
      readingMinutes: postTranslations.readingMinutes,
      seoTitle: postTranslations.seoTitle,
      seoDescription: postTranslations.seoDescription,
    })
    .from(postPlacements)
    .innerJoin(postTable, eq(postTable.id, postPlacements.postId))
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
    .where(and(...conditions))
    .groupBy(
      postPlacements.id,
      postPlacements.sortOrder,
      postTable.id,
      postTable.slug,
      postTable.featured,
      postTable.pinned,
      postTable.mark,
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
    .orderBy(asc(postPlacements.sortOrder), desc(postTable.publishedAt))
    .$dynamic();

  if (options.limit) {
    return query.limit(options.limit);
  }

  return query;
}

async function queryTags(locale: Locale) {
  const { readonlyDb } = await import("@/db");

  return readonlyDb
    .select({
      slug: tagTable.slug,
      name: tagTable.name,
      count: sql<number>`count(distinct ${postTable.id})::int`,
    })
    .from(tagTable)
    .innerJoin(postTags, eq(postTags.tagId, tagTable.id))
    .innerJoin(postTable, eq(postTable.id, postTags.postId))
    .innerJoin(postTranslations, eq(postTranslations.postId, postTable.id))
    .where(and(...publishedPostConditions(locale)))
    .groupBy(tagTable.id, tagTable.slug, tagTable.name)
    .orderBy(asc(tagTable.name));
}

async function queryTagBySlug(locale: Locale, slug: string) {
  const { readonlyDb } = await import("@/db");

  return readonlyDb
    .select({
      slug: tagTable.slug,
      name: tagTable.name,
      count: sql<number>`count(distinct ${postTable.id})::int`,
    })
    .from(tagTable)
    .innerJoin(postTags, eq(postTags.tagId, tagTable.id))
    .innerJoin(postTable, eq(postTable.id, postTags.postId))
    .innerJoin(postTranslations, eq(postTranslations.postId, postTable.id))
    .where(and(eq(tagTable.slug, slug), ...publishedPostConditions(locale)))
    .groupBy(tagTable.id, tagTable.slug, tagTable.name)
    .limit(1);
}

export const getLocalizedCategories = cache(
  async (locale: Locale): Promise<LocalizedCategory[]> => {
    try {
      return await queryCategories(locale);
    } catch (error) {
      logDatabaseFallback(`categories:${locale}`, error);
      return getFallbackCategories(locale);
    }
  }
);

export const getLocalizedCategoryBySlug = cache(
  async (locale: Locale, slug: string): Promise<LocalizedCategory | null> => {
    try {
      const [category] = await queryCategoryBySlug(locale, slug);
      return category ?? null;
    } catch (error) {
      logDatabaseFallback(`category:${locale}:${slug}`, error);
      return getFallbackCategory(locale, slug);
    }
  }
);

export const getLocalizedPosts = cache(
  async (locale: Locale): Promise<LocalizedPost[]> => {
    try {
      return (await queryPosts(locale)).map(mapPostRow);
    } catch (error) {
      logDatabaseFallback(`posts:${locale}`, error);
      return getFallbackPosts(locale);
    }
  }
);

export const getLocalizedPostBySlug = cache(
  async (locale: Locale, slug: string): Promise<LocalizedPost | null> => {
    try {
      const [post] = await queryPosts(locale, { slug, limit: 1 });
      return post ? mapPostRow(post) : null;
    } catch (error) {
      logDatabaseFallback(`post:${locale}:${slug}`, error);
      return getFallbackPosts(locale).find((post) => post.slug === slug) ?? null;
    }
  }
);

export const getLocalizedPostsByCategorySlug = cache(
  async (locale: Locale, slug: string): Promise<LocalizedPost[]> => {
    try {
      return (await queryPosts(locale, { categorySlug: slug })).map(mapPostRow);
    } catch (error) {
      logDatabaseFallback(`category-posts:${locale}:${slug}`, error);
      return getFallbackPosts(locale).filter((post) => post.categorySlug === slug);
    }
  }
);

export const getLocalizedPostsByTagSlug = cache(
  async (locale: Locale, slug: string): Promise<LocalizedPost[]> => {
    try {
      return (await queryPosts(locale, { tagSlug: slug })).map(mapPostRow);
    } catch (error) {
      logDatabaseFallback(`tag-posts:${locale}:${slug}`, error);
      return getFallbackPosts(locale).filter((post) =>
        post.tags.some((tag) => tag.slug === slug)
      );
    }
  }
);

export const getFeaturedPost = cache(async (locale: Locale) => {
  try {
    const [placedPost] = await queryPlacedPosts(locale, {
      scope: "home",
      slot: "featured",
      limit: 1,
    });

    if (placedPost) {
      return mapPostRow(placedPost);
    }

    const [legacyPost] = await queryPosts(locale, { pinned: true, limit: 1 });
    return legacyPost ? mapPostRow(legacyPost) : null;
  } catch (error) {
    logDatabaseFallback(`home-featured:${locale}`, error);
    try {
      const [post] = await queryPosts(locale, { pinned: true, limit: 1 });
      return post ? mapPostRow(post) : null;
    } catch {
      return getFallbackPosts(locale).find((post) => post.pinned) ?? null;
    }
  }
});

export const getSponsoredPosts = cache(
  async (locale: Locale, limit = 5): Promise<LocalizedPost[]> => {
    try {
      const placedPosts = (
        await queryPlacedPosts(locale, {
          scope: "home",
          slot: "promoted",
          limit,
        })
      ).map(mapPostRow);

      if (placedPosts.length > 0) {
        return placedPosts;
      }

      return (await queryPosts(locale, { mark: "sponsored", limit })).map(mapPostRow);
    } catch (error) {
      logDatabaseFallback(`home-promoted:${locale}`, error);
      try {
        return (await queryPosts(locale, { mark: "sponsored", limit })).map(mapPostRow);
      } catch {
        return getFallbackPosts(locale)
          .filter((post) => post.mark === "sponsored")
          .slice(0, limit);
      }
    }
  }
);

export const getCategoryFeaturedPost = cache(
  async (locale: Locale, categorySlug: string): Promise<LocalizedPost | null> => {
    try {
      const [placedPost] = await queryPlacedPosts(locale, {
        scope: "category",
        slot: "featured",
        categorySlug,
        limit: 1,
      });

      if (placedPost) {
        return mapPostRow(placedPost);
      }

      const [legacyPost] = await queryPosts(locale, {
        categorySlug,
        featured: true,
        limit: 1,
      });
      return legacyPost ? mapPostRow(legacyPost) : null;
    } catch (error) {
      logDatabaseFallback(`category-featured:${locale}:${categorySlug}`, error);
      try {
        const [post] = await queryPosts(locale, {
          categorySlug,
          featured: true,
          limit: 1,
        });
        return post ? mapPostRow(post) : null;
      } catch {
        return (
          getFallbackPosts(locale).find(
            (post) => post.categorySlug === categorySlug && post.featured
          ) ?? null
        );
      }
    }
  }
);

export const getCategoryPromotedPosts = cache(
  async (
    locale: Locale,
    categorySlug: string,
    limit = 5
  ): Promise<LocalizedPost[]> => {
    try {
      const placedPosts = (
        await queryPlacedPosts(locale, {
          scope: "category",
          slot: "promoted",
          categorySlug,
          limit,
        })
      ).map(mapPostRow);

      if (placedPosts.length > 0) {
        return placedPosts;
      }

      return (
        await queryPosts(locale, {
          categorySlug,
          mark: "sponsored",
          limit,
        })
      ).map(mapPostRow);
    } catch (error) {
      logDatabaseFallback(`category-promoted:${locale}:${categorySlug}`, error);
      try {
        return (
          await queryPosts(locale, {
            categorySlug,
            mark: "sponsored",
            limit,
          })
        ).map(mapPostRow);
      } catch {
        return getFallbackPosts(locale)
          .filter(
            (post) =>
              post.categorySlug === categorySlug && post.mark === "sponsored"
          )
          .slice(0, limit);
      }
    }
  }
);

export const getLocalizedTags = cache(
  async (locale: Locale): Promise<LocalizedTag[]> => {
    try {
      return await queryTags(locale);
    } catch (error) {
      logDatabaseFallback(`tags:${locale}`, error);
      return getFallbackTags(locale);
    }
  }
);

export const getLocalizedTagBySlug = cache(
  async (locale: Locale, slug: string): Promise<LocalizedTag | null> => {
    try {
      const [tag] = await queryTagBySlug(locale, slug);
      return tag ?? null;
    } catch (error) {
      logDatabaseFallback(`tag:${locale}:${slug}`, error);
      return getFallbackTags(locale).find((tag) => tag.slug === slug) ?? null;
    }
  }
);

export const getRelatedPosts = cache(
  async (locale: Locale, slug: string, limit = 3) => {
    const current = await getLocalizedPostBySlug(locale, slug);

    if (!current) {
      return [];
    }

    try {
      const candidates = (
        await queryPosts(locale, {
          excludeSlug: slug,
          categorySlug: current.categorySlug,
          limit: Math.max(limit * 3, limit),
        })
      ).map(mapPostRow);
      const tagSlugs = new Set(current.tags.map((tag) => tag.slug));
      const scored = candidates
        .map((post) => {
          const sharedTags = post.tags.filter((tag) => tagSlugs.has(tag.slug)).length;
          const sharedCategory = post.categorySlug === current.categorySlug ? 1 : 0;
          const featuredBoost = post.featured ? 1 : 0;

          return {
            post,
            score: sharedTags * 3 + sharedCategory * 2 + featuredBoost,
          };
        })
        .filter((entry) => entry.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            b.post.publishedAt.localeCompare(a.post.publishedAt)
        )
        .slice(0, limit)
        .map((entry) => entry.post);

      if (scored.length > 0) {
        return scored;
      }

      return (
        await queryPosts(locale, {
          excludeSlug: slug,
          limit,
        })
      ).map(mapPostRow);
    } catch (error) {
      logDatabaseFallback(`related:${locale}:${slug}`, error);
    }

    return getFallbackPosts(locale)
      .filter((post) => post.slug !== slug)
      .slice(0, limit);
  }
);

export const getPostData = cache(
  async (
    locale: Locale,
    slug: string
  ): Promise<LocalizedPostWithNeighbors | null> => {
    const post = await getLocalizedPostBySlug(locale, slug);

    if (!post) {
      return null;
    }

    try {
      const publishedAt = new Date(post.publishedAt);
      const [[previous], [next]] = await Promise.all([
        queryPosts(locale, {
          afterPublishedAt: publishedAt,
          sort: "oldest",
          limit: 1,
        }),
        queryPosts(locale, {
          beforePublishedAt: publishedAt,
          sort: "newest",
          limit: 1,
        }),
      ]);

      return {
        ...post,
        previous: previous ? mapPostRow(previous) : null,
        next: next ? mapPostRow(next) : null,
      };
    } catch (error) {
      logDatabaseFallback(`post-neighbors:${locale}:${slug}`, error);
      const localizedPosts = getFallbackPosts(locale);
      const currentIndex = localizedPosts.findIndex((item) => item.slug === slug);

      return {
        ...post,
        previous: currentIndex > 0 ? localizedPosts[currentIndex - 1] : null,
        next:
          currentIndex >= 0 && currentIndex < localizedPosts.length - 1
            ? localizedPosts[currentIndex + 1]
            : null,
      };
    }
  }
);
