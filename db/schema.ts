import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
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

export const categoryTranslations = pgTable("category_translations", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  locale: varchar("locale", { length: 8 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  featured: boolean("featured").notNull().default(false),
  coverImage: text("cover_image").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
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

export const postTranslations = pgTable("post_translations", {
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
});

export const categoryRelations = relations(categories, ({ many }) => ({
  translations: many(categoryTranslations),
  posts: many(posts),
}));

export const postRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  translations: many(postTranslations),
  tags: many(postTags),
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

export type Category = typeof categories.$inferSelect;
export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostTranslation = typeof postTranslations.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type PostTag = typeof postTags.$inferSelect;
