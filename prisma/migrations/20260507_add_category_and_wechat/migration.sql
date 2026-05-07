-- AlterTable: daily_reports
ALTER TABLE "daily_reports" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'stars';
ALTER TABLE "daily_reports" DROP CONSTRAINT "daily_reports_date_key";
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_date_category_key" UNIQUE ("date", "category");

-- AlterTable: projects
ALTER TABLE "projects" ADD COLUMN "forks" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "openIssues" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "wechatMd" TEXT;
ALTER TABLE "projects" ADD COLUMN "reportId" INTEGER;

-- Migrate existing data: populate reportId from current FK relation
UPDATE "projects" p SET "reportId" = dr.id FROM "daily_reports" dr WHERE p."reportDate" = dr.date;

-- Drop old FK and unique constraint, add new FK
ALTER TABLE "projects" DROP CONSTRAINT "projects_reportDate_fkey";
ALTER TABLE "projects" DROP CONSTRAINT "projects_fullName_key";
ALTER TABLE "projects" ADD CONSTRAINT "projects_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "daily_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ALTER COLUMN "reportId" SET NOT NULL;

-- Drop old reportDate column
ALTER TABLE "projects" DROP COLUMN "reportDate";
