CREATE TABLE IF NOT EXISTS "ProjectReview" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "clientEmail" TEXT,
  "decision" TEXT NOT NULL DEFAULT 'CHANGES_REQUESTED',
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectReview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ProjectReview_projectId_createdAt_idx" ON "ProjectReview"("projectId", "createdAt");
