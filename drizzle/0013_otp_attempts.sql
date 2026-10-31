ALTER TABLE "password_reset_otps" ADD COLUMN IF NOT EXISTS "attempts" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "table_auth_otps" ADD COLUMN IF NOT EXISTS "attempts" integer DEFAULT 0 NOT NULL;

