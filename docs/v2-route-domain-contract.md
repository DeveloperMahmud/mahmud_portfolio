# V2 Route and Creative Lab Domain Contract

Status: verified architecture contract  
Date: 2026-10-29  
Applies before any V2 schema migration or public implementation.

## 1. Route and information architecture

### Public pages

| Purpose | Canonical route | Delivery rule |
|---|---|---|
| Homepage | `/` | Preserve existing anchors and legacy fallback. |
| Work archive/detail | `/work.html`, `/work/:slug` | Unchanged. |
| Journal archive/detail | `/blog.html`, `/journal/:slug` | Unchanged. |
| Services overview | `/services` | New, initially a Page Studio-compatible skeleton. |
| Amazon service | `/services/amazon-creative` | New service landing page. |
| Creative Lab catalog | `/creative-lab` | New registry-backed catalog. |
| Tool concept/sample | `/creative-lab/:slug/demo` | Register before the detail route. |
| Tool details | `/creative-lab/:slug` | Published snapshot only. |
| Recruiter experience | `/hire` | New, separate ordering/copy; not a separate website. |
| Client/studio experience | `/studio` | New, separate ordering/copy; not a separate website. |
| Future resources | `/resources` | Reserved, not implemented until specified. |
| Widget QA | `/widget-qa.html` | Preserve as an internal QA fixture. |

`/creative-lab` is intentionally chosen instead of `/tools`. The current public software section remains **Creative Stack / Tools I Use** at `#skills`; legacy `#tools` should map to the same section. Creative Lab represents products/tools built by the owner and must remain visually and semantically distinct.

### Navigation

Recommended primary order: **Work · Services · Creative Lab · Journal · Hire · Contact**. `Start a Project` remains the client CTA. Existing CMS-managed navigation is authoritative; safe defaults may fill an empty configuration but must never overwrite saved items.

### Public APIs

```text
GET /api/public/creative-lab?kind=&status=&q=&category=
GET /api/public/creative-lab/:slug
GET /api/public/creative-lab/:slug/demo
```

Responses expose published, sanitized fields only. Demo responses never include draft snapshots, audit notes, verification metadata or private admin fields.

### Admin APIs

```text
GET    /api/admin/creative-lab/tools
POST   /api/admin/creative-lab/tools
GET    /api/admin/creative-lab/tools/:id
PATCH  /api/admin/creative-lab/tools/:id
POST   /api/admin/creative-lab/tools/:id/duplicate
POST   /api/admin/creative-lab/tools/:id/publish
POST   /api/admin/creative-lab/tools/:id/unpublish
POST   /api/admin/creative-lab/tools/:id/archive
GET    /api/admin/creative-lab/tools/:id/revisions
POST   /api/admin/creative-lab/tools/:id/revisions/:revisionId/restore
GET    /api/admin/creative-lab/settings
PATCH  /api/admin/creative-lab/settings
```

Canonical seeded records are archived/unpublished rather than hard-deleted.

## 2. Collision and registration rules

1. Explicit Creative Lab, service, hire and studio routes must be registered before `/pages/:slug` and the extensionless Page Studio catch-all in `src/app.ts`.
2. Reserve `creative-lab`, `services`, `hire`, `studio` and `resources` in Page Studio path validation.
3. Redirect middleware currently runs before explicit public routes. Creation/publishing must reject or flag `RedirectRule.sourcePath` values that shadow these reserved routes.
4. Register `/creative-lab/:slug/demo` before `/creative-lab/:slug`.
5. Preserve `/`, work, journal, preview/share and widget-QA routes unchanged.
6. Sitemap generation must add the catalog and eligible published detail pages, never demos/drafts/private tools.
7. Any published slug change creates redirects for both `/creative-lab/old-slug` and `/creative-lab/old-slug/demo`.

## 3. Canonical Creative Lab domain

Use a dedicated durable `CreativeTool` record as the single source of truth. Do not store the canonical catalog as twelve static cards, duplicate it into Page Studio blocks, or rely on SiteSettings JSON for primary records.

### Identity and classification

- `id`: database-generated immutable primary key.
- `canonicalId`: immutable unique seed identity, exactly `F01`–`F06` and `M01`–`M06`.
- `systemSeeded`: distinguishes canonical records from later owner-created tools.
- `seedVersion`: optional reconciliation metadata.
- `slug`: editable unique draft slug.
- `publishedSlug`: nullable unique last published slug.
- `kind`: `FLAGSHIP | MINI`.
- `category`: short controlled display category.
- `tags`: string array.

### Editable content

- `title`, `subtitle`, `shortDescription`, `overview`, `problemStatement`.
- `audience`, `featureBullets`, `proposedInputs`, `proposedOutputs`, `limitations` as bounded string arrays.
- `iconKey`: whitelisted icon identifier.
- `coverImage`, `galleryImages`: existing Media Library URLs/references.
- `pageBlocks`: validated Page Studio-compatible JSON for detail-page composition.

### Honest product state

- Product status: `PLANNED | PREVIEW | BETA | LIVE | ARCHIVED`.
- Demo mode: `CONCEPT | SAMPLE_INTERACTIVE | ACTUAL`.
- `demoNotice` is mandatory unless demo mode is `ACTUAL`.
- Display: existing `Visibility` semantics plus `visible`, `featured`, `sortOrder`.

