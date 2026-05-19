CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_name" varchar(64) NOT NULL,
  "visitor_id" varchar(64) NOT NULL,
  "session_id" varchar(64) NOT NULL,
  "locale" varchar(8),
  "path" text NOT NULL,
  "referrer" text,
  "href" text,
  "label" text,
  "target_type" varchar(32),
  "section" varchar(64),
  "article_slug" varchar(160),
  "category_slug" varchar(64),
  "tag_slug" varchar(80),
  "value" integer,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_event_created_idx" ON "analytics_events" USING btree ("event_name","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_path_created_idx" ON "analytics_events" USING btree ("path","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_events_session_created_idx" ON "analytics_events" USING btree ("session_id","created_at");
