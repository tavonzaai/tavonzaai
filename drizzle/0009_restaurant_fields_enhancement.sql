ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "address" jsonb;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "phone" varchar(50);
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "email" varchar(255);
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "website_url" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "cover_image_url" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "banner_url" text;
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "images" text[];
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'ACTIVE';

