-- Page Studio is an additive feature. No existing table, column, route, or record is removed.
ALTER TABLE "SiteSettings" ADD COLUMN "pageStudioConfig" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE "NavigationPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "items" JSONB NOT NULL DEFAULT '[]',
    "styles" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NavigationPreset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "templateKey" TEXT,
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "navbarPresetId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "includeSitemap" BOOLEAN NOT NULL DEFAULT true,
    "publishedPath" TEXT,
    "publishedSnapshot" JSONB,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "publicModifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "CustomPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "thumbnail" TEXT,
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PageTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReusableBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'CONTENT',
    "mode" TEXT NOT NULL DEFAULT 'GLOBAL',
    "block" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReusableBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaxonomyTerm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PAGE_TAG',
    "description" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaxonomyTerm_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageTaxonomyAssignment" (
    "pageId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageTaxonomyAssignment_pkey" PRIMARY KEY ("pageId","termId")
);

CREATE TABLE "TrustedEmbedSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "allowIframe" BOOLEAN NOT NULL DEFAULT true,
    "allowRemoteJson" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TrustedEmbedSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NavigationPreset_slug_key" ON "NavigationPreset"("slug");
CREATE INDEX "NavigationPreset_enabled_isGlobal_idx" ON "NavigationPreset"("enabled", "isGlobal");
CREATE UNIQUE INDEX "CustomPage_slug_key" ON "CustomPage"("slug");
CREATE UNIQUE INDEX "CustomPage_path_key" ON "CustomPage"("path");
CREATE UNIQUE INDEX "CustomPage_publishedPath_key" ON "CustomPage"("publishedPath");
CREATE INDEX "CustomPage_status_visibility_idx" ON "CustomPage"("status", "visibility");
CREATE INDEX "CustomPage_navbarPresetId_idx" ON "CustomPage"("navbarPresetId");
CREATE INDEX "CustomPage_deletedAt_updatedAt_idx" ON "CustomPage"("deletedAt", "updatedAt");
CREATE UNIQUE INDEX "PageTemplate_slug_key" ON "PageTemplate"("slug");
CREATE INDEX "PageTemplate_active_category_idx" ON "PageTemplate"("active", "category");
CREATE UNIQUE INDEX "ReusableBlock_slug_key" ON "ReusableBlock"("slug");
CREATE INDEX "ReusableBlock_active_category_idx" ON "ReusableBlock"("active", "category");
CREATE UNIQUE INDEX "TaxonomyTerm_type_slug_key" ON "TaxonomyTerm"("type", "slug");
CREATE INDEX "TaxonomyTerm_type_active_sortOrder_idx" ON "TaxonomyTerm"("type", "active", "sortOrder");
CREATE INDEX "TaxonomyTerm_parentId_idx" ON "TaxonomyTerm"("parentId");
CREATE INDEX "PageTaxonomyAssignment_termId_idx" ON "PageTaxonomyAssignment"("termId");
CREATE UNIQUE INDEX "TrustedEmbedSource_origin_key" ON "TrustedEmbedSource"("origin");
CREATE INDEX "TrustedEmbedSource_enabled_idx" ON "TrustedEmbedSource"("enabled");

ALTER TABLE "CustomPage" ADD CONSTRAINT "CustomPage_navbarPresetId_fkey" FOREIGN KEY ("navbarPresetId") REFERENCES "NavigationPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TaxonomyTerm" ADD CONSTRAINT "TaxonomyTerm_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TaxonomyTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PageTaxonomyAssignment" ADD CONSTRAINT "PageTaxonomyAssignment_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CustomPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageTaxonomyAssignment" ADD CONSTRAINT "PageTaxonomyAssignment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "TaxonomyTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
