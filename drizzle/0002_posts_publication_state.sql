ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "status" varchar(32);
--> statement-breakpoint
UPDATE "posts" SET "status" = 'published' WHERE "status" IS NULL;
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'published';
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "status" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "published_at" DROP NOT NULL;
