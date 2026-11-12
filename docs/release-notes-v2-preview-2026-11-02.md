# Portfolio V2 preview release — 2026-11-02

Target branch: `codex/v2-preview-2026-11-01`
Release scope: preview only; production/main is not authorized.

## Included

- Twelve Creative Lab catalog/detail/demo contracts, CMS draft/publish management and Page Studio widgets.
- Six bounded flagship engines and six mini-tool experiences with local exports and explicit limitations.
- Recruiter, Studio and service experiences, portfolio evidence gates and inquiry analytics segmentation.
- Public-safe Review Workspaces with immutable versions, hash-only expiring scoped tokens, comments and exact-version decisions.
- SEO discovery, privacy-respecting Creative Lab/recruiter analytics, accessibility guards, responsive QA artifacts, performance budgets and WordPress handoff v2.
- Operations, admin, migration, rollback and verification documentation.

## Data changes

- Additive Prisma migrations only. Migration `0025_review_workspaces` creates new review tables and relations; it does not delete or rename existing content.
- Preview must use the configured separate Preview database. No local or production migration was executed by this batch.

## Known acceptance blockers

- P3-007 and final Phase 8 acceptance require authenticated DB-backed Preview checks.
- P4-003 requires user-confirmed real project evidence; dependent recruiter presentation/public case-study claims remain blocked rather than fabricated.
- Confidential review binaries require private object storage and signed authenticated delivery.
- Local Playwright visual automation is configured but browser binaries were unavailable; Preview browser checks remain required.

## Rollback

Redeploy commit `400b7dc` to return to the previous preview baseline. Do not destructively reverse database structures; use an additive corrective migration after reviewing the Preview database and backup.
