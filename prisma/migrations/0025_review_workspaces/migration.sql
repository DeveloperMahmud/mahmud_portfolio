CREATE TABLE "ReviewWorkspace" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "projectId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "closedAt" TIMESTAMP(3),
  CONSTRAINT "ReviewWorkspace_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReviewVersion" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "publicUrl" TEXT NOT NULL,
  "note" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewVersion_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReviewAccessToken" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "label" TEXT,
  "canComment" BOOLEAN NOT NULL DEFAULT true,
  "canDecide" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewAccessToken_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReviewComment" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "tokenId" TEXT,
  "authorName" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "anchor" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewComment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ReviewDecision" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "versionId" TEXT NOT NULL,
  "tokenId" TEXT,
  "decision" TEXT NOT NULL,
  "actorName" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewDecision_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReviewVersion_workspaceId_version_key" ON "ReviewVersion"("workspaceId", "version");
CREATE UNIQUE INDEX "ReviewAccessToken_tokenHash_key" ON "ReviewAccessToken"("tokenHash");
CREATE INDEX "ReviewWorkspace_status_updatedAt_idx" ON "ReviewWorkspace"("status", "updatedAt");
CREATE INDEX "ReviewVersion_workspaceId_createdAt_idx" ON "ReviewVersion"("workspaceId", "createdAt");
CREATE INDEX "ReviewAccessToken_workspaceId_expiresAt_idx" ON "ReviewAccessToken"("workspaceId", "expiresAt");
CREATE INDEX "ReviewComment_workspaceId_versionId_createdAt_idx" ON "ReviewComment"("workspaceId", "versionId", "createdAt");
CREATE INDEX "ReviewDecision_workspaceId_versionId_createdAt_idx" ON "ReviewDecision"("workspaceId", "versionId", "createdAt");
ALTER TABLE "ReviewVersion" ADD CONSTRAINT "ReviewVersion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ReviewWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewAccessToken" ADD CONSTRAINT "ReviewAccessToken_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ReviewWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ReviewWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ReviewVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "ReviewAccessToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReviewDecision" ADD CONSTRAINT "ReviewDecision_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ReviewWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewDecision" ADD CONSTRAINT "ReviewDecision_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ReviewVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReviewDecision" ADD CONSTRAINT "ReviewDecision_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "ReviewAccessToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
