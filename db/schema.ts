import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoryTranslations = pgTable(
  "category_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    locale: varchar("locale", { length: 8 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
  },
  (table) => [
    uniqueIndex("category_translations_category_locale_unique").on(
      table.categoryId,
      table.locale
    ),
  ]
);

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  featured: boolean("featured").notNull().default(false),
  pinned: boolean("pinned").notNull().default(false),
  mark: varchar("mark", { length: 20 }).notNull().default(""),
  coverImage: text("cover_image").notNull(),
  coverImageId: uuid("cover_image_id"),
  aiAuthorRole: varchar("ai_author_role", { length: 80 }),
  aiAuthorZhName: varchar("ai_author_zh_name", { length: 120 }),
  aiAuthorEnName: varchar("ai_author_en_name", { length: 120 }),
  aiAuthorAvatar: text("ai_author_avatar"),
  publishedAt: timestamp("published_at"),
  status: varchar("status", { length: 32 }).notNull().default("published"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 255 }).notNull().default(""),
  caption: text("caption").notNull().default(""),
  storageProvider: varchar("storage_provider", { length: 50 })
    .notNull()
    .default("external"),
  mimeType: varchar("mime_type", { length: 120 }),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  storageKey: text("storage_key"),
  originalFilename: varchar("original_filename", { length: 255 }),
  checksum: varchar("checksum", { length: 128 }),
  variants: jsonb("variants").notNull().default(sql`'{}'::jsonb`),
  metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),
  zhAltText: varchar("zh_alt_text", { length: 255 }).notNull().default(""),
  enAltText: varchar("en_alt_text", { length: 255 }).notNull().default(""),
  zhSeoTitle: varchar("zh_seo_title", { length: 220 }).notNull().default(""),
  zhSeoDescription: varchar("zh_seo_description", { length: 320 })
    .notNull()
    .default(""),
  enSeoTitle: varchar("en_seo_title", { length: 220 }).notNull().default(""),
  enSeoDescription: varchar("en_seo_description", { length: 320 })
    .notNull()
    .default(""),
});

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })]
);

export const postPlacements = pgTable(
  "post_placements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    scope: varchar("scope", { length: 32 }).notNull(),
    slot: varchar("slot", { length: 32 }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "cascade",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("post_placements_lookup_idx").on(
      table.scope,
      table.slot,
      table.categoryId,
      table.enabled,
      table.sortOrder
    ),
    index("post_placements_post_idx").on(table.postId),
    index("post_placements_category_idx").on(table.categoryId),
  ]
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventName: varchar("event_name", { length: 64 }).notNull(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    locale: varchar("locale", { length: 8 }),
    path: text("path").notNull(),
    referrer: text("referrer"),
    href: text("href"),
    label: text("label"),
    targetType: varchar("target_type", { length: 32 }),
    section: varchar("section", { length: 64 }),
    articleSlug: varchar("article_slug", { length: 160 }),
    categorySlug: varchar("category_slug", { length: 64 }),
    tagSlug: varchar("tag_slug", { length: 80 }),
    value: integer("value"),
    payload: jsonb("payload").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("analytics_events_event_created_idx").on(
      table.eventName,
      table.createdAt
    ),
    index("analytics_events_path_created_idx").on(table.path, table.createdAt),
    index("analytics_events_session_created_idx").on(
      table.sessionId,
      table.createdAt
    ),
  ]
);

export const postTranslations = pgTable(
  "post_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    locale: varchar("locale", { length: 8 }).notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    readingMinutes: integer("reading_minutes").notNull(),
    seoTitle: varchar("seo_title", { length: 220 }).notNull(),
    seoDescription: varchar("seo_description", { length: 320 }).notNull(),
    ogImage: text("og_image").notNull().default(""),
  },
  (table) => [
    uniqueIndex("post_translations_post_locale_unique").on(
      table.postId,
      table.locale
    ),
  ]
);

export const categoryRelations = relations(categories, ({ many }) => ({
  translations: many(categoryTranslations),
  posts: many(posts),
  placements: many(postPlacements),
}));

export const postRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  coverImageAsset: one(mediaAssets, {
    fields: [posts.coverImageId],
    references: [mediaAssets.id],
  }),
  translations: many(postTranslations),
  tags: many(postTags),
  placements: many(postPlacements),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

export const postTagRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const postPlacementRelations = relations(postPlacements, ({ one }) => ({
  post: one(posts, {
    fields: [postPlacements.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postPlacements.categoryId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostTranslation = typeof postTranslations.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type PostTag = typeof postTags.$inferSelect;
export type PostPlacement = typeof postPlacements.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
