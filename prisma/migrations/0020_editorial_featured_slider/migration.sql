-- Additive editorial featured-slider controls. Existing records retain safe defaults.
ALTER TABLE "Project" ADD COLUMN "sliderThumbnail" TEXT;
ALTER TABLE "Project" ADD COLUMN "sliderImageAlt" TEXT;
ALTER TABLE "Project" ADD COLUMN "sliderReflection" TEXT NOT NULL DEFAULT 'INHERIT';
ALTER TABLE "Project" ADD COLUMN "sliderReflectionIntensity" TEXT;
