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
  analyticsEvents,
  mediaAssets,
  postPlacements,
  postTags,
  posts as postTable,
  postTranslations,
  tags as tagTable,
  topicCollectionPosts,
  topicCollections,
  topicCollectionTranslations,
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
  aiAuthorRole: string | null;
  aiAuthorName: string | null;
  aiAuthorAvatar: string | null;
  publishedAt: string;
  updatedAt: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  excerpt: string;
  content: string;
  readingMinutes: number;
  seoTitle: string;
  seoDescription: string;
  coverImageAlt: string;
  coverImageSeoTitle: string;
  coverImageSeoDescription: string;
  ogImage: string;
  tags: LocalizedTagReference[];
};

export type LocalizedPostWithNeighbors = LocalizedPost & {
  previous: LocalizedPost | null;
  next: LocalizedPost | null;
};

export type LocalizedTag = LocalizedTagReference & {
  count: number;
};

export type LocalizedCollection = {
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  coverImage: string;
  coverImageAlt: string;
  fallbackCoverImage: string;
  fallbackCoverImageAlt: string;
  postCount: number;
  updatedAt: string;
};

export type LocalizedCollectionWithPosts = LocalizedCollection & {
  posts: LocalizedPost[];
};

export type PostCollectionLink = LocalizedCollection & {
  currentIndex: number;
  posts: LocalizedPost[];
  previousPost: LocalizedPost | null;
  nextPost: LocalizedPost | null;
};

const fallbackCoverImages: Record<string, string> = {
  blockchain:
    "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=1600&q=80",
  ai: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
  infrastructure:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
};

type RawPostRow = Omit<
  LocalizedPost,
  | "publishedAt"
  | "updatedAt"
  | "tags"
  | "coverImage"
  | "coverImageAlt"
  | "coverImageSeoTitle"
  | "coverImageSeoDescription"
  | "ogImage"
> & {
  coverImage: string | null;
  coverImageAlt: string | null;
  coverImageSeoTitle: string | null;
  coverImageSeoDescription: string | null;
  ogImage: string | null;
  publishedAt: Date | null;
  updatedAt: Date | null;
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
  search?: string;
  sort?: "newest" | "oldest";
  limit?: number;
};

export type PostSearchOptions = {
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
};

type PlacementQueryOptions = {
  scope: "home" | "category";
  slot: "featured" | "promoted";
  categorySlug?: string;
  limit?: number;
};

type TrendingPostRow = {
  slug: string;
  views: number;
};

type RawCollectionRow = Omit<
  LocalizedCollection,
  | "updatedAt"
  | "postCount"
  | "coverImage"
  | "coverImageAlt"
  | "fallbackCoverImage"
  | "fallbackCoverImageAlt"
