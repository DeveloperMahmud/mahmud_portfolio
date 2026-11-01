# V2 Implementation Audit

## Baseline

- Canonical repository: `D:/Web Works/search-hub/.portfolio-codex-work`
- Audited branch/commit: `main` / `3f3fa90`
- Application: Express 5 + TypeScript, Prisma 6/PostgreSQL, vanilla HTML/CSS/JavaScript frontend
- Deployment shape: one Vercel server function backed by `api/index.ts`; build generates Prisma client, runs guarded migrations, then TypeScript compilation

## Reusable systems already present

- Public portfolio, work archive, project details, journal and dynamic custom pages.
- Authenticated CMS with five roles and administrator-managed accounts.
- Project/content publishing, scheduled content, preview links, revisions and redirects.
- Brands, testimonials, inquiries, inquiry activity, media storage and backup/restore.
- First-party analytics, exports, SEO settings, entity data, sitemap, robots, IndexNow, AI-referral reporting and optional Search Console integration.
- Homepage Studio and Page Studio with templates, reusable blocks, navigation presets, trusted embed sources, revisions and explicit public activation gates.
- Widget QA fixture and regression scripts covering frontend, Page Studio, operations, slider and publish safety.

## Data model baseline

The Prisma schema already contains users, projects and metrics, analytics, brands, content, site settings, custom pages, templates, reusable blocks, navigation presets, taxonomy, trusted embeds, SEO/entity/redirect/audit data, testimonials, inquiries and activity, homepage sections, reviews, media, revisions, backups, health/email/error records and preview tokens. Migrations run through `0023_builder_theme_users`.

There is no canonical Creative Lab/tool catalog record. Adding tools only inside SiteSettings JSON or a Page Studio block would make admin search, stable slugs, revisions, publishing, analytics and future engines brittle. V2 therefore needs a normalized tool domain with Page Studio references, not copied tool content.

## Public route baseline and gaps

Stable routes include `/`, `/work.html`, `/work/:slug`, `/blog.html`, `/journal/:slug`, `/pages/:slug`, share/preview routes and SEO endpoints. There are no dedicated `/creative-lab`, `/creative-lab/:slug`, `/hire`, or `/studio` experiences.

New route design must:

- avoid reserved/admin/API collisions;
- retain old URLs and introduce redirects only when necessary;
- include canonical, sitemap and structured-data behavior;
- exclude drafts/private demos from public delivery;
- preserve feature-gated Page Studio fallback behavior.

## CMS and security boundaries

- Existing roles: `ADMIN`, `EDITOR`, `WRITER`, `MODERATOR`, `VIEWER`.
- Tool mutation needs an explicit matrix rather than relying on authentication alone.
- Admin list/editor APIs must validate strings, URLs, protocols, media references, status transitions, slug uniqueness and order server-side.
- Initial concept demos must not accept or store sensitive client assets unless a later engine explicitly defines retention, limits and deletion.
- Publishing must remain explicit and revision-backed; a saved draft must not become public through Page Studio data APIs.

## Safe V2 extension architecture

1. Define route/navigation and domain contracts before schema work.
2. Add an additive Prisma tool model and migration.
3. Seed all 12 planned records idempotently with honest `DEMO`/`COMING_SOON` status.
4. Build catalog and details from the same public API.
5. Build concept demos as lightweight modules that use the canonical record for copy/CTA/status.
6. Add the admin tool manager using existing CMS form, media and revision patterns.
7. Add Page Studio blocks that reference tool IDs/slugs rather than duplicate full records.
8. Extend existing SEO, analytics, QA and export systems instead of creating replacements.

## Verification baseline

Before feature implementation, run TypeScript build and the existing frontend, Page Studio, operations, slider, publish-safety and static-smoke suites. Record failures without masking them. Schema work later requires Prisma validation, generated client, migration inspection and persistence/RBAC tests.

## Release boundary

No automatic production deploy is part of this roadmap. A release requires explicit user authorization, passing release checks, a data backup, migration safety evidence, release notes and a rollback path.
