-- Legacy CUSTOMER accounts created before profiles were auto-provisioned
INSERT INTO "customers" ("user_id")
SELECT u."id" FROM "users" u
WHERE u."role" = 'CUSTOMER'
  AND NOT EXISTS (SELECT 1 FROM "customers" c WHERE c."user_id" = u."id");
--> statement-breakpoint
-- Exactly one cart per customer
INSERT INTO "carts" ("customer_id")
SELECT c."id" FROM "customers" c
ON CONFLICT ("customer_id") DO NOTHING;