> & {
  coverImage: string | null;
  coverImageAlt: string | null;
  fallbackCoverImage: string | null;
  fallbackCoverImageAlt: string | null;
  postCount: number | string | null;
  updatedAt: Date | null;
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

function normalizeText(value: string | null | undefined, fallback: string) {
  const text = value?.trim();
  return text || fallback;
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
      const translation = post.translations[locale];

      if (!category) {
        return null;
      }

      return {
        slug: post.slug,
        featured: post.featured,
        pinned: post.featured,
        mark: post.featured ? "featured" : "",
        coverImage: normalizeCoverImage(post.coverImage, post.categorySlug),
        aiAuthorRole: null,
        aiAuthorName: null,
        aiAuthorAvatar: null,
        publishedAt: post.publishedAt,
        updatedAt: post.publishedAt,
        categorySlug: post.categorySlug,
        categoryName: category.translations[locale].name,
        tags: post.tags.map(tagToReference),
        ...translation,
        coverImageAlt: translation.title,
        coverImageSeoTitle: translation.title,
        coverImageSeoDescription: translation.excerpt,
        ogImage: "",
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
    coverImageAlt: normalizeText(row.coverImageAlt, row.title),
    coverImageSeoTitle: normalizeText(row.coverImageSeoTitle, row.title),
    coverImageSeoDescription: normalizeText(
      row.coverImageSeoDescription,
      row.excerpt
    ),
    ogImage: row.ogImage?.trim() ?? "",
    publishedAt: row.publishedAt?.toISOString() ?? new Date().toISOString(),
    updatedAt:
      row.updatedAt?.toISOString() ??
      row.publishedAt?.toISOString() ??
      new Date().toISOString(),
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

function postSelectFields(locale: Locale) {
  return {
    slug: postTable.slug,
    featured: postTable.featured,
    pinned: postTable.pinned,
    mark: postTable.mark,
    coverImage: postTable.coverImage,
    aiAuthorRole: postTable.aiAuthorRole,
    aiAuthorName:
      locale === "zh" ? postTable.aiAuthorZhName : postTable.aiAuthorEnName,
    aiAuthorAvatar: postTable.aiAuthorAvatar,
    publishedAt: postTable.publishedAt,
    updatedAt: postTable.updatedAt,
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
    coverImageAlt:
      locale === "zh" ? mediaAssets.zhAltText : mediaAssets.enAltText,
    coverImageSeoTitle:
      locale === "zh" ? mediaAssets.zhSeoTitle : mediaAssets.enSeoTitle,
    coverImageSeoDescription:
      locale === "zh"
        ? mediaAssets.zhSeoDescription
        : mediaAssets.enSeoDescription,
    ogImage: postTranslations.ogImage,
  };
}

function postGroupByColumns() {
  return [
    postTable.id,
    postTable.slug,
    postTable.featured,
    postTable.pinned,
    postTable.mark,
    postTable.coverImage,
    postTable.aiAuthorRole,
    postTable.aiAuthorZhName,
    postTable.aiAuthorEnName,
    postTable.aiAuthorAvatar,
    postTable.publishedAt,
    postTable.updatedAt,
    categoryTable.slug,
    categoryTranslations.name,
    postTranslations.title,
    postTranslations.excerpt,
    postTranslations.content,
    postTranslations.readingMinutes,
    postTranslations.seoTitle,
    postTranslations.seoDescription,
    postTranslations.ogImage,
    mediaAssets.zhAltText,
    mediaAssets.enAltText,
    mediaAssets.zhSeoTitle,
    mediaAssets.enSeoTitle,
    mediaAssets.zhSeoDescription,
    mediaAssets.enSeoDescription,
  ] as const;
}

function mapPostRows(rows: RawPostRow[]) {
  return rows.map(mapPostRow);
}

function mapCollectionRow(row: RawCollectionRow): LocalizedCollection {
  const fallbackCoverImage = normalizeCoverImage(
    row.fallbackCoverImage,
    "infrastructure"
  );
  const coverImage = row.coverImage?.trim() || fallbackCoverImage;

  return {
    ...row,
    coverImage,
    coverImageAlt: normalizeText(
      row.coverImageAlt || row.fallbackCoverImageAlt,
      row.title
    ),
    fallbackCoverImage,
    fallbackCoverImageAlt: normalizeText(row.fallbackCoverImageAlt, row.title),
    postCount: Number(row.postCount) || 0,
    updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function collectionSelectFields(locale: Locale) {
  return {
    slug: topicCollections.slug,
    title: topicCollectionTranslations.title,
    description: topicCollectionTranslations.description,
    seoTitle: topicCollectionTranslations.seoTitle,
    seoDescription: topicCollectionTranslations.seoDescription,
    coverImage: mediaAssets.url,
    coverImageAlt:
      locale === "zh" ? mediaAssets.zhAltText : mediaAssets.enAltText,
    fallbackCoverImage: sql<string | null>`(
      select first_post.cover_image
      from topic_collection_posts as first_tcp
      inner join posts as first_post
        on first_post.id = first_tcp.post_id
      inner join post_translations as first_post_translation
        on first_post_translation.post_id = first_post.id
        and first_post_translation.locale = ${locale}
      where first_tcp.collection_id = ${topicCollections.id}
        and first_post.status = 'published'
        and first_post.deleted_at is null
        and first_post.published_at is not null
      order by first_tcp.sort_order asc, first_post.published_at desc
      limit 1
    )`,
    fallbackCoverImageAlt: sql<string | null>`(
      select coalesce(
        ${locale === "zh" ? sql`first_media.zh_alt_text` : sql`first_media.en_alt_text`},
        first_post_translation.title
      )
      from topic_collection_posts as first_tcp
      inner join posts as first_post
        on first_post.id = first_tcp.post_id
      inner join post_translations as first_post_translation
        on first_post_translation.post_id = first_post.id
        and first_post_translation.locale = ${locale}
      left join media_assets as first_media
        on first_media.id = first_post.cover_image_id
      where first_tcp.collection_id = ${topicCollections.id}
        and first_post.status = 'published'
        and first_post.deleted_at is null
        and first_post.published_at is not null
      order by first_tcp.sort_order asc, first_post.published_at desc
      limit 1
    )`,
    postCount: sql<number>`(
      select count(distinct tcp_count.post_id)::int
      from topic_collection_posts as tcp_count
      inner join posts as post_count
        on post_count.id = tcp_count.post_id
      inner join post_translations as post_translation_count
        on post_translation_count.post_id = post_count.id
        and post_translation_count.locale = ${locale}
      where tcp_count.collection_id = ${topicCollections.id}
        and post_count.status = 'published'
        and post_count.deleted_at is null
        and post_count.published_at is not null
    )`,
    updatedAt: topicCollections.updatedAt,
  };
}

function publishedCollectionConditions(locale: Locale): SQL[] {
  return [
    eq(topicCollectionTranslations.locale, locale),
    eq(topicCollections.status, "published"),
    isNull(topicCollections.deletedAt),
  ];
}

async function queryCollections(locale: Locale, limit?: number) {
  const { readonlyDb } = await import("@/db");
  const query = readonlyDb
    .select(collectionSelectFields(locale))
    .from(topicCollections)
    .innerJoin(
      topicCollectionTranslations,
      eq(topicCollectionTranslations.collectionId, topicCollections.id)
    )
    .leftJoin(mediaAssets, eq(mediaAssets.id, topicCollections.coverImageId))
    .where(and(...publishedCollectionConditions(locale)))
    .orderBy(asc(topicCollections.sortOrder), desc(topicCollections.updatedAt))
    .$dynamic();

  if (limit) {
    return query.limit(limit);
  }

  return query;
}

async function queryCollectionBySlug(locale: Locale, slug: string) {
  const { readonlyDb } = await import("@/db");

  return readonlyDb
    .select(collectionSelectFields(locale))
    .from(topicCollections)
    .innerJoin(
      topicCollectionTranslations,
      eq(topicCollectionTranslations.collectionId, topicCollections.id)
    )
    .leftJoin(mediaAssets, eq(mediaAssets.id, topicCollections.coverImageId))
    .where(
      and(eq(topicCollections.slug, slug), ...publishedCollectionConditions(locale))
    )
    .limit(1);
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

  const search = options.search?.trim();

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(sql`(
      ${postTranslations.title} ilike ${pattern}
      or ${postTranslations.excerpt} ilike ${pattern}
      or ${categoryTranslations.name} ilike ${pattern}
      or exists (
        select 1
        from "post_tags" as "search_post_tags"
        inner join "tags" as "search_tags"
          on "search_tags"."id" = "search_post_tags"."tag_id"
        where "search_post_tags"."post_id" = ${postTable.id}
          and "search_tags"."name" ilike ${pattern}
      )
    )`);
  }

  const query = readonlyDb
    .select(postSelectFields(locale))
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
    .leftJoin(mediaAssets, eq(mediaAssets.id, postTable.coverImageId))
    .leftJoin(postTags, eq(postTags.postId, postTable.id))
    .leftJoin(tagTable, eq(tagTable.id, postTags.tagId))
    .where(and(...conditions))
    .groupBy(...postGroupByColumns())
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
  const now = new Date().toISOString();
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
    .select(postSelectFields(locale))
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
    .leftJoin(mediaAssets, eq(mediaAssets.id, postTable.coverImageId))
    .leftJoin(postTags, eq(postTags.postId, postTable.id))
    .leftJoin(tagTable, eq(tagTable.id, postTags.tagId))
    .where(and(...conditions))
    .groupBy(
      postPlacements.id,
      postPlacements.sortOrder,
      ...postGroupByColumns()
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

async function queryCollectionPosts(locale: Locale, collectionSlug: string) {
  const { readonlyDb } = await import("@/db");

  return readonlyDb
    .select(postSelectFields(locale))
    .from(topicCollectionPosts)
    .innerJoin(
      topicCollections,
      eq(topicCollections.id, topicCollectionPosts.collectionId)
    )
    .innerJoin(
      topicCollectionTranslations,
      eq(topicCollectionTranslations.collectionId, topicCollections.id)
    )
    .innerJoin(postTable, eq(postTable.id, topicCollectionPosts.postId))
    .innerJoin(categoryTable, eq(categoryTable.id, postTable.categoryId))
    .innerJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categoryTable.id),
        eq(categoryTranslations.locale, locale)
      )
    )
    .innerJoin(postTranslations, eq(postTranslations.postId, postTable.id))
    .leftJoin(mediaAssets, eq(mediaAssets.id, postTable.coverImageId))
    .leftJoin(postTags, eq(postTags.postId, postTable.id))
    .leftJoin(tagTable, eq(tagTable.id, postTags.tagId))
    .where(
      and(
        eq(topicCollections.slug, collectionSlug),
        ...publishedCollectionConditions(locale),
        ...publishedPostConditions(locale)
      )
    )
    .groupBy(
      topicCollectionPosts.sortOrder,
      topicCollectionPosts.createdAt,
      ...postGroupByColumns()
    )
    .orderBy(asc(topicCollectionPosts.sortOrder), desc(postTable.publishedAt));
}

async function queryCollectionsForPost(locale: Locale, postSlug: string) {
  const { readonlyDb } = await import("@/db");

  return readonlyDb
    .select(collectionSelectFields(locale))
    .from(topicCollectionPosts)
    .innerJoin(
      topicCollections,
      eq(topicCollections.id, topicCollectionPosts.collectionId)
    )
    .innerJoin(postTable, eq(postTable.id, topicCollectionPosts.postId))
    .innerJoin(
      topicCollectionTranslations,
      eq(topicCollectionTranslations.collectionId, topicCollections.id)
    )
    .innerJoin(postTranslations, eq(postTranslations.postId, postTable.id))
    .leftJoin(mediaAssets, eq(mediaAssets.id, topicCollections.coverImageId))
    .where(
      and(
        eq(postTable.slug, postSlug),
        ...publishedCollectionConditions(locale),
        ...publishedPostConditions(locale)
      )
    )
    .orderBy(asc(topicCollections.sortOrder), desc(topicCollections.updatedAt));
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

async function queryTrendingPostViews(locale: Locale, slugs: string[]) {
  if (slugs.length === 0) {
    return new Map<string, number>();
  }

  const { readonlyDb } = await import("@/db");
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const rows = await readonlyDb.execute(sql<TrendingPostRow>`
    select
      ${analyticsEvents.articleSlug} as slug,
      count(*)::int as views
    from ${analyticsEvents}
    where ${analyticsEvents.eventName} = 'article_view'
      and ${analyticsEvents.locale} = ${locale}
      and ${analyticsEvents.createdAt} >= ${since}
      and ${analyticsEvents.articleSlug} = any(${slugs})
    group by ${analyticsEvents.articleSlug}
  `);

  return new Map(rows.map((row) => [row.slug, Number(row.views) || 0]));
}

async function queryRelatedCollectionPosts(locale: Locale, postSlug: string) {
  const collections = (await queryCollectionsForPost(locale, postSlug)).map(
    mapCollectionRow
  );
  const relatedPosts: LocalizedPost[] = [];

  for (const collection of collections) {
    const posts = mapPostRows(await queryCollectionPosts(locale, collection.slug));
    const currentIndex = posts.findIndex((post) => post.slug === postSlug);

    if (currentIndex < 0) {
      continue;
    }

    relatedPosts.push(
      ...posts
        .filter((post) => post.slug !== postSlug)
        .map((post, index) => {
          const originalIndex =
            index >= currentIndex ? index + 1 : index;

          return {
            post,
            distance: Math.abs(originalIndex - currentIndex),
            direction: originalIndex > currentIndex ? 0 : 1,
            originalIndex,
          };
        })
        .sort(
          (a, b) =>
            a.distance - b.distance ||
            a.direction - b.direction ||
            a.originalIndex - b.originalIndex
        )
        .map((entry) => entry.post)
    );
  }

  const uniquePosts = new Map<string, LocalizedPost>();

  for (const post of relatedPosts) {
    uniquePosts.set(post.slug, post);
  }

  return [...uniquePosts.values()];
}

function appendUniquePosts({
  target,
  candidates,
  usedSlugs,
  limit,
}: {
  target: LocalizedPost[];
  candidates: LocalizedPost[];
  usedSlugs: Set<string>;
  limit: number;
}) {
  for (const post of candidates) {
    if (target.length >= limit) {
      break;
    }

    if (usedSlugs.has(post.slug)) {
      continue;
    }

    target.push(post);
    usedSlugs.add(post.slug);
  }
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
      return mapPostRows(await queryPosts(locale));
    } catch (error) {
      logDatabaseFallback(`posts:${locale}`, error);
      return getFallbackPosts(locale);
    }
  }
);

export const getLocalizedCollections = cache(
  async (locale: Locale, limit?: number): Promise<LocalizedCollection[]> => {
    try {
      return (await queryCollections(locale, limit)).map(mapCollectionRow);
    } catch (error) {
      logDatabaseFallback(`collections:${locale}`, error);
      return [];
    }
  }
);

export const getLocalizedCollectionBySlug = cache(
  async (
    locale: Locale,
    slug: string
  ): Promise<LocalizedCollectionWithPosts | null> => {
    try {
      const [collection] = await queryCollectionBySlug(locale, slug);

      if (!collection) {
        return null;
      }

      return {
        ...mapCollectionRow(collection),
        posts: mapPostRows(await queryCollectionPosts(locale, slug)),
      };
    } catch (error) {
      logDatabaseFallback(`collection:${locale}:${slug}`, error);
      return null;
    }
  }
);

export const getPostCollections = cache(
  async (locale: Locale, postSlug: string): Promise<PostCollectionLink[]> => {
    try {
      const collections = (await queryCollectionsForPost(locale, postSlug)).map(
        mapCollectionRow
      );
      const links: PostCollectionLink[] = [];

      for (const collection of collections) {
        const posts = mapPostRows(await queryCollectionPosts(locale, collection.slug));
        const currentIndex = posts.findIndex((post) => post.slug === postSlug);

        if (currentIndex < 0) {
          continue;
        }

        links.push({
          ...collection,
          currentIndex,
          posts,
          previousPost: posts[currentIndex - 1] ?? null,
          nextPost: posts[currentIndex + 1] ?? null,
        });
      }

      return links;
    } catch (error) {
      logDatabaseFallback(`post-collections:${locale}:${postSlug}`, error);
      return [];
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
      return mapPostRows(await queryPosts(locale, { categorySlug: slug }));
    } catch (error) {
      logDatabaseFallback(`category-posts:${locale}:${slug}`, error);
      return getFallbackPosts(locale).filter((post) => post.categorySlug === slug);
    }
  }
);

export const getLocalizedPostsByTagSlug = cache(
  async (locale: Locale, slug: string): Promise<LocalizedPost[]> => {
    try {
      return mapPostRows(await queryPosts(locale, { tagSlug: slug }));
    } catch (error) {
      logDatabaseFallback(`tag-posts:${locale}:${slug}`, error);
      return getFallbackPosts(locale).filter((post) =>
        post.tags.some((tag) => tag.slug === slug)
      );
    }
  }
);

export const searchLocalizedPosts = cache(
  async (
    locale: Locale,
    options: PostSearchOptions = {}
  ): Promise<LocalizedPost[]> => {
    const search = options.search?.trim();
    const categorySlug = options.categorySlug?.trim();
    const tagSlug = options.tagSlug?.trim();

    try {
      return mapPostRows(
        await queryPosts(locale, {
          search,
          categorySlug: categorySlug || undefined,
          tagSlug: tagSlug || undefined,
        })
      );
    } catch (error) {
      logDatabaseFallback(`search:${locale}`, error);
      const needle = search?.toLowerCase();

      return getFallbackPosts(locale).filter((post) => {
        const matchesCategory =
          !categorySlug || post.categorySlug === categorySlug;
        const matchesTag =
          !tagSlug || post.tags.some((tag) => tag.slug === tagSlug);
        const matchesSearch =
          !needle ||
          [
            post.title,
            post.excerpt,
            post.categoryName,
            ...post.tags.map((tag) => tag.name),
          ]
            .join(" ")
            .toLowerCase()
            .includes(needle);

        return matchesCategory && matchesTag && matchesSearch;
      });
    }
  }
);

async function queryPlacementWithLegacy(
  locale: Locale,
  placementOptions: PlacementQueryOptions,
  legacyOptions: PostQueryOptions,
  scope: string
) {
  let placedPosts: RawPostRow[] = [];

  try {
    placedPosts = await queryPlacedPosts(locale, placementOptions);
  } catch (error) {
    logDatabaseFallback(`${scope}:placements`, error);
  }

  if (placedPosts.length > 0) {
    return placedPosts;
  }

  return queryPosts(locale, legacyOptions);
}

export const getFeaturedPost = cache(async (locale: Locale) => {
  try {
    const [post] = await queryPlacementWithLegacy(
      locale,
      {
        scope: "home",
        slot: "featured",
        limit: 1,
      },
      { pinned: true, limit: 1 },
      `home-featured:${locale}`
    );

    return post ? mapPostRow(post) : null;
  } catch (error) {
    logDatabaseFallback(`home-featured:${locale}`, error);
    return getFallbackPosts(locale).find((post) => post.pinned) ?? null;
  }
});

export const getSponsoredPosts = cache(
  async (locale: Locale, limit = 5): Promise<LocalizedPost[]> => {
    try {
      return mapPostRows(
        await queryPlacementWithLegacy(
          locale,
          {
            scope: "home",
            slot: "promoted",
            limit,
          },
          { mark: "sponsored", limit },
          `home-promoted:${locale}`
        )
      );
    } catch (error) {
      logDatabaseFallback(`home-promoted:${locale}`, error);
      return getFallbackPosts(locale)
        .filter((post) => post.mark === "sponsored")
        .slice(0, limit);
    }
  }
);

export const getCategoryFeaturedPost = cache(
  async (locale: Locale, categorySlug: string): Promise<LocalizedPost | null> => {
    try {
      const [post] = await queryPlacementWithLegacy(
        locale,
        {
          scope: "category",
          slot: "featured",
          categorySlug,
          limit: 1,
        },
        {
          categorySlug,
          featured: true,
          limit: 1,
        },
        `category-featured:${locale}:${categorySlug}`
      );

      return post ? mapPostRow(post) : null;
    } catch (error) {
      logDatabaseFallback(`category-featured:${locale}:${categorySlug}`, error);
      return (
        getFallbackPosts(locale).find(
          (post) => post.categorySlug === categorySlug && post.featured
        ) ?? null
      );
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
      return mapPostRows(
        await queryPlacementWithLegacy(
          locale,
          {
            scope: "category",
            slot: "promoted",
            categorySlug,
            limit,
          },
          {
            categorySlug,
            mark: "sponsored",
            limit,
          },
          `category-promoted:${locale}:${categorySlug}`
        )
      );
    } catch (error) {
      logDatabaseFallback(`category-promoted:${locale}:${categorySlug}`, error);
      return getFallbackPosts(locale)
        .filter(
          (post) =>
            post.categorySlug === categorySlug && post.mark === "sponsored"
        )
        .slice(0, limit);
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
      const relatedPosts: LocalizedPost[] = [];
      const usedSlugs = new Set([slug]);
      const collectionCandidates = await queryRelatedCollectionPosts(
        locale,
        slug
      ).catch((error) => {
        logDatabaseFallback(`related-collections:${locale}:${slug}`, error);
        return [];
      });
      appendUniquePosts({
        target: relatedPosts,
        candidates: collectionCandidates,
        usedSlugs,
        limit,
      });

      if (relatedPosts.length >= limit) {
        return relatedPosts;
      }

      const tagSlugs = new Set(current.tags.map((tag) => tag.slug));
      const now = Date.now();
      const tagGroups = await Promise.all(
        current.tags.slice(0, 4).map((tag) =>
          queryPosts(locale, {
            excludeSlug: slug,
            tagSlug: tag.slug,
            limit: Math.max(limit * 3, 9),
          })
        )
      ).catch((error) => {
        logDatabaseFallback(`related-tags:${locale}:${slug}`, error);
        return [];
      });
      const tagCandidatesBySlug = new Map<string, LocalizedPost>();

      for (const post of mapPostRows(tagGroups.flat())) {
        if (!usedSlugs.has(post.slug)) {
          tagCandidatesBySlug.set(post.slug, post);
        }
      }

      const tagCandidates = [...tagCandidatesBySlug.values()];
      const tagTrendingViews = await queryTrendingPostViews(
        locale,
        tagCandidates.map((post) => post.slug)
      ).catch((error) => {
        logDatabaseFallback(`related-tag-trending:${locale}:${slug}`, error);
        return new Map<string, number>();
      });
      const scoredTagCandidates = tagCandidates
        .map((post) => {
          const sharedTags = post.tags.filter((tag) => tagSlugs.has(tag.slug)).length;
          const ageDays = Math.max(
            0,
            (now - new Date(post.publishedAt).getTime()) / (24 * 60 * 60 * 1000)
          );
          const freshnessBoost = Math.max(0, 2 - ageDays / 30);

          return {
            post,
            score:
              sharedTags * 6 +
              Math.min(4, Math.log1p(tagTrendingViews.get(post.slug) ?? 0)) +
              freshnessBoost * 0.35,
          };
        })
        .filter((entry) => entry.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            b.post.publishedAt.localeCompare(a.post.publishedAt)
        )
        .map((entry) => entry.post);

      appendUniquePosts({
        target: relatedPosts,
        candidates: scoredTagCandidates,
        usedSlugs,
        limit,
      });

      if (relatedPosts.length >= limit) {
        return relatedPosts;
      }

      const [categoryCandidates, recentCandidates, promotedCandidates] =
        await Promise.all([
          queryPosts(locale, {
            excludeSlug: slug,
            categorySlug: current.categorySlug,
            limit: Math.max(limit * 4, 12),
          }),
          queryPosts(locale, {
            excludeSlug: slug,
            limit: Math.max(limit * 4, 12),
          }),
          queryPlacedPosts(locale, {
            scope: "category",
            slot: "promoted",
            categorySlug: current.categorySlug,
            limit: Math.max(limit * 2, 6),
          }).catch(() => []),
        ]);
      const candidatesBySlug = new Map<string, LocalizedPost>();

      for (const post of mapPostRows([
        ...promotedCandidates,
        ...categoryCandidates,
        ...recentCandidates,
      ])) {
        if (!usedSlugs.has(post.slug)) {
          candidatesBySlug.set(post.slug, post);
        }
      }

      const candidates = [...candidatesBySlug.values()];
      const trendingViews = await queryTrendingPostViews(
        locale,
        candidates.map((post) => post.slug)
      ).catch((error) => {
        logDatabaseFallback(`related-trending:${locale}:${slug}`, error);
        return new Map<string, number>();
      });
      const promotedSlugs = new Set(
        mapPostRows(promotedCandidates).map((post) => post.slug)
      );
      const scored = candidates
        .map((post) => {
          const sharedTags = post.tags.filter((tag) => tagSlugs.has(tag.slug)).length;
          const sharedCategory = post.categorySlug === current.categorySlug ? 1 : 0;
          const featuredBoost = post.featured ? 1 : 0;
          const promotedBoost = promotedSlugs.has(post.slug) ? 2 : 0;
          const viewBoost = Math.min(4, Math.log1p(trendingViews.get(post.slug) ?? 0));
          const ageDays = Math.max(
            0,
            (now - new Date(post.publishedAt).getTime()) / (24 * 60 * 60 * 1000)
          );
          const freshnessBoost = Math.max(0, 2 - ageDays / 30);

          return {
            post,
            score:
              sharedTags * 6 +
              sharedCategory * 2 +
              featuredBoost +
              promotedBoost +
              viewBoost +
              freshnessBoost * 0.35,
          };
        })
        .filter((entry) => entry.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            b.post.publishedAt.localeCompare(a.post.publishedAt)
        )
        .map((entry) => entry.post);

      appendUniquePosts({
        target: relatedPosts,
        candidates: scored,
        usedSlugs,
        limit,
      });

      const fallbackPosts = mapPostRows(
        await queryPosts(locale, {
          excludeSlug: slug,
          limit: Math.max(limit * 2, 6),
        })
      );

      appendUniquePosts({
        target: relatedPosts,
        candidates: fallbackPosts,
        usedSlugs,
        limit,
      });

      return relatedPosts;
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
