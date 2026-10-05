CREATE TABLE "SiteSettings" (
  "id" TEXT NOT NULL,
  "siteName" TEXT NOT NULL DEFAULT 'Mahmudul Hassan',
  "title" TEXT NOT NULL DEFAULT 'Creative Designer',
  "email" TEXT,
  "phone" TEXT,
  "location" TEXT,
  "availability" BOOLEAN NOT NULL DEFAULT true,
  "availabilityLabel" TEXT DEFAULT 'AVAILABLE FOR SELECT PROJECTS',
  "linkedin" TEXT,
  "behance" TEXT,
  "dribbble" TEXT,
  "instagram" TEXT,
  "github" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "ogImage" TEXT,
  "homepageOrder" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Testimonial" (
  "id" TEXT NOT NULL,
  "client" TEXT NOT NULL,
  "company" TEXT,
  "role" TEXT,
  "quote" TEXT NOT NULL,
  "photo" TEXT,
  "projectId" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Testimonial_published_featured_sortOrder_idx" ON "Testimonial"("published", "featured", "sortOrder");

CREATE TABLE "ActivityLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
