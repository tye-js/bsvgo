CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"description" text,
	"color" varchar(32),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "category_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"locale" varchar(8) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"locale" varchar(8) NOT NULL,
	"title" varchar(220) NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"reading_minutes" integer NOT NULL,
	"seo_title" varchar(220) NOT NULL,
	"seo_description" varchar(320) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"category_id" uuid NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"cover_image" text NOT NULL,
	"published_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_unique" ON "categories" USING btree ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "category_translations_category_locale_unique" ON "category_translations" USING btree ("category_id","locale");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_translations_post_locale_unique" ON "post_translations" USING btree ("post_id","locale");
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'category_translations_category_id_categories_id_fk'
	) THEN
		ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'post_translations_post_id_posts_id_fk'
	) THEN
		ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'posts_category_id_categories_id_fk'
	) THEN
		ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
	END IF;
END $$;
