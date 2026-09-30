CREATE TABLE IF NOT EXISTS "menu_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "menu_item_add_ons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"prep_time" integer,
	"calories" integer,
	"is_vegetarian" boolean DEFAULT false NOT NULL,
	"is_vegan" boolean DEFAULT false NOT NULL,
	"is_gluten_free" boolean DEFAULT false NOT NULL,
	"allergens" text,
	"wine_pairing" text,
	"wine_pairing_note" text,
	"rating" numeric(2, 1),
	"rating_count" integer DEFAULT 0 NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"name" text NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"special_instructions" text,
	"add_ons" json,
	"add_ons_total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"line_total" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"branch_id" uuid NOT NULL,
	"table_id" uuid NOT NULL,
	"table_session_id" uuid,
	"customer_session_id" uuid,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"service_charge_rate" numeric(4, 2) DEFAULT '0.05' NOT NULL,
	"service_charge" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_rate" numeric(4, 2) DEFAULT '0.08' NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"estimated_prep_time" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"accepted_at" timestamp,
	"ready_at" timestamp,
	"served_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otp_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"permissions" text[] DEFAULT '{}' NOT NULL,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"organization_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_session_id" uuid NOT NULL,
	"user_id" uuid,
	"display_name" text,
	"role" text DEFAULT 'host' NOT NULL,
	"order_mode" text DEFAULT 'individual' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"table_session_id" uuid,
	"customer_session_id" uuid,
	"user_id" uuid,
	"rating" text NOT NULL,
	"comment" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"table_session_id" uuid,
	"customer_session_id" uuid,
	"method" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"card_last4" text,
	"cardholder_name" text,
	"transaction_id" text,
	"receipt_data" json,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "table_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"table_id" uuid NOT NULL,
	"table_number" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"share_code" text,
	"share_code_expires_at" timestamp,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	CONSTRAINT "table_sessions_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "menu_item_add_ons" ADD CONSTRAINT "menu_item_add_ons_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_table_session_id_table_sessions_id_fk" FOREIGN KEY ("table_session_id") REFERENCES "public"."table_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_table_session_id_table_sessions_id_fk" FOREIGN KEY ("table_session_id") REFERENCES "public"."table_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_customer_session_id_customer_sessions_id_fk" FOREIGN KEY ("customer_session_id") REFERENCES "public"."customer_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_table_session_id_table_sessions_id_fk" FOREIGN KEY ("table_session_id") REFERENCES "public"."table_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_session_id_customer_sessions_id_fk" FOREIGN KEY ("customer_session_id") REFERENCES "public"."customer_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "menu_categories_branch_active_idx" ON "menu_categories" USING btree ("branch_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "menu_items_branch_category_idx" ON "menu_items" USING btree ("branch_id","category_id","is_available");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "menu_items_branch_popular_idx" ON "menu_items" USING btree ("branch_id","is_popular");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_branch_status_idx" ON "orders" USING btree ("branch_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_table_status_idx" ON "orders" USING btree ("table_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_table_session_idx" ON "orders" USING btree ("table_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otp_codes_user_type_idx" ON "otp_codes" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_org_idx" ON "users" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_sessions_table_session_idx" ON "customer_sessions" USING btree ("table_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_sessions_user_idx" ON "customer_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_order_idx" ON "feedback" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_table_session_idx" ON "payments" USING btree ("table_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_transaction_idx" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "table_sessions_branch_table_idx" ON "table_sessions" USING btree ("branch_id","table_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "table_sessions_share_code_idx" ON "table_sessions" USING btree ("share_code");