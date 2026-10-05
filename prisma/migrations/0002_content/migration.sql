-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BLOG',
    "category" TEXT,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "coverImage" TEXT,
    "gallery" JSONB NOT NULL DEFAULT '[]',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "author" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");
CREATE INDEX "Content_status_publishedAt_idx" ON "Content"("status", "publishedAt");
CREATE INDEX "Content_featured_sortOrder_idx" ON "Content"("featured", "sortOrder");
