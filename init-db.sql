CREATE TABLE IF NOT EXISTS "daily_reports" (
    "id" SERIAL PRIMARY KEY,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_reports_date_key" UNIQUE ("date")
);

CREATE TABLE IF NOT EXISTS "projects" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "starsGrowth" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "analysisMd" TEXT,
    "reportDate" DATE NOT NULL REFERENCES "daily_reports"("date"),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "projects_fullName_key" UNIQUE ("fullName")
);

CREATE TABLE IF NOT EXISTS "star_snapshots" (
    "id" SERIAL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "snapshotDate" DATE NOT NULL,
    CONSTRAINT "star_snapshots_fullName_snapshotDate_key" UNIQUE ("fullName", "snapshotDate")
);
