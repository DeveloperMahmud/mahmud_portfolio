-- Additive Creative Lab catalog foundation. Existing tables and records are untouched.
CREATE TYPE "CreativeToolKind" AS ENUM ('FLAGSHIP', 'MINI');
CREATE TYPE "CreativeToolProductStatus" AS ENUM ('PLANNED', 'PREVIEW', 'BETA', 'LIVE', 'ARCHIVED');
CREATE TYPE "CreativeToolDemoMode" AS ENUM ('CONCEPT', 'SAMPLE_INTERACTIVE', 'ACTUAL');
CREATE TYPE "CreativeToolActionBehavior" AS ENUM ('AUTO', 'DEMO', 'LIVE', 'DETAILS');
CREATE TYPE "CreativeToolLinkTarget" AS ENUM ('SAME_TAB', 'NEW_TAB');

CREATE TABLE "CreativeTool" (
    "id" TEXT NOT NULL,
    "canonicalId" TEXT,
    "systemSeeded" BOOLEAN NOT NULL DEFAULT false,
    "seedVersion" INTEGER,
    "slug" TEXT NOT NULL,
    "publishedSlug" TEXT,
    "kind" "CreativeToolKind" NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "shortDescription" TEXT,
    "overview" TEXT,
    "problemStatement" TEXT,
    "audience" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "featureBullets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "proposedInputs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "proposedOutputs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "limitations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "iconKey" TEXT,
    "coverImage" TEXT,
    "galleryImages" JSONB NOT NULL DEFAULT '[]',
    "pageBlocks" JSONB NOT NULL DEFAULT '[]',
    "productStatus" "CreativeToolProductStatus" NOT NULL DEFAULT 'PLANNED',
    "demoMode" "CreativeToolDemoMode" NOT NULL DEFAULT 'CONCEPT',
    "demoNotice" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "demoUrl" TEXT,
    "liveUrl" TEXT,
    "documentationUrl" TEXT,
    "liveUrlVerifiedAt" TIMESTAMP(3),
    "primaryLabel" TEXT,
    "primaryBehavior" "CreativeToolActionBehavior" NOT NULL DEFAULT 'AUTO',
    "primaryTarget" "CreativeToolLinkTarget" NOT NULL DEFAULT 'SAME_TAB',
    "primaryStyle" TEXT,
    "secondaryLabel" TEXT,
    "secondaryBehavior" "CreativeToolActionBehavior",
    "secondaryUrl" TEXT,
    "secondaryTarget" "CreativeToolLinkTarget" NOT NULL DEFAULT 'SAME_TAB',
    "secondaryStyle" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedSnapshot" JSONB,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "publicModifiedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "includeSitemap" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    CONSTRAINT "CreativeTool_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CreativeTool_seed_identity_check" CHECK (
      ("systemSeeded" = false AND "canonicalId" IS NULL)
      OR ("systemSeeded" = true AND "canonicalId" ~ '^[FM]0[1-6]$')
    )
);

CREATE UNIQUE INDEX "CreativeTool_canonicalId_key" ON "CreativeTool"("canonicalId");
CREATE UNIQUE INDEX "CreativeTool_slug_key" ON "CreativeTool"("slug");
CREATE UNIQUE INDEX "CreativeTool_publishedSlug_key" ON "CreativeTool"("publishedSlug");
CREATE INDEX "CreativeTool_status_visibility_visible_scheduledAt_idx" ON "CreativeTool"("status", "visibility", "visible", "scheduledAt");
CREATE INDEX "CreativeTool_kind_productStatus_sortOrder_idx" ON "CreativeTool"("kind", "productStatus", "sortOrder");
CREATE INDEX "CreativeTool_category_sortOrder_idx" ON "CreativeTool"("category", "sortOrder");
CREATE INDEX "CreativeTool_featured_visible_sortOrder_idx" ON "CreativeTool"("featured", "visible", "sortOrder");
CREATE INDEX "CreativeTool_productStatus_visible_idx" ON "CreativeTool"("productStatus", "visible");
CREATE INDEX "CreativeTool_deletedAt_updatedAt_idx" ON "CreativeTool"("deletedAt", "updatedAt");
