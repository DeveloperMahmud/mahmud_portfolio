# V2 production release — 2026-11-12

## Scope

This release promotes the V2 portfolio work and adds ten more owner-published Behance case studies. The new entries use verified Behance titles, dates, source links and locally bundled project imagery.

## Publishing safeguards

- New case studies are create-only: an existing slug is never overwritten.
- New entries are public but archive-first; featured, homepage and slider placement stay disabled until changed in the CMS.
- Result metrics are empty unless the source provides verifiable evidence.
- Existing CMS settings, custom pages and project records are preserved.
- No database migration or destructive data operation is included.

## Rollback

The complete release is delivered as one squash commit on `main`. Reverting that commit rolls back the application code. Records created by the idempotent production seed are additive and may be unpublished from the CMS if a data-level rollback is required.

## Verification

- Full Node test suite: 251/251 passed
- Static smoke suite: 5/5 passed
- Performance budget: passed
- Prisma schema validation and client generation: passed
- TypeScript production build: passed
- Git diff validation: passed
- Stable Preview browser acceptance: 10/10 new routes passed, zero media fallbacks and zero browser log errors
- Archive-first placement: all 10 appear in the work archive and none are auto-featured on the homepage
