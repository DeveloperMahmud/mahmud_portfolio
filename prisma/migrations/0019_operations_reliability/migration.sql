-- Additive operations, reliability, recovery, and workflow upgrade.
ALTER TABLE "Project" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedBy" TEXT;
ALTER TABLE "Content" ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "deletedBy" TEXT;
ALTER TABLE "Brand" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Testimonial" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Media" ADD COLUMN "folder" TEXT, ADD COLUMN "keep" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Inquiry" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL', ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[], ADD COLUMN "assigneeId" TEXT, ADD COLUMN "followUpAt" TIMESTAMP(3), ADD COLUMN "estimatedValue" INTEGER, ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD', ADD COLUMN "proposalStatus" TEXT, ADD COLUMN "proposalDate" TIMESTAMP(3), ADD COLUMN "outcomeReason" TEXT, ADD COLUMN "anonymizedAt" TIMESTAMP(3);
ALTER TABLE "ActivityLog" ADD COLUMN "actorId" TEXT, ADD COLUMN "result" TEXT;
CREATE INDEX "ActivityLog_action_entity_createdAt_idx" ON "ActivityLog"("action", "entity", "createdAt");

CREATE TABLE "ContentRevision" ("id" TEXT NOT NULL, "resourceType" TEXT NOT NULL, "resourceId" TEXT NOT NULL, "revision" INTEGER NOT NULL, "snapshot" JSONB NOT NULL, "summary" TEXT, "sourceAction" TEXT, "actorId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "ContentRevision_resourceType_resourceId_revision_key" ON "ContentRevision"("resourceType", "resourceId", "revision");
CREATE INDEX "ContentRevision_resourceType_resourceId_createdAt_idx" ON "ContentRevision"("resourceType", "resourceId", "createdAt");

CREATE TABLE "BackupRecord" ("id" TEXT NOT NULL, "formatVersion" TEXT NOT NULL, "status" TEXT NOT NULL, "checksum" TEXT, "includedData" JSONB NOT NULL, "recordCounts" JSONB, "payload" JSONB, "requestedById" TEXT, "includesPrivateData" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completedAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3), CONSTRAINT "BackupRecord_pkey" PRIMARY KEY ("id"));
CREATE INDEX "BackupRecord_status_createdAt_idx" ON "BackupRecord"("status", "createdAt");

CREATE TABLE "SystemCheck" ("id" TEXT NOT NULL, "service" TEXT NOT NULL, "status" TEXT NOT NULL, "message" TEXT, "metadata" JSONB NOT NULL DEFAULT '{}', "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SystemCheck_pkey" PRIMARY KEY ("id"));
CREATE INDEX "SystemCheck_service_checkedAt_idx" ON "SystemCheck"("service", "checkedAt");

CREATE TABLE "EmailDelivery" ("id" TEXT NOT NULL, "inquiryId" TEXT, "type" TEXT NOT NULL, "provider" TEXT, "providerId" TEXT, "status" TEXT NOT NULL DEFAULT 'NOT_REQUESTED', "attemptCount" INTEGER NOT NULL DEFAULT 0, "lastErrorCode" TEXT, "nextRetryAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id"));
CREATE INDEX "EmailDelivery_inquiryId_createdAt_idx" ON "EmailDelivery"("inquiryId", "createdAt");
CREATE INDEX "EmailDelivery_status_nextRetryAt_idx" ON "EmailDelivery"("status", "nextRetryAt");

CREATE TABLE "ErrorIncident" ("id" TEXT NOT NULL, "fingerprint" TEXT, "source" TEXT NOT NULL, "environment" TEXT NOT NULL, "release" TEXT, "message" TEXT NOT NULL, "context" JSONB NOT NULL DEFAULT '{}', "resolved" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ErrorIncident_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ErrorIncident_resolved_createdAt_idx" ON "ErrorIncident"("resolved", "createdAt");
CREATE INDEX "ErrorIncident_source_createdAt_idx" ON "ErrorIncident"("source", "createdAt");

CREATE TABLE "PreviewToken" ("id" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "resourceType" TEXT NOT NULL, "resourceId" TEXT NOT NULL, "createdById" TEXT, "expiresAt" TIMESTAMP(3) NOT NULL, "revokedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PreviewToken_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "PreviewToken_tokenHash_key" ON "PreviewToken"("tokenHash");
CREATE INDEX "PreviewToken_resourceType_resourceId_expiresAt_idx" ON "PreviewToken"("resourceType", "resourceId", "expiresAt");
