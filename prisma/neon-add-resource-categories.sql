-- Run this in Neon SQL Editor if resource_categories (or service_categories) is missing.
-- Idempotent: safe to run multiple times.

-- Resource categories (required for admin settings and resources)
CREATE TABLE IF NOT EXISTS "public"."resource_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "resource_categories_name_key"
ON "public"."resource_categories"("name");

-- Service categories (often missing alongside resource_categories)
CREATE TABLE IF NOT EXISTS "public"."service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_categories_name_key"
ON "public"."service_categories"("name");

-- Add FK from resources to resource_categories only if the column exists and the constraint is missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'resources_categoryId_fkey'
  ) AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resources')
  THEN
    ALTER TABLE "public"."resources"
    ADD CONSTRAINT "resources_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "public"."resource_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
