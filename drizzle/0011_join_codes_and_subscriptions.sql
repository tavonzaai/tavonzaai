ALTER TABLE "table_sessions" ADD COLUMN IF NOT EXISTS "join_code_expires_at" timestamptz;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(50) UNIQUE NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text,
  "interval" varchar(20) DEFAULT 'month' NOT NULL,
  "amount" double precision NOT NULL,
  "currency" varchar(10) DEFAULT 'USD' NOT NULL,
  "features" jsonb DEFAULT '[]'::jsonb,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL UNIQUE REFERENCES "organizations"("id") ON DELETE CASCADE,
  "plan_id" uuid NOT NULL REFERENCES "platform_plans"("id"),
  "status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
  "current_period_start" timestamptz,
  "current_period_end" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "subscription_id" uuid REFERENCES "organization_subscriptions"("id") ON DELETE SET NULL,
  "number" varchar(50) NOT NULL,
  "amount" double precision NOT NULL,
  "currency" varchar(10) DEFAULT 'USD' NOT NULL,
  "status" varchar(20) DEFAULT 'PAID' NOT NULL,
  "period_start" timestamptz,
  "period_end" timestamptz,
  "issued_at" timestamptz DEFAULT now(),
  "paid_at" timestamptz,
  "created_at" timestamptz DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_invoices_org_idx" ON "subscription_invoices" USING btree ("organization_id");
