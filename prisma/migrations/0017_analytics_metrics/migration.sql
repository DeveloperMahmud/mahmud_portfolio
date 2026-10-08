-- Additive analytics and verified project-result metrics.
CREATE TABLE "ProjectMetric" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT,
    "prefix" TEXT,
    "suffix" TEXT,
    "beforeValue" TEXT,
    "afterValue" TEXT,
    "publicNote" TEXT,
    "sourceNote" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "normalizedPath" TEXT NOT NULL,
    "pageTitle" TEXT,
    "projectId" TEXT,
    "visitorHash" TEXT,
    "sessionHash" TEXT,
    "referrerHost" TEXT,
    "source" TEXT,
    "deviceType" TEXT,
    "countryCode" TEXT,
    "engagementMs" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsDaily" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dimensionType" TEXT NOT NULL DEFAULT 'OVERALL',
    "dimensionValue" TEXT NOT NULL DEFAULT 'ALL',
    "uniqueVisitors" BIGINT NOT NULL DEFAULT 0,
    "sessions" BIGINT NOT NULL DEFAULT 0,
    "pageViews" BIGINT NOT NULL DEFAULT 0,
    "projectViews" BIGINT NOT NULL DEFAULT 0,
    "ctaClicks" BIGINT NOT NULL DEFAULT 0,
    "inquiries" BIGINT NOT NULL DEFAULT 0,
    "engagementMs" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsDaily_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectMetric_projectId_sortOrder_idx" ON "ProjectMetric"("projectId", "sortOrder");
CREATE INDEX "ProjectMetric_projectId_verified_visible_idx" ON "ProjectMetric"("projectId", "verified", "visible");
CREATE INDEX "AnalyticsEvent_occurredAt_idx" ON "AnalyticsEvent"("occurredAt");
CREATE INDEX "AnalyticsEvent_eventType_occurredAt_idx" ON "AnalyticsEvent"("eventType", "occurredAt");
CREATE INDEX "AnalyticsEvent_projectId_occurredAt_idx" ON "AnalyticsEvent"("projectId", "occurredAt");
CREATE INDEX "AnalyticsEvent_normalizedPath_occurredAt_idx" ON "AnalyticsEvent"("normalizedPath", "occurredAt");
CREATE INDEX "AnalyticsEvent_visitorHash_occurredAt_idx" ON "AnalyticsEvent"("visitorHash", "occurredAt");
CREATE INDEX "AnalyticsEvent_sessionHash_occurredAt_idx" ON "AnalyticsEvent"("sessionHash", "occurredAt");
CREATE UNIQUE INDEX "AnalyticsDaily_date_dimensionType_dimensionValue_key" ON "AnalyticsDaily"("date", "dimensionType", "dimensionValue");
CREATE INDEX "AnalyticsDaily_date_dimensionType_idx" ON "AnalyticsDaily"("date", "dimensionType");
ALTER TABLE "ProjectMetric" ADD CONSTRAINT "ProjectMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
