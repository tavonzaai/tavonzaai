ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "is_popular" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "menu_items_popular_idx" ON "menu_items" USING btree ("is_popular");