const { Client } = require("pg");

const MIGRATION_SQL = `
-- Add category column to daily_reports
DO $$ BEGIN
  ALTER TABLE "daily_reports" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'stars';
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'column category already exists in daily_reports';
END $$;

-- Drop old unique constraint, add new composite
ALTER TABLE "daily_reports" DROP CONSTRAINT IF EXISTS "daily_reports_date_key";
ALTER TABLE "daily_reports" DROP CONSTRAINT IF EXISTS "daily_reports_date_category_key";
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_date_category_key" UNIQUE ("date", "category");

-- Add new columns to projects
DO $$ BEGIN
  ALTER TABLE "projects" ADD COLUMN "forks" INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'column forks already exists in projects';
END $$;

DO $$ BEGIN
  ALTER TABLE "projects" ADD COLUMN "openIssues" INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'column openIssues already exists in projects';
END $$;

DO $$ BEGIN
  ALTER TABLE "projects" ADD COLUMN "wechatMd" TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'column wechatMd already exists in projects';
END $$;

DO $$ BEGIN
  ALTER TABLE "projects" ADD COLUMN "reportId" INTEGER;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'column reportId already exists in projects';
END $$;

-- Populate reportId from existing relation
UPDATE "projects" p SET "reportId" = dr.id FROM "daily_reports" dr WHERE p."reportDate" = dr.date AND p."reportId" IS NULL;

-- Drop old FK and unique, add new
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_reportDate_fkey";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_fullName_key";

-- Make reportId NOT NULL after populating
UPDATE "projects" SET "reportId" = 0 WHERE "reportId" IS NULL;
ALTER TABLE "projects" ALTER COLUMN "reportId" SET NOT NULL;

ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_reportId_fkey";
ALTER TABLE "projects" ADD CONSTRAINT "projects_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old reportDate column
ALTER TABLE "projects" DROP COLUMN IF EXISTS "reportDate";
`;

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log("[Migration] Connected to database");
    await client.query(MIGRATION_SQL);
    console.log("[Migration] Migration completed successfully");
  } catch (err) {
    console.error("[Migration] Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
