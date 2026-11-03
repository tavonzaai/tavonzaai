CREATE TABLE "organization_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "organization_subscriptions_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "platform_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"interval" varchar(20) DEFAULT 'month' NOT NULL,
	"amount" double precision NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "platform_plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "subscription_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"subscription_id" uuid,
	"number" varchar(50) NOT NULL,
	"amount" double precision NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) DEFAULT 'PAID' NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"issued_at" timestamp with time zone DEFAULT now(),
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "order_reviews" ALTER COLUMN "customer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "address" jsonb;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "images" text[];--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "status" varchar(50) DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "is_popular" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "guest_sessions" ADD COLUMN "order_mode" varchar(20) DEFAULT 'together' NOT NULL;--> statement-breakpoint
ALTER TABLE "table_sessions" ADD COLUMN "join_code_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "modifier_ids" uuid[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "special_instructions" text;--> statement-breakpoint
ALTER TABLE "order_reviews" ADD COLUMN "guest_session_id" uuid;--> statement-breakpoint
ALTER TABLE "password_reset_otps" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "table_auth_otps" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_plan_id_platform_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."platform_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_invoices_org_idx" ON "subscription_invoices" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "order_reviews" ADD CONSTRAINT "order_reviews_guest_session_id_guest_sessions_id_fk" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_reviews_guest_session_idx" ON "order_reviews" USING btree ("guest_session_id");--> statement-breakpoint
ALTER TABLE "order_reviews" ADD CONSTRAINT "order_reviews_single_reviewer" CHECK (("order_reviews"."customer_id" IS NOT NULL) OR ("order_reviews"."guest_session_id" IS NOT NULL));