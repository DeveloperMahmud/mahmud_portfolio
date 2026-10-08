CREATE TABLE IF NOT EXISTS "Media" ("id" TEXT NOT NULL,"key" TEXT NOT NULL,"url" TEXT NOT NULL,"provider" TEXT NOT NULL DEFAULT 'local',"originalName" TEXT NOT NULL,"filename" TEXT NOT NULL,"mimeType" TEXT NOT NULL,"size" INTEGER NOT NULL DEFAULT 0,"width" INTEGER,"height" INTEGER,"alt" TEXT,"title" TEXT,"description" TEXT,"tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "Media_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "Media_key_key" ON "Media"("key");
CREATE INDEX IF NOT EXISTS "Media_mimeType_idx" ON "Media"("mimeType");
CREATE INDEX IF NOT EXISTS "Media_createdAt_idx" ON "Media"("createdAt");
