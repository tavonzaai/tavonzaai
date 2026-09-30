CREATE TABLE IF NOT EXISTS "branch_staff_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"staff_profile_id" uuid NOT NULL,
	"assigned_by_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"employee_code" text,
	"job_title" text DEFAULT 'Staff' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "staff_profiles_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waiter_table_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"waiter_id" uuid NOT NULL,
	"table_id" uuid NOT NULL,
	"assigned_by_id" uuid NOT NULL,
	"shift_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"released_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"table_id" uuid NOT NULL,
	"table_session_id" uuid NOT NULL,
	"customer_session_id" uuid,
	"type" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"acknowledged_by_id" uuid,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "placed_by_waiter_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_auto_created" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branch_staff_assignments" ADD CONSTRAINT "branch_staff_assignments_staff_profile_id_staff_profiles_id_fk" FOREIGN KEY ("staff_profile_id") REFERENCES "public"."staff_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branch_staff_assignments" ADD CONSTRAINT "branch_staff_assignments_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waiter_table_assignments" ADD CONSTRAINT "waiter_table_assignments_waiter_id_users_id_fk" FOREIGN KEY ("waiter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waiter_table_assignments" ADD CONSTRAINT "waiter_table_assignments_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_alerts" ADD CONSTRAINT "customer_alerts_table_session_id_table_sessions_id_fk" FOREIGN KEY ("table_session_id") REFERENCES "public"."table_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_alerts" ADD CONSTRAINT "customer_alerts_customer_session_id_customer_sessions_id_fk" FOREIGN KEY ("customer_session_id") REFERENCES "public"."customer_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_alerts" ADD CONSTRAINT "customer_alerts_acknowledged_by_id_users_id_fk" FOREIGN KEY ("acknowledged_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "branch_staff_assignments_branch_active_idx" ON "branch_staff_assignments" USING btree ("branch_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "branch_staff_assignments_staff_active_idx" ON "branch_staff_assignments" USING btree ("staff_profile_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "branch_staff_assignments_unique_active_idx" ON "branch_staff_assignments" USING btree ("branch_id","staff_profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_profiles_org_restaurant_idx" ON "staff_profiles" USING btree ("organization_id","restaurant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_profiles_user_idx" ON "staff_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "waiter_table_assignments_branch_waiter_idx" ON "waiter_table_assignments" USING btree ("branch_id","waiter_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "waiter_table_assignments_branch_table_idx" ON "waiter_table_assignments" USING btree ("branch_id","table_id","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_alerts_branch_status_idx" ON "customer_alerts" USING btree ("branch_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_alerts_table_session_status_idx" ON "customer_alerts" USING btree ("table_session_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customer_alerts_created_at_idx" ON "customer_alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_placed_by_waiter_idx" ON "orders" USING btree ("placed_by_waiter_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users" USING btree ("phone");