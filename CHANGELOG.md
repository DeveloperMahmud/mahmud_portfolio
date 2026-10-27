# Portfolio release history

This file records production-facing changes, compatibility notes, verification results, and the Git commit that introduced each release. Newest entries stay at the top.

## Studio Foundation v3 — 2026-10-27

- **Implementation commit:** `01f8a6c` (`Future-proof Page Studio foundations`)
- **Branch:** `main`
- **Package compatibility:** existing `8.2.0` application package
- **Database migration:** none
- **New paid service:** none
- **New environment variable:** none

### Added

- A server-owned registry for all 42 Page Studio widget types, including stable labels, groups, descriptions, and per-widget versions.
- Backward-compatible block migration so older saved Page Studio documents receive safe defaults without losing content.
- Version tracking for newly created Homepage Studio blocks while legacy blocks continue to parse normally.
- CMS-managed global design tokens for heading font, body font, content width, section spacing, base radius, and motion scale.
- Separate tablet and mobile column-count controls in addition to the existing desktop column setting.
- Editor-only widget labels and position locks.
- Copy style, paste style, and reset style actions for faster repeatable page building.
- Publish checks for multiple H1 headings, overly large pages, incomplete before/after widgets, missing comparison alt text, missing embed titles, and custom-code review.

### Improved

- Public pages, Page Studio previews, and Homepage Studio output now consume the same global theme tokens.
- Locked widgets cannot be accidentally dragged, moved, or deleted until unlocked.
- Rounded Studio containers clip nested content consistently.
- Updated static asset version parameters prevent browsers from retaining old Studio or theme files after deployment.
- Page Studio documentation now accurately distinguishes normal CMS feature controls from the emergency environment lock.
- Added a no-index `/widget-qa.html` lab that renders all 42 registered widgets with the production renderer, representative local media, dynamic sample content, and zero database or Blob writes.

### Compatibility and safety

- Existing routes, CMS records, published pages, media references, themes, and homepage content are preserved.
- The upgrade stores new settings inside the existing JSON configuration fields; no Prisma migration is required.
- Existing blocks without `widgetVersion` are upgraded in memory when parsed and saved.
- Homepage Studio still uses canonical CMS projects, skills, brands, testimonials, social links, and site settings instead of duplicating those records.

### Verification

The release passed:

- TypeScript production build
- Page Studio and Homepage Studio tests: **47/47**
- Frontend regression tests: **12/12**
- Operations and recovery tests: **7/7**
- Publish-safety tests: **3/3**
- Editorial slider tests: **5/5**
- Static production smoke checks
- JavaScript syntax checks and `git diff --check`

### Rollback reference

If this specific implementation must be reverted, use Git history to revert implementation commit `01f8a6c`. Do not reset or replace the production database; this release has no database migration.

## Maintenance convention

For future releases, add a new section above the previous release containing:

1. Release name and date.
2. Implementation commit.
3. Added, improved, fixed, and removed behavior.
4. Database, environment-variable, storage, and cost impact.
5. Tests completed.
6. Rollback reference.
