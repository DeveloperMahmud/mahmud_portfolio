-- Additive runtime feature controls. Existing behavior is preserved by application defaults.
ALTER TABLE "SiteSettings"
ADD COLUMN "featureFlags" JSONB NOT NULL DEFAULT '{}';
