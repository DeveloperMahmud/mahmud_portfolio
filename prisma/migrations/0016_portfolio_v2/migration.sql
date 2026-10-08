ALTER TABLE "Project"
  ADD COLUMN "industry" TEXT,
  ADD COLUMN "projectSubtitle" TEXT,
  ADD COLUMN "credits" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "projectBlocks" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "showOnHomepage" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "homepageOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "homepageLayout" TEXT NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "homepageTitle" TEXT,
  ADD COLUMN "homepageSubtitle" TEXT,
  ADD COLUMN "homepageImage" TEXT,
  ADD COLUMN "sliderImage" TEXT,
  ADD COLUMN "sliderMobileImage" TEXT,
  ADD COLUMN "sliderTitle" TEXT,
  ADD COLUMN "sliderHeadline" TEXT,
  ADD COLUMN "sliderDescription" TEXT,
  ADD COLUMN "sliderCtaLabel" TEXT,
  ADD COLUMN "sliderCtaUrl" TEXT,
  ADD COLUMN "sliderTextAlign" TEXT NOT NULL DEFAULT 'LEFT',
  ADD COLUMN "sliderOverlay" INTEGER NOT NULL DEFAULT 35,
  ADD COLUMN "sliderFocalPoint" TEXT NOT NULL DEFAULT '50% 50%',
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "canonicalUrl" TEXT,
  ADD COLUMN "noIndex" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "nextProjectId" TEXT;

ALTER TABLE "Brand"
  ADD COLUMN "logoDark" TEXT,
  ADD COLUMN "industry" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "SiteSettings"
  ADD COLUMN "heroConfig" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "capabilitiesConfig" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "amazonConfig" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "statementConfig" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "aboutConfig" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "socialLinks" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "navigationConfig" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "footerConfig" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "seoConfig" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "inquiryConfig" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "Inquiry"
  ADD COLUMN "company" TEXT,
  ADD COLUMN "projectType" TEXT,
  ADD COLUMN "internalNotes" TEXT,
  ADD COLUMN "readAt" TIMESTAMP(3);

ALTER TABLE "Media"
  ADD COLUMN "checksum" TEXT,
  ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'COMPLETE',
  ADD COLUMN "derivatives" JSONB NOT NULL DEFAULT '[]';

CREATE UNIQUE INDEX "Media_checksum_key" ON "Media"("checksum");

CREATE TABLE "InquiryActivity" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InquiryActivity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "InquiryActivity_inquiryId_createdAt_idx" ON "InquiryActivity"("inquiryId", "createdAt");

CREATE TABLE "HomepageSection" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "config" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomepageSection_key_key" ON "HomepageSection"("key");
CREATE INDEX "HomepageSection_enabled_sortOrder_idx" ON "HomepageSection"("enabled", "sortOrder");
