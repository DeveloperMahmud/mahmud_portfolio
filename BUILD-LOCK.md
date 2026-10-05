# MAHMUDUL HASSAN — V7.3 PRODUCTION LOCK

This build is based on the last verified V7.2 media-fixed baseline. It adds the CMS Content/Blog system and safe batch imports without removing existing project/brand/media/share functionality.

## Canonical baseline
- PostgreSQL + Prisma
- Admin authentication
- Projects CRUD
- Brands CRUD
- Image upload
- Gallery upload
- Public/unlisted/private projects
- Client share links
- Featured/special work
- Frontend CMS sync

## Added in V7.3
- Content / Blog CMS
- Rich-ish Markdown writing editor + live preview
- Content draft/published/archived workflow
- Content cover image upload
- Public Journal page
- Single content pages via `blog.html?slug=...`
- CSV/XLS/XLSX batch project import
- CSV/XLS/XLSX batch content import
- Public Google Sheets URL import (first worksheet, CSV export)
- Batch imports always create DRAFT records
- Existing slugs are skipped rather than overwritten
- Import templates in `/templates`

## Important
Do not run `prisma db pull` after this migration. Use `prisma generate` and `prisma migrate deploy` for this build.

If only frontend/backend source files are patched and package dependencies/schema do not change, do not run `npm install`. Restart with `npm run dev`.

This build requires the new `xlsx` npm dependency once. After `npm install`, future source-only patches do not require reinstalling dependencies.


## V7.3.1 content-save patch
- Fixed nested validation errors showing as `[object Object]` in admin UI.
- Added automatic slug generation from content title for new content.
- No database migration or dependency changes.
- This patch remains based on the V7.3 Content + Batch Locked baseline.


## Homepage slider CMS controls (V8.0 Feature Complete)
Project records now support `sliderEnabled` and `sliderTransition` so the Admin panel controls whether a published/featured project appears in the Top Work slider and whether its transition is AUTO or a fixed motion.


## V8.2
Slider behaviour is CMS-controlled via Maintenance → Slider Control. Slider settings are stored in `SiteSettings.sliderConfig`. Migration: `0008_slider_control`.
