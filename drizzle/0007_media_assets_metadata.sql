CREATE TABLE IF NOT EXISTS "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt_text" varchar(255) DEFAULT '' NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"storage_provider" varchar(50) DEFAULT 'external' NOT NULL,
	"mime_type" varchar(120),
	"width" integer,
	"height" integer,
	"file_size" integer,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"storage_key" text,
	"original_filename" varchar(255),
	"checksum" varchar(128),
	"variants" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"zh_alt_text" varchar(255) DEFAULT '' NOT NULL,
	"en_alt_text" varchar(255) DEFAULT '' NOT NULL,
	"zh_seo_title" varchar(220) DEFAULT '' NOT NULL,
	"zh_seo_description" varchar(320) DEFAULT '' NOT NULL,
	"en_seo_title" varchar(220) DEFAULT '' NOT NULL,
	"en_seo_description" varchar(320) DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "cover_image_id" uuid;
--> statement-breakpoint
ALTER TABLE "post_translations" ADD COLUMN IF NOT EXISTS "og_image" text DEFAULT '' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_cover_image_id_idx" ON "posts" USING btree ("cover_image_id");
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'posts_cover_image_id_media_assets_id_fk'
	) THEN
		ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_assets_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
	END IF;
END $$;
