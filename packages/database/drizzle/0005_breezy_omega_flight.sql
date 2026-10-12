ALTER TABLE "menu_items" ADD COLUMN "estimated_prep_time" integer DEFAULT 15;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "stock_quantity" integer;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "is_stock_tracked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "estimated_prep_time" integer DEFAULT 15;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "estimated_prep_time" integer DEFAULT 15;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "prep_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ready_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "served_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "inventory_deducted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "inventory_restored" boolean DEFAULT false;