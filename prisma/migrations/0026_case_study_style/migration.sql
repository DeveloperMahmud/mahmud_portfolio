-- Optional, project-level presentation controls for public case studies.
-- Existing projects keep the frontend defaults when this value is NULL.
ALTER TABLE "Project" ADD COLUMN "caseStudyStyle" JSONB;
