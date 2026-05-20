CREATE TABLE IF NOT EXISTS "post_placements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
  "scope" varchar(32) NOT NULL,
  "slot" varchar(32) NOT NULL,
  "category_id" uuid REFERENCES "categories"("id") ON DELETE cascade,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "starts_at" timestamp,
  "ends_at" timestamp,
  "enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "post_placements_scope_check" CHECK ("scope" IN ('home', 'category')),
  CONSTRAINT "post_placements_slot_check" CHECK ("slot" IN ('featured', 'promoted')),
  CONSTRAINT "post_placements_scope_category_check" CHECK (
    ("scope" = 'home' AND "category_id" IS NULL)
    OR ("scope" = 'category' AND "category_id" IS NOT NULL)
  )
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_placements_lookup_idx" ON "post_placements" USING btree (
  "scope",
  "slot",
  "category_id",
  "enabled",
  "sort_order"
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_placements_post_idx" ON "post_placements" USING btree ("post_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_placements_category_idx" ON "post_placements" USING btree ("category_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_placements_home_featured_unique" ON "post_placements" ("scope", "slot")
WHERE "scope" = 'home' AND "slot" = 'featured' AND "enabled";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_placements_category_featured_unique" ON "post_placements" ("scope", "slot", "category_id")
WHERE "scope" = 'category' AND "slot" = 'featured' AND "enabled";
--> statement-breakpoint
INSERT INTO "post_placements" ("post_id", "scope", "slot", "sort_order")
SELECT "id", 'home', 'featured', 0
FROM "posts"
WHERE coalesce("pinned", false)
  AND coalesce("status", 'published') = 'published'
  AND "deleted_at" IS NULL
  AND "published_at" IS NOT NULL
ORDER BY "published_at" DESC
LIMIT 1
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "post_placements" ("post_id", "scope", "slot", "category_id", "sort_order")
SELECT "id", 'category', 'featured', "category_id", "sort_order"
FROM (
  SELECT
    "id",
    "category_id",
    row_number() OVER (PARTITION BY "category_id" ORDER BY "published_at" DESC, "updated_at" DESC) - 1 AS "sort_order"
  FROM "posts"
  WHERE coalesce("featured", false)
    AND coalesce("status", 'published') = 'published'
    AND "deleted_at" IS NULL
    AND "published_at" IS NOT NULL
) "featured_posts"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "post_placements" ("post_id", "scope", "slot", "sort_order")
SELECT
  "id",
  'home',
  'promoted',
  row_number() OVER (ORDER BY "published_at" DESC, "updated_at" DESC) - 1
FROM "posts"
WHERE coalesce("mark", '') = 'sponsored'
  AND coalesce("status", 'published') = 'published'
  AND "deleted_at" IS NULL
  AND "published_at" IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "post_placements" ("post_id", "scope", "slot", "category_id", "sort_order")
SELECT
  "id",
  'category',
  'promoted',
  "category_id",
  row_number() OVER (PARTITION BY "category_id" ORDER BY "published_at" DESC, "updated_at" DESC) - 1
FROM "posts"
WHERE coalesce("mark", '') = 'sponsored'
  AND coalesce("status", 'published') = 'published'
  AND "deleted_at" IS NULL
  AND "published_at" IS NOT NULL
ON CONFLICT DO NOTHING;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bsvgo_readonly') THEN
    GRANT SELECT ON TABLE "post_placements" TO "bsvgo_readonly";
  END IF;
END $$;