### Links and actions

- `demoUrl`, `liveUrl`, `documentationUrl`, `liveUrlVerifiedAt`.
- `primaryLabel`, `primaryBehavior`: `AUTO | DEMO | LIVE | DETAILS`.
- `secondaryLabel`, `secondaryBehavior`, `secondaryUrl`.
- target: `SAME_TAB | NEW_TAB`; optional existing style variant.

Resolution is deterministic:

1. Hidden, private, archived or unpublished records are absent from public catalog/detail APIs.
2. `DETAILS` resolves to the canonical detail page.
3. `DEMO` resolves to a validated demo URL or internal `/creative-lab/{publishedSlug}/demo` fallback.
4. `LIVE` requires a verified HTTPS URL; otherwise it safely falls back to the internal demo.
5. `AUTO` uses a verified HTTPS live URL only for `BETA`/`LIVE`; all other states use the internal demo.
6. External new-tab links include `noopener noreferrer`. `javascript:`, malformed and non-HTTPS external URLs are rejected before publish.

### SEO and publishing

- Reuse the existing `ProjectStatus` publication lifecycle or introduce an equivalent explicit `DRAFT | PUBLISHED | ARCHIVED` field only if Prisma naming clarity requires it.
- Public reads use `publishedSnapshot` only. Saving draft fields cannot change the live page.
- Track `publishedAt`, `scheduledAt`, `publicModifiedAt`, timestamps and soft-delete/archive state.
- SEO fields: title, description, OG image, canonical URL, noindex, nofollow and sitemap inclusion.
- Public detail pages index only when published, visible/public, scheduled time has passed and `noIndex=false`.
- Unlisted pages are noindex and excluded from sitemap; private/hidden/archived pages return 404.
- Demo pages default to `noindex,follow`.
- Use `WebPage`/`CreativeWork` schema for concepts. Use `SoftwareApplication` only for a genuinely functional tool.
- Reuse `ContentRevision` with `resourceType = CREATIVE_TOOL` and existing `RedirectRule` behavior rather than building parallel revision/redirect systems.

## 4. RBAC

| Role | Tool access |
|---|---|
| ADMIN | Full read/write, global Creative Lab settings, seed reconciliation, archive/restore. |
| EDITOR | List, create, edit, duplicate, preview, publish/unpublish and media selection; cannot change `canonicalId` or security/seed controls. |
| VIEWER | Read-only admin access. |
| WRITER | No Creative Lab mutations initially. |
| MODERATOR | No Creative Lab mutations initially. |

Add Creative Lab paths deliberately to `src/lib/rbac.ts`; never rely on authentication alone. Admin responses are `no-store`.

## 5. Migration and seed rules

- Migration is additive: new enums/table/indexes only. Never alter or delete existing Project, Content, CustomPage or Page Studio records.
- Seed in one transaction and upsert by immutable `canonicalId`.
- The initial result is exactly six flagship and six mini records, all with `liveUrl = null`, preview/demo status and working internal demo URLs.
- The three initial featured records are Thumbnail Readability Tester, A+ Creative Planner and Creative Brief Builder.
- Re-running reconciliation creates missing canonical records but does not overwrite owner-edited copy, URL, visibility, order or status.
- Seed is an explicit command after migration, not a per-request/server-start operation.
- Never use `prisma migrate reset` on production data.
- Before publishing, preflight slug collisions against CreativeTool, CustomPage published paths and redirect rules.

## 6. Required acceptance matrix

- Existing public routes remain healthy.
- Catalog exposes twelve initial entries with computed six/six counts and useful search/filter empty states.
- Every canonical entry has an individualized detail and non-empty demo route.
- Concept notice is visible; no fake live CTA or dead link exists.
- Draft edits remain private; publish/unpublish/schedule/private/archive rules behave correctly.
- Invalid or colliding slugs and unsafe URLs are rejected.
- Published slug changes create both required 301 redirects without loops.
- Anonymous admin requests return 401; Viewer/Writer/Moderator mutation returns 403; Editor tool publishing works; global settings remain Admin-only.
- Public JSON has no draft/internal fields.
- Catalog/detail metadata and sitemap rules are correct; demos remain noindex.
- Running seed twice leaves exactly twelve canonical seeds and preserves an owner edit.
- At 360, 768 and 1280 px there is no horizontal overflow; filters/cards/controls are keyboard accessible, visibly focused and reduced-motion safe.

## 7. Existing architecture anchors

- Public route registration and generic Page Studio catch-all: `src/app.ts`.
- Page Studio reserved path validation and snapshot publishing: `src/lib/page-studio.ts`, `src/routes/page-studio.ts`, `src/routes/page-studio-public.ts`.
- Global authenticated admin boundary and RBAC: `src/app.ts`, `src/lib/rbac.ts`.
- Snapshot-compatible model precedent: `CustomPage` in `prisma/schema.prisma`.
- Revisions and redirects: `ContentRevision`, `RedirectRule`, `src/lib/revisions.ts`, `src/app.ts`.
- Existing Creative Stack anchor and managed navigation: `portfolio/index.html`, `portfolio/app.js`, `SiteSettings.navigationConfig`.
