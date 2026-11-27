# V2 Implementation Checklist

## Editorial case-study board width - 2026-11-12

- Reproduced the color-changing lip-tint board at 1280px viewport width: the `FULL_BLEED_IMAGE` figure expanded to the full viewport instead of respecting the case-study reading column.
- Full-bleed presentation boards now use the CMS gallery max width (900px default); extra-tall boards use the long-board max width (780px default).
- Standalone images receive aspect-aware classes after loading, plus a restrained frame, caption and shadow treatment.
- Focused suites pass 44/44; JS syntax, typecheck, build and diff check pass. Preview deployment/browser measurement is pending.
- Preview commit `cd2000f` serves the editorial-board assets. Browser measurement confirms the 1464x3600 board receives `is-long has-long-media`, renders 780px wide and centered at a 1280px viewport, and causes no horizontal overflow. Acceptance is complete.

## Homepage project-card navigation - 2026-11-12

- Reproduced the defect on Preview: clicking a project thumbnail opened the global image viewer and left the homepage URL unchanged.
- Converted homepage project cards from scripted article links to native `/work/:slug` anchors.
- Excluded project cards from the image-viewer capture handler while retaining zoom inside project-detail galleries.
- Added versioned homepage JS/CSS/viewer assets and a regression contract. Focused suites pass 44/44; typecheck, build and diff check pass.
- Preview deployment and browser click-through acceptance are pending.
- Preview commit `cc7503f` propagated with all three new asset keys. Browser click-through changed the URL to `/work/asf`, rendered `.project-detail`, and kept the image viewer closed. Acceptance is complete.

## Gallery preset deployment acceptance - 2026-11-12

- Preview commit `8e56754` serves `project.js?v=20261112-layout-presets-1` and `styles.css?v=20261112-layout-presets-1`.
- The TMNT route exposes backward-compatible AUTO attributes at 1280x720 with no horizontal overflow.
- Deployed inspection found the CMS shell could reuse an old `admin-addendum.js` URL; the shell loader is now cache-busted and protected by regression assertions.
- Preview commit `d93c729` now serves `admin-addendum.js?v=20261112-layout-presets-1`, which loads `admin-case-study.js?v=20261112-3`; deployment propagation is browser-verified.
- Focused tests pass 43/43, with typecheck, build and diff check also passing after the fix.
- Authenticated CMS save/reload remains unverified because Preview is signed out.

## Case-study media polish - 2026-11-12

- Long Behance boards now receive aspect-aware hero crops instead of tiny letterboxed previews.
- Single long boards use a centered readable width; multi-image galleries use a consistent two-column desktop and one-column mobile grid.
- Frontend/Behance tests 33/33, JavaScript syntax, TypeScript and diff checks pass; deployed Preview visual acceptance is `VERIFIED`.
- Live Preview confirms the corrected hero layer matches its 1120×630 stage and the complete long board centers at 780px with zero fallback, overflow or browser logs.
- The project-page stylesheet cache key is advanced for the bounded-frame follow-up so Preview cannot retain the first crop implementation.
- Hero frames now reserve a consistent responsive aspect ratio before media decode, preventing collapsed loading states on uncached landscape assets.

## Behance production-release checkpoint - 2026-11-12

- Ten additional owner-published projects and verified local media are implemented with create-only, archive-first safeguards.
- The complete 251-test suite, static smoke 5/5, performance budget, Prisma validation/generation, TypeScript build and diff check pass.
- Stable Preview browser acceptance passes for all 10 routes: expected H1/title, real local image dimensions, zero media fallbacks and zero browser log entries.
- The work archive exposes exactly all 10 new slugs; the homepage exposes none, confirming archive-first placement.
- P8-003 production release `91f752f` is `VERIFIED`: `main` was pushed once, all ten routes/media passed, archive count is 10, homepage auto-feature count is 0, and browser logs are empty.
- Preview branch is synchronized with the released application tree; only its later production-acceptance audit records differ from the squash commit on `main`.

## Behance commercial case-study checkpoint - 2026-11-11

- P4-003 is `VERIFIED`: 4 selected owner-published Behance projects have evidence-led case-study packages, local media, an edit-preserving seed path, and deployed Preview browser evidence.
- Records prepared: `tmnt-face-body-glitter-jelly-amazon-listing`, `round-powder-brush-amazon-premium-a-plus`, `divine-face-perfecting-kit-amazon-premium-a-plus`, and `color-changing-lip-cheek-tint-amazon-premium-a-plus`.
- Preview deployments publish these four records after migrations; production deployments explicitly skip the Behance seed pending a separate owner-approved release. Existing CMS slugs are never overwritten.
- Evidence: Prisma client generation, typecheck, build, Behance tests 9/9, commercial case-study tests 4/4, V2 case-study tests 4/4, and diff check passed. The stable Preview rendered all four public routes with correct headings/deliverables, valid loaded image dimensions, and zero captured browser-console errors.

## Final closeout evidence — 2026-11-03

- Consolidated local gate: `VERIFIED` — Prisma schema validation (loopback dummy URL only), client generation, typecheck/build, 237/237 tests, static smoke 5/5, performance budget and `git diff --check` passed.
- Admin GPU mitigation: `VERIFIED` by source regression and final automated gate; deployed Preview browser/GPU observation remains pending until the new commit is Ready.
- Preview backup integrity: `VERIFIED` locally (CMS-only, private data excluded, checksum matched).
- Preview `SKIP_EXISTING` restore round-trip: `BLOCKED / NOT VERIFIED` because the available browser automation cannot attach the local JSON file. No database mutation occurred. Manual UI upload is still required; never use `REPLACE`.
- Remaining verification gaps must not be promoted without evidence: P3-007, P4-005, P4-006, P5-005 and the P8-001 restore drill. P4-003 is now verified.

Source specification: `docs/MAHMUD_CODEX_MASTER_IMPLEMENTATION_INSTRUCTIONS_V2.md`
Specification SHA-256: `C14540F0234C91EB7D4210AD4862CD88526FBBC3100DF8EAA76615B3BCF70407`

Statuses: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `VERIFIED`. `VERIFIED` requires the acceptance criteria to be checked against the repository or a running build.

## Phase 0 — Reconciliation, safety and durable execution

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P0-001 | Repository audit | Map stack, routes, CMS, Page Studio, data models, tests and gaps without changing working behavior. | None | VERIFIED | Audit document reflects actual repository and identifies the canonical extension path. | Verified against routes, schema, migrations, public pages and package scripts on 2026-10-29. |
| P0-002 | Persistent progress system | Add checklist, project progress, session handoff and implementation log. | P0-001 | VERIFIED | All four files exist, are useful to a fresh session and agree with Git state. | Four files re-read during a fresh `Continue` reconciliation on 2026-10-29. |
| P0-003 | Task-based agent routing | Add project-scoped medium/high agents and additive routing instructions. | P0-001 | VERIFIED | TOML parses; required fields and requested model/effort exist; installed Codex accepts project config. | Python TOML parse passed; Codex CLI 0.164.0 strict read-only invocation recognized `medium_worker — medium` and `high_specialist — high`. |
| P0-004 | Baseline validation | Run focused existing regression suites and TypeScript build before feature work. | P0-001 | VERIFIED | Build and relevant repository tests pass, or failures are recorded with evidence. | Build passed; 85 automated checks passed across frontend (21), Page Studio (49), operations (7), slider (5), publish safety (3), plus static smoke. |
| P0-005 | Risk and boundary map | Record public/private routes, RBAC, publishing, migration and rollback constraints. | P0-001 | VERIFIED | Audit identifies protected systems and additive-only rules. | `docs/implementation-audit.md` checked against Prisma schema, route modules and Page Studio gates. |

## Phase 1 — Information architecture and reusable foundations

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P1-001 | V2 route and navigation map | Define Creative Lab, recruiter, studio, services and case-study routes while preserving legacy URLs. | P0-004 | VERIFIED | Route map has no collisions and specifies redirects/canonicals. | `docs/v2-route-domain-contract.md` cross-checked against explicit routes, redirect order and Page Studio catch-all/reserved roots. |
| P1-002 | Creative Lab domain contract | Define canonical tool types, status lifecycle, CTA/link fields, media, ordering and visibility. | P1-001 | VERIFIED | Contract covers all 12 tools and admin/public boundaries. | High-specialist review plus schema/RBAC/publishing comparison; contract includes seed, URL, snapshot, SEO and acceptance rules. |
| P1-003 | Reusable public components | Establish lightweight cards, status badges, CTAs and section patterns using existing design tokens. | P1-002 | VERIFIED | Components are reusable, responsive and accessible without heavy dependencies. | Four component tests pass; TypeScript build passes; CSS includes mobile, focus-visible and reduced-motion behavior. |
| P1-004 | Recruiter/client experience skeleton | Add safe route/page foundations for `/hire` and `/studio`. | P1-001 | COMPLETED | Routes render intentional empty/skeleton states and preserve existing navigation fallback. | Static route/order/reserved-root tests 3/3 and build pass; runtime HTTP verification pending because local DB connection did not become ready. |
| P1-005 | Case-study content contract | Extend existing Project/Page Studio concepts for commercial case studies and technical work. | P1-001 | VERIFIED | Contract supports role, challenge, process, deliverables and outcomes without destroying existing data. | `docs/v2-case-study-contract.md` verified against Prisma, admin validation/editor, public filters, Page Studio projections and RBAC; contract tests 4/4 pass. |

## Phase 2 — Creative Lab catalog and 12 concept tools

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P2-001 | Additive tool schema and migration | Add durable tool catalog records with media, CTAs, URLs, visibility, order and lifecycle status. | P1-002 | COMPLETED | Additive migration deploys on populated DB; no existing records are altered. | High-specialist review complete; schema/migration tests 3/3, Prisma validation/generation and build pass. Populated-DB migration apply remains required for VERIFIED. |
| P2-002 | Idempotent 12-tool seed | Seed six flagship and six mini tools without duplicating records. | P2-001 | COMPLETED | Re-running seed is safe; exact catalog exists with honest demo status. | Fixture/seed tests 4/4 prove exact 6/6 IDs, honest demos, sanitized snapshots and an edit-preserving update branch. Real PostgreSQL double-run remains required for VERIFIED. |
| P2-003 | Creative Lab catalog page | Build filterable public catalog using published/visible records. | P2-002, P1-003 | COMPLETED | Desktop/mobile/keyboard/empty states verified. | Catalog/API contract tests 3/3, component tests 5/5 and build pass; DB-backed browser verification remains required for VERIFIED. |
| P2-004 | Tool detail route | Add stable SEO-ready detail route with editable CTAs and status. | P2-002 | COMPLETED | Every visible tool has canonical detail page; invalid slug is safe. | Detail/API/demo route tests 3/3 and build pass; DB-backed route verification remains required for VERIFIED. |
| P2-005 | Amazon Thumbnail Readability Tester demo | Create clearly labeled internal concept demo. | P2-004 | COMPLETED | Demo route works and does not claim production analysis. | Sample-only 80/120/160 comparison, background controls, keyboard/focus/mobile/reduced-motion states and explicit no-upload/OCR/scoring/compliance boundary pass 3 focused tests; DB-backed browser verification remains pending. |
| P2-006 | Text Readability & Contrast Analyzer demo | Create clearly labeled internal concept demo. | P2-004 | COMPLETED | Demo route works with accessible sample states. | Three fixed sample states, scale control, keyboard/focus/mobile/reduced-motion behavior and explicit no-upload/OCR/full-image-certification boundary pass 3 focused tests; DB-backed browser verification remains pending. |
| P2-007 | Amazon Listing & A+ Creative Planner demo | Create clearly labeled internal concept demo. | P2-004 | COMPLETED | Demo route works and labels generated content as sample. | Fictional-product listing/A+ lanes, editable audience/module-count controls, policy boundary and responsive behavior pass 3 focused tests; DB-backed browser verification remains pending. |
| P2-008 | Smart Creative Brief Builder demo | Create clearly labeled internal concept demo. | P2-004 | COMPLETED | Demo route demonstrates workflow without fake backend claims. | Bounded local-only form, textContent preview, native validation/status/mobile behavior and explicit no-submit/save/email/AI boundary pass 3 focused tests; DB-backed browser verification remains pending. |
| P2-009 | Amazon Listing Visual Audit demo | Create clearly labeled internal concept demo. | P2-004 | COMPLETED | Demo route presents bounded sample criteria. | Six authored criteria, explainable status filters, responsive behavior and explicit no-upload/computer-vision/compliance/real-audit boundary pass 3 focused tests; DB-backed browser verification remains pending. |
| P2-010 | Creative Review & Approval Portal demo | Create clearly labeled internal concept demo. | P2-004 | COMPLETED | Demo route explains prototype limitations. | Authored versions/comments, local decision state, security/persistence boundary, keyboard/mobile/reduced-motion behavior pass 3 focused tests; DB-backed browser verification remains pending. |
| P2-011 | Six mini-tool demos | Add Dimension/Safe-Zone, Background Inspector, Visual Brief PDF, Brand Asset Kit, Presentation Builder and Handoff Checklist concept routes. | P2-004 | COMPLETED | Six distinct usable concept pages exist and remain lightweight. | Six separate local-only interactions, module integration, keyboard/mobile/reduced-motion behavior and boundary tests pass 4/4; DB-backed browser verification remains pending. |
| P2-012 | Homepage Creative Lab teaser | Add CMS-controlled lightweight teaser linking to catalog. | P2-003 | COMPLETED | Hidden/empty state does not leave gaps; CTA editable. | Hidden-first public section, bounded CMS config, canonical catalog cards, Homepage Studio mapping and focused 4/4 tests pass; DB-backed browser verification remains pending. |
| P2-013 | Catalog routing and accessibility tests | Add regression coverage for visibility, status, routes and keyboard/mobile behavior. | P2-003–P2-012 | COMPLETED | Automated tests cover all 12 entries and critical public states. | Aggregate 4/4 gate plus all Phase 2 focused suites and build pass; DB-backed browser verification remains pending. |

## Phase 3 — Durable CMS control and Page Studio integration

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P3-001 | Tool manager list | Add authenticated search/filter/order/status interface. | P2-001 | COMPLETED | Role-appropriate users can inspect tools; viewer cannot mutate. | Focused 3/3, frontend 21/21, Phase 2 gate 4/4, catalog 3/3, schema 3/3 and build pass. DB-backed authenticated browser verification remains pending. |
| P3-002 | Tool editor | Edit title, descriptions, icon/image, labels, demo/live URLs, visibility, order and status. | P3-001 | COMPLETED | Server validation and friendly errors cover every required field. | Editor 3/3, manager 3/3, Phase 2 gate 4/4, frontend 21/21, catalog 3/3, schema 3/3, JS syntax, TypeScript build and diff check pass. DB-backed authenticated verification remains pending. |
| P3-003 | Draft/publish and revision safety | Integrate tool changes with existing revision/publishing patterns. | P3-002 | COMPLETED | Draft cannot leak; publish is explicit; revision can be inspected/restored. | Publish/unpublish/revision/restore contract 4/4, editor 3/3, manager 3/3, Phase 2 gate 4/4, frontend 21/21, catalog 3/3, schema 3/3, foundation 5/5, publish safety 3/3, JavaScript syntax, TypeScript build and diff check pass. DB-backed authenticated runtime verification remains required for VERIFIED. |
| P3-004 | Media and URL validation | Reuse Media Library and validate internal/external URLs. | P3-002 | COMPLETED | Broken or unsafe URLs are rejected; media remains durable. | Existing Media Library picker reuses cover/gallery/OG assets without upload duplication. Explicit live-URL verification uses HTTPS-only DNS/IP pinning, redirect/timeout/size bounds, optimistic locking and audit logging; it never runs on draft save. Focused 3/3, publishing 4/4, editor 3/3, manager 3/3, Phase 2 4/4, frontend 21/21, publish safety 3/3, JS syntax, TypeScript build and diff check pass. DB-backed authenticated runtime verification remains required for VERIFIED. |
| P3-005 | Slug redirect safety | Preserve changed published slugs with redirects and no loops. | P3-002 | COMPLETED | Old URL redirects once to canonical URL. | Explicit publish creates an atomic old-to-new Creative Lab redirect, flattens prior internal aliases to one hop, rejects path claims/chains/conflicts, and uses serializable optimistic transactions. Redirect 4/4, publishing 4/4, media/URL 3/3, Phase 2 4/4, frontend 21/21, publish safety 3/3, TypeScript build and diff check pass. DB-backed runtime verification remains required for VERIFIED. |
| P3-006 | Page Studio tool blocks | Add tool catalog/card/detail CTA blocks without parallel CMS data. | P3-002 | COMPLETED | Blocks reference canonical tool records and respect publish state. | Catalog/card/CTA blocks store canonical IDs and bounded presentation only; server resolves eligible published snapshots, catalog excludes UNLISTED, renderer has responsive/empty states, Widget QA covers all three. Focused 3/3, Page Studio 49/49, Phase 2 4/4, frontend 21/21, TypeScript build and diff check pass. DB-backed editor/public verification remains required for VERIFIED. |
| P3-007 | End-to-end CMS verification | Test authorized/unauthorized CRUD, publish, reorder and public rendering. | P3-001–P3-006 | BLOCKED | Role matrix and public/private boundaries verified. | No `.env`, `TEST_DATABASE_URL`, local PostgreSQL client or Docker runtime is available. Production mutation is prohibited; static/focused coverage passes, but DB-backed verification remains pending. |

## Phase 4 — Portfolio, recruiter and client conversion experiences

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P4-001 | Recruiter Mode | Build `/hire` with career positioning, featured work, experience, capabilities, CV and recruiter CTA. | P1-004, P1-005 | COMPLETED | English-first, accessible, CMS-editable and indexable. | Bounded recruiter schema, published-only projection, conditional CV/contact, English quick-scan/deep-evidence page and friendly sibling-preserving CMS editor are implemented. Recruiter 5/5, V2 routes 3/3, frontend 21/21 and TypeScript build pass; static desktop/mobile shell and sticky navigation were visually checked. DB-backed save/role/API output remains required for VERIFIED. |
| P4-002 | Client / Studio Mode | Build `/studio` with services, relevant work, process, testimonials and inquiry CTA. | P1-004, P1-005 | COMPLETED | Client journey is distinct and CMS-editable. | Strict bounded config, published-only work/testimonial projection, sibling-preserving CMS editor, services/process/FAQ repeaters, safe CTAs and meaningful no-data fallback are implemented. Studio 5/5, recruiter 5/5, V2 routes 3/3 and build pass. Desktop 1440x900 and mobile 390x844 static browser checks passed with no overflow and a working mobile menu; DB-backed CMS/API verification remains required for VERIFIED. |
| P4-003 | Commercial case studies | Upgrade 4–6 selected projects into complete evidence-led case studies. | P1-005 | VERIFIED | Each has role, challenge, tools, process, deliverables and honest outcome. | 4/4 selected owner-published Behance evidence packages are implemented with accessible media, observable process, empty unverified metrics, Preview-only publishing, production skip, and edit-preserving seed behavior. Typecheck/build and 17/17 focused checks pass; all four deployed Preview routes render with valid images and zero captured console errors. |
| P4-004 | Service landing pages | Add Amazon/e-commerce, brand systems and digital experience service pages. | P4-002 | COMPLETED | Pages have clear offer, proof, process and CTA. | Three strict routes reuse canonical Studio CMS services/process/CTAs and eligible published projects; API/publication/alias/responsive/static checks pass 5/5 and build passes. DB-backed CMS roundtrip and browser visuals remain required for VERIFIED. |
| P4-005 | Three-minute recruiter presentation | Add focused presentation route/view assembled from CMS content. | P4-001, P4-003 | VERIFIED | View is concise, keyboard usable and shareable without exposing drafts. | Stable Preview renders the 8-step recruiter view at 463px, loads verified published project evidence, advances from step 2 to 3 with ArrowRight, has no console errors and remains noindex. |
| P4-006 | Page Studio technical case study | Publish an honest technical/creative case study of the modular CMS work. | P4-003 | VERIFIED | Architecture, workflow, QA and personal contribution are documented. | Stable Preview renders `/pages/modular-page-studio-technical-case-study` with all ten evidence sections, no unresolved placeholder, no horizontal overflow at 463px and no console errors. No fabricated media or metric was added. |
| P4-007 | Inquiry segmentation and conversion tracking | Separate recruiter/client intent and track privacy-respecting CTAs. | P4-001, P4-002 | COMPLETED | Leads and analytics show route/intent without storing sensitive payloads. | Strict GENERAL/CLIENT/RECRUITER intent and bounded source tags feed the existing Lead Center/exports; aggregate analytics contexts/counts exclude message/contact payloads. Focused checks pass 5/5 and build passes; DB-backed submission/report roundtrip remains required for VERIFIED. |

### P4-001 checkpoint — 2026-10-30

- Code-level implementation now includes the English `/hire` shell, bounded recruiter schema, published-evidence projection, conditional CV behavior and a dedicated friendly CMS editor that merges only `aboutConfig.recruiterConfig`.
- ADMIN/EDITOR mutation uses `/api/admin/maintenance/recruiter-profile`; database-current About siblings such as CV data are preserved, and invalid recruiter payloads are rejected by the canonical schema.
- Focused recruiter tests pass 5/5, V2 route tests pass 3/3, frontend regressions pass 21/21, JavaScript syntax and TypeScript build pass.
- Status is `COMPLETED`, not `VERIFIED`: authenticated save/round-trip, role-denial, DB-derived `/hire` output and editor desktop/mobile visuals require a safe non-production PostgreSQL/session target.

### P4-002 checkpoint — 2026-10-30

- Added canonical Studio configuration and a published-only public projection for services, selected work, process, testimonials, FAQ and bounded CTAs.
- Added a friendly ADMIN/EDITOR CMS workflow that preserves unrelated About/CV/Recruiter data and leaves unpublished proof private.
- Added honest default services/process content so the page does not collapse when Studio settings are not yet authored; testimonials are never invented.
- Studio tests pass 5/5, Recruiter regressions 5/5, V2 routes 3/3, JavaScript syntax, TypeScript build and diff check pass.
- Static browser checks at 1440x900 and 390x844 found no horizontal overflow; fallback services/process render and the mobile menu opens correctly. DB-backed CMS save/API projection remains unverified.

## Phase 5 — Six mini-tool engines

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P5-001 | Dimension & Safe-Zone Checker | Implement bounded production-capable engine. | P3-007 | COMPLETED | Inputs, outputs, errors, privacy and mobile behavior verified. | Canonical M01 provides local PNG/JPEG/WebP inspection, 12 MB/12,000 px limits, real dimensions/ratio, generic/custom presets, safe-zone overlay and local checklist export without network/storage. Focused checks pass 4/4 and the batch build passes. Browser image/download and responsive visual verification remain pending, so this is not `VERIFIED`. |
| P5-002 | Product Background Inspector | Implement bounded production-capable engine. | P3-007 | COMPLETED | Documented criteria and honest limitations verified. | Canonical M02 performs bounded local downsampling and explainable near-white border, edge-contact and transparency sampling with an editable threshold; it never removes backgrounds or claims compliance. Focused checks pass 4/4 and the batch build passes. Browser/human-review and responsive visual verification remain pending, so this is not `VERIFIED`. |
| P5-003 | Visual Brief to PDF | Implement export workflow with safe limits. | P3-007 | COMPLETED | Output is valid, accessible and protected from unsafe content. | Canonical M03 now provides bounded editable brief fields, optional local-only PNG/JPEG/WebP logo (2 MB), accent and section controls, a branded accessible preview and browser print/Save-as-PDF output. It performs no network/storage operation and states its limitations. Focused checks pass 4/4, aggregate mini-demo checks pass 4/4, JavaScript syntax and TypeScript build pass. Browser print/PDF output and desktop/mobile visuals remain unverified, so this is not `VERIFIED`. |
| P5-004 | Brand Asset Kit Generator | Implement lightweight asset-system output. | P3-007 | COMPLETED | Export and preview are consistent with global design tokens. | Canonical M04 now has bounded editable identity/palette/type/guidance tokens, documented system-font stacks, a live token-driven guide, versioned local JSON download and print output. Focused checks pass 4/4, aggregate mini-tool 4/4 and build pass. Browser export/print and responsive visual verification remain pending, so this is not `VERIFIED`. |
| P5-005 | Portfolio Presentation Builder | Implement selected-project presentation workflow. | P4-003 | VERIFIED | Published-only records and responsive presentation verified. | Stable Preview renders the client presentation responsively at 463px. The project step resolves the published TMNT case study with role, deliverables, challenge, approach and canonical work link; keyboard navigation and console checks pass. |
| P5-006 | Design Handoff Checklist | Implement reusable checklist workflow. | P3-007 | COMPLETED | State, export and accessibility verified. | Canonical M06 supports local project labels, up to 24 checks, custom items, remove/reset, live progress, copyable summary and print output without persistence/network transfer. Focused checks pass 3/3 and the batch build passes. Browser clipboard/print and responsive visual verification remain pending, so this is not `VERIFIED`. |

## Phase 6 — Six flagship tool engines

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P6-001 | Thumbnail Readability engine | Implement evidence-based scoring/export workflow. | P2-005, P3-007 | COMPLETED | Results are explainable, bounded and tested. | Canonical F01 now performs browser-local PNG/JPEG/WebP decoding with 12 MB, 12,000 px and 40 MP bounds; shows 80/120/160 px previews; reports source dimensions, global luminance spread, edge density and human-review completion without an arbitrary composite score; and exports a local method/limitations report. Focused engine checks pass 6/6, detail 3/3, Phase 2 gate 4/4, syntax, TypeScript build and diff check pass. Browser upload/download/responsive review and DB-backed P3-007 acceptance remain pending, so this is not `VERIFIED`. |
| P6-002 | Contrast Analyzer engine | Implement real image/text analysis workflow. | P2-006, P3-007 | COMPLETED | Contrast/readability behavior and limits are verified. | Canonical F02 now provides exact foreground/background WCAG contrast math, normal/large-text AA/AAA thresholds, editable type/scale preview, bounded local PNG/JPEG/WebP pixel sampling and local report export. It explicitly does not run OCR, locate text or certify flattened imagery/interfaces. Focused checks pass 5/5, Phase 2 gate 4/4, syntax, TypeScript build and diff check pass. Browser sampling/download/responsive review and DB-backed P3-007 acceptance remain pending, so this is not `VERIFIED`. |
| P6-003 | A+ Creative Planner engine | Implement structured planning workflow. | P2-007, P3-007 | COMPLETED | Input/output persistence and export are verified. | Canonical F03 now provides bounded product/category/marketplace/audience/tone, 4–9 listing and 3–7 A+ roles, USP/asset/evidence inputs, deterministic plan generation, exact repetition flags and local JSON/text exports. No remote persistence, generated claims or universal compliance advice is implied. Focused 4/4, F01 6/6, F02 5/5, Phase 2 gate 4/4, syntax, TypeScript build and diff check pass. Browser/export/responsive and DB-backed persistence acceptance remain pending, so this is not `VERIFIED`. |
| P6-004 | Creative Brief Builder engine | Implement client-ready brief workflow. | P2-008, P3-007 | COMPLETED | Draft, validation and export are verified. | Canonical F04 now validates bounded brand/product/goal/audience/deliverable/deadline/budget/file/reference/constraint inputs, identifies required clarification questions and exports local JSON/text. It does not submit, persist, email, approve or create a contract. Focused 4/4, syntax and TypeScript build pass; browser/export and DB-backed acceptance remain pending, so this is not `VERIFIED`. |
| P6-005 | Listing Visual Audit engine | Implement criteria-driven audit and report. | P2-009, P3-007 | COMPLETED | Audit is explainable and does not overclaim automated certainty. | Code gate: eight human criteria, evidence-bound statuses, factual counts and local JSON/text export; focused 4/4, JS syntax, TypeScript build and diff check pass. Browser/responsive and DB-backed acceptance remain unverified. |
| P6-006 | Review & Approval engine | Implement secure review, comments, versions and approval. | P2-010, P3-007 | COMPLETED | Tokens, permissions, expiry, audit trail and privacy verified. | Public-safe code gate: isolated workspaces/immutable versions, hash-only expiring scoped tokens, revoke/close, strict HttpOnly exchange, redacted DTO, comments/exact-version decisions, origin/rate-limit/privacy headers and audit events. Security suite 4/4, prototype regression 3/3 and build pass. Migration/runtime/browser remain unverified; confidential binary delivery is blocked without private storage. |

## Phase 7 — SEO, analytics, accessibility, security, performance and QA

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P7-001 | SEO/GEO integration | Extend sitemap, metadata, schema, llms.txt controls and entity data to new routes. | P2, P4 | COMPLETED | Published routes are discoverable; drafts/demos follow intended indexing rules. | Code gate: published/indexable tools and published services plus hire/studio/lab added to sitemap; llms index extended; demos/reviews remain noindex. Combined discovery suite 3/3 and build pass; live crawler verification pending. |
| P7-002 | Creative Lab analytics | Add privacy-respecting catalog/detail/demo/CTA events and exports. | P2, P4 | COMPLETED | Event taxonomy and reporting are documented and tested. | Code gate: tool card/detail/demo/live and recruiter CTA events, DNT/GPC guard, hashed visitor/session pipeline and event-taxonomy XLSX/report endpoint. Combined suite 3/3 and build pass; configured runtime reporting pending. |
| P7-003 | Accessibility audit | Verify keyboard, focus, labels, contrast, reduced motion and screen-reader semantics. | P2–P6 | COMPLETED | No known critical WCAG 2.2 AA regression remains. | Code/static gate: visible focus, reduced motion, semantic surface checks, keyboard project tabs and full widget fixture pass quality suite 4/4. Automated audit is not certification; browser/screen-reader/contrast review remains unverified. |
| P7-004 | Responsive/visual regression QA | Cover desktop/tablet/mobile and critical builder/public components. | P2–P6 | COMPLETED | QA artifacts identify and prevent major layout regressions. | Added loopback static server and Playwright desktop/mobile route/overflow/page-error suite. First run was blocked because Playwright browser binaries are absent; preview-browser verification remains pending. |
| P7-005 | Security review | Review RBAC, validation, uploads, embeds, tokens, headers and rate limits. | P2–P6 | COMPLETED | High-risk findings are fixed or explicitly blocked. | Legacy share now has expiry/revoke/audit/rate-limit/no-store/noindex/referrer controls, logging suppression, redacted project DTO and no reviewer PII response; modern workspace controls remain tested. Confidential binary review remains explicitly blocked. |
| P7-006 | Performance budget | Optimize assets, lazy loading, caching and animation; retain fast perceived speed. | P2–P6 | VERIFIED | Agreed budgets are measured and no severe regression exists. | Seven named critical assets total 424,033 measured bytes and each passes its repository budget; lazy media, reduced-motion, no autoplay and deferred head-script safeguards pass. Homepage public-media script now defers. |
| P7-007 | WordPress/export portability | Keep clean structured exports and document migration mapping. | P3, P4 | COMPLETED | Content can be exported without proprietary UI state leakage. | Handoff v2 exports enabled content, semantic design tokens, media manifest and migration notes; omits editor state, animation data and executable JS, and flags dynamic blocks for manual review. Quality/Page Studio tests pass; browser download remains unverified. |

## Phase 8 — Release readiness

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P8-001 | Full regression and data safety | Run builds, tests, migration checks, route checks and backup/restore validation. | P1–P7 | IN_PROGRESS | Required suites pass against a production-like copy; no data loss. | Local gate: Prisma validate/generate, 232/232 tests, static smoke, performance budget, TypeScript build and diff check pass. Preview runtime, canonical 12-tool catalog, ADMIN dashboard, Creative Lab manager/editor, Analytics, SEO, Control Center and Settings are browser-verified read-only. A mobile drawer regression was reproduced: the toggle changed state while the sidebar stayed off-screen. A scoped CSS/cache-busting fix and regression test pass locally; redeploy browser verification plus backup/restore and non-admin RBAC remain pending. |
| P8-002 | Documentation and operations | Finalize admin guides, environment guide, rollback and ownership notes. | P8-001 | COMPLETED | A new maintainer can operate and recover the system. | Added Creative Lab admin/roadmap, WordPress migration, operations/release, verification and preview release notes; recovery files remain canonical. Maintainer walkthrough not independently verified. |
| P8-003 | Authorized release | Prepare release notes and deploy only with explicit user authorization. | P8-001, P8-002 | IN_PROGRESS | User approves; release is monitored and rollback-ready. | Preview is deployed through commit `945ed90`. Homepage, Recruiter, Studio, Creative Lab, 12-tool catalog, one detail route and one interactive demo are browser-verified on the stable branch alias. An ADMIN Preview session now verifies the CMS dashboard and principal read-only workspaces; a mobile drawer correction is locally tested and awaits Preview redeploy/browser confirmation. Four legacy local-upload assets still return 404. Production/main remains unauthorized. |

Checkpoint update (2026-11-02): Preview is now deployed through `555e6c6`. Vercel marks immutable deployment `8wpfNd8c6v2T7oKBuySifBHzEy9w` Ready and it serves the corrected mobile asset. The stable branch alias still served its previous asset during repeated checks, so P8-001/P8-003 remain `IN_PROGRESS` pending alias mobile visual verification, backup/restore and non-admin RBAC.

Mobile follow-up (2026-11-02): `b002827` resolved the parent-loader cache key; the stable alias then opened the drawer at `x=0` and reached System Health. A newly observed close-after-navigation defect is patched in the canonical capture-phase tab router with `admin.js?v=20261102-4`; P8-001/P8-003 remain `IN_PROGRESS` pending redeploy/browser confirmation, backup/restore and non-admin RBAC.

Mobile acceptance (2026-11-02): Preview commit `a65519c` is deployed and browser-verified at 462x698. The drawer opens at `x=0`, lower navigation is scroll-reachable, Account/Lead Center/System Health routes work, and the drawer closes with correct ARIA/position state. Page Studio and Homepage Studio also render read-only. P8-001/P8-003 remain `IN_PROGRESS` only for remaining backup/restore, non-admin RBAC, test-owned mutation cleanup and legacy media decisions.

Viewer lifecycle follow-up (2026-11-02): one test-owned Preview Viewer account was created, persisted, used for an isolated login attempt and disabled afterward. The create form's post-request `event.currentTarget` failure is fixed and covered by 21/21 frontend regressions plus a passing TypeScript build. The isolated Viewer tab became unresponsive before permission boundaries could be inspected, so non-admin RBAC and P8-001/P8-003 remain `IN_PROGRESS`; backup/restore and legacy media decisions also remain.

Restore hardening follow-up (2026-11-03): the restore route now retains a private-aware pre-restore payload and applies every collection mutation atomically in one serializable transaction. `SKIP_EXISTING`, counters, immutable identities, date normalization and natural-key ID conflicts are handled consistently. Operations 9/9, frontend 21/21, build, typecheck and diff check pass. P8-001 remains `IN_PROGRESS` until a reversible test-owned Preview database drill confirms rollback, download and round-trip behavior.

Preview propagation follow-up (2026-11-03): commit `cf230f2` reached the stable Preview alias; the homepage and CMS sign-in shell load, and the CMS shell serves the new `admin-page-studio.js?v=20261102-11` asset. This confirms deployment propagation only. P8-001 remains `IN_PROGRESS` because no restore drill or complete non-admin RBAC acceptance has run.

Consolidated quality follow-up (2026-11-03): build/typecheck, operations 9/9, frontend 21/21, V2 quality 4/4, performance budgets, Creative Lab Phase 2 4/4, all six flagship focused suites, review-workspace security 4/4 and diff check pass. The six flagship demo routes were browser-checked at 1440x900 and 390x844 without checked horizontal overflow or console errors. These tasks remain `COMPLETED`, not `VERIFIED`, because their full upload/export/approval workflows and DB-backed P3-007 acceptance were not exercised. P8-001/P8-003 remain `IN_PROGRESS` for authenticated reversible restore and complete non-admin RBAC acceptance. Protected Preview crawler endpoints remain `NOT VERIFIED` because unauthenticated probes return Vercel Deployment Protection HTML.

Viewer/backup follow-up (2026-11-03): isolated Preview Viewer authentication is runtime-evidenced. Exercised read routes returned 200 and protected analytics/maintenance/inquiry/activity routes returned 403; the test account was disabled afterward. A CMS-only portable backup exported successfully and was downloaded locally with checksum prefix `1d383c499dbe`; private inquiries were excluded. Restore validation/application and the Editor/Writer/Moderator runtime matrix remain pending, so P8-001/P8-003 stay `IN_PROGRESS`.

Role-matrix follow-up (2026-11-03): Editor, Writer and Moderator logins/auth-me succeeded on isolated Preview origins. Editor/Writer content reads and Moderator lead/content reads returned 200; the earlier Viewer run provides 403 protected-route evidence. Static regressions cover the associated write restrictions. The reused test account was restored to `VIEWER` and `DISABLED`. Non-admin acceptance is complete for these bounded routes; P8-001/P8-003 remain `IN_PROGRESS` only for backup validation and reversible `SKIP_EXISTING` restore/pre-restore-copy evidence.

Backup-integrity follow-up (2026-11-03): the downloaded CMS-only Preview export parses as `mahmudul-portfolio-backup-v2`, reports schema `2.0`, contains 18 manifest sections, and has matching manifest/data collection counts. Recomputing SHA-256 with the server's exact unsigned-JSON algorithm matches checksum prefix `1d383c499dbe`. `includesPrivateData` is false, no `inquiries` collection exists, and media binaries are not embedded. This verifies the local artifact only; server validation and the reversible `SKIP_EXISTING` restore remain `NOT VERIFIED`, so P8-001/P8-003 stay `IN_PROGRESS` pending explicit upload/restore confirmation.

Implementation-batch follow-up (2026-11-03): the CMS no longer starts the public O(n²) neural-particle canvas. Admin retains a static branded grid/orb background with no perpetual animation; public pages keep their existing interactive background. A focused regression contract was added but intentionally not executed yet because the owner requested one consolidated verification batch after implementation. P4-005/P4-006 are now accurately `BLOCKED` by P4-003 real evidence rather than left ambiguously `IN_PROGRESS`.

Preview-experience activation checkpoint (2026-11-11): P4-003's four verified Behance records remove the data dependency for P4-005/P4-006/P5-005. A production-skipping, one-time Preview seed activates both presentations, enables public Page Studio, and create-once publishes the technical case study. Existing settings/pages are preserved after initial activation. Focused tests (4+5+5+9+4+4), typecheck, build and diff check pass; tasks remain `IN_PROGRESS` until the deployed routes are browser-verified.

Preview-experience acceptance (2026-11-11): commit `e75ba51` reached the stable Preview alias. Recruiter and client presentations rendered at a 463x698 viewport, ArrowRight advanced the live progress state, and a published Behance case-study step exposed only its public evidence. The technical Page Studio case study rendered all ten sections with no placeholder, horizontal overflow or browser-console errors. P4-005, P4-006 and P5-005 are `VERIFIED`. P8-001/P8-003 remain `IN_PROGRESS`: the prior local backup file is absent and the current CMS session is signed out, so no restore mutation was attempted; Browser Use also blocks direct text/XML navigation to protected crawler endpoints.

Case-study presentation controls (2026-11-12): `caseStudyStyle` is now an additive nullable Project JSON property with validated CMS controls for hero aspect/fit/focal point, gallery columns, standard/long-board widths and spacing. Existing records retain the current responsive `AUTO` defaults. Prisma generation/validation, TypeScript typecheck/build, JavaScript syntax, diff check and the focused Behance/commercial/frontend suites (38/38) pass. Status is `TESTED`; Preview deployment and authenticated CMS round-trip/visual verification remain pending.

Preview propagation (2026-11-12): commit `5815335` reached the stable Preview alias with `project.js?v=20261112-case-media-2` and `styles.css?v=20261112-case-media-4`. The TMNT detail page exposes the expected AUTO data attributes/default CSS variables, renders a 1120×630 desktop hero and has no horizontal overflow. Public default behavior is browser-verified; authenticated editor controls and save round-trip remain unverified because the CMS session is signed out.

Gallery preset module (2026-11-12): Project presentation now supports validated Behance Story, Dribbble Shots, Pinterest Masonry and Editorial Bento presets, a project-wide image shape default, 2–4 masonry columns, gallery-block overrides and individual image shape overrides. The CMS includes a live schematic preview and friendly controls while existing AUTO projects remain unchanged. Build, Prisma validation, JS syntax, diff check and focused case-study/frontend suites (43/43) pass; Preview deployment/browser QA is pending.
Image module presentation controls (2026-11-12): Standalone and gallery images now accept validated width/container, max-width, fit, aspect, alignment, focal point, frame, caption and mobile overrides from the existing Project CMS. `AUTO` preserves all accepted Behance/default layouts, while explicit `FULL` restores intentional viewport bleed. Focused commercial/frontend/Behance/V2 suites pass 45/45, TypeScript build passes and `git diff --check` is clean. Status is `TESTED`; Preview deployment/browser regression and authenticated persistence remain pending before authorized main promotion.
Preview image presentation acceptance (2026-11-12): Preview commit `8ee1bb0` reached the stable branch alias. The color-changing lip/cheek Behance board retained `AUTO`/`AUTO` presentation, rendered centered at 780px inside a 1265px page and produced no horizontal overflow. The CMS shell serves `admin-case-study.js?v=20261112-3` and `admin.js?v=20261112-image-presentation-1`. Public default rendering is `VISUALLY VERIFIED` on desktop; authenticated save/reload and mobile browser interaction remain `NOT VERIFIED` because the CMS session is signed out and browser viewport emulation is unavailable.
Main promotion gate (2026-11-12): The normal merge result is tree-identical to Preview while retaining the unique `main` release commit. Full Node regressions pass 256/256; TypeScript typecheck/build, three JavaScript syntax checks and `git diff --check` pass. `prisma validate` is environment-blocked locally because `DATABASE_URL` is absent, not because of a schema diagnostic. Main push and deployment verification remain pending.
Main promotion completed (2026-11-12): Merge commit `97419dc` is pushed to `origin/main`. The Vercel main branch alias serves the new image-presentation assets; the accepted Behance board loads at 780px centered with `scrollWidth === clientWidth === 1265`, and the CMS shell serves the new editor assets. The previously documented `mahmudportfolio-azure.vercel.app` still served an older versionless build during verification, so custom-domain/project alias alignment is a separate follow-up. Local workflow is returned to Preview-first.
Project drag ordering (2026-11-12): The existing CMS Projects list now exposes a drag handle plus accessible up/down controls for ADMIN/EDITOR accounts. Reordering posts the complete ID list to a dedicated validated endpoint and updates `sortOrder` atomically without editing project content or creating a migration. Search mode disables reordering to prevent partial-list ambiguity. Focused frontend/commercial tests pass 32/32; TypeScript typecheck/build, JS syntax and diff check pass. Direct `main` push is owner-authorized; authenticated visual/persistence verification remains pending after deployment.

Gallery editor UI polish (2026-11-13): The existing project-wide gallery preset module now shows a labelled schematic that updates preset, image-shape and masonry-column state without embedding project content. Legacy gallery images now use responsive two-column control cards instead of fixed 120px stacks, with a contained preview, grouped controls and mobile fallback. Existing saved values and public rendering contracts are unchanged. Focused tests pass 32/32; TypeScript typecheck/build, JS syntax and diff check pass. Direct `main` deployment is owner-authorized; authenticated production interaction remains pending.

Library-first collection workspaces (2026-11-13): Projects and Journal/Content now open on their existing-item libraries. Dedicated New Project and New Journal/Blog actions reveal the relevant editor; Edit and dashboard quick actions enter the same editor state, while Back/Clear returns to the library. Viewer roles cannot expose create actions. Focused tests pass 33/33, TypeScript typecheck/build and JS syntax pass, and local browser QA verifies both transitions without horizontal overflow. Direct `main` deployment is owner-authorized.

Modular Builder layout regression (2026-11-13): Modular project blocks now carry a dedicated editor class and isolated responsive stylesheet, preventing generic collection-row columns from collapsing block titles, JSON fields and actions. Both legacy and active render paths are covered. Focused tests pass 34/34; TypeScript typecheck/build, JS syntax and diff check pass. Browser geometry QA confirms an 849px desktop editor, a 343px mobile editor and no horizontal overflow. Direct `main` deployment is owner-authorized.

Shared typography system (2026-11-13): All 13 pages that use the primary stylesheet now load one versioned typography contract. It defines caption, label, helper, body, control and button roles; raises admin/login readability; and enforces 16px mobile form controls without changing fluid display headings. Focused tests pass 35/35; typecheck/build, JS syntax and diff check pass. Local browser QA confirms admin login 10/13/15/11px label-helper-input-button sizing, public 15px controls, mobile 16px controls and no horizontal overflow.

Preview cinematic homepage direction (2026-11-13): The Preview branch now tests a floating glass capsule header and a full-bleed, CMS-compatible hero composition using the existing portrait asset. Live HTML copy, typewriter text and CTA controls remain editable; desktop navigation collapses to the existing accessible mobile menu. Full Node regressions pass 261/261 with typecheck/build, JS syntax and diff check. Browser QA passes at 1280px, 1024px and 480px without overlap or horizontal overflow. Main remains untouched.

Preview homepage theme system (2026-11-14): Homepage services now use an accessible themed accordion backed by the existing `capabilitiesConfig`, with a friendly add/remove/reorder/default-open CMS manager. Hero configuration exposes mutually exclusive Cinematic and Profile Showcase themes, image upload, copy, CTA, proof, tags and ticker fields. Existing Skills records receive the compact themed card layout, and `statementConfig.process` powers an editable, reorderable My Process section. Full regressions pass 263/263; typecheck/build, JavaScript syntax and diff check pass. Deployed desktop/mobile QA confirms no horizontal overflow, one-open accordion behavior, five process steps and both admin manager assets. Main remains unchanged.

Profile Showcase v2 (2026-11-14): `VERIFIED` on deployed desktop Preview. The second hero theme maps the reference composition into individually managed top badge, upper-right spotlight, left socials, right quote, left proof, right tags and bottom ribbon zones. Admin exposes content, accent and seven visibility controls, a detailed layout schematic and direct Cinematic/Profile preview links. Query-based preview forcing does not change saved theme state. Focused tests pass 31/31 with syntax, typecheck/build and diff checks. Live Profile assets, all composition zones, zero desktop overflow and Admin control presence are browser-verified; explicit mobile viewport emulation remained unavailable in the connected browser, while responsive CSS and regression coverage pass.

Analytics detail and unified hero controls (2026-11-14): Analytics bars now expose animated, keyboard-accessible date/count detail plus total, average and peak summaries using only the existing dark/lime design tokens. Homepage Hero Manager hydrates missing structured fields from the live legacy hero values and saves structured/legacy image, lead and typewriter values together. Settings now points to this single manager while retaining collapsed fallback values. Focused regressions pass 40/40; typecheck/build, syntax and diff checks pass. Preview deployment and authenticated visual QA remain pending.

Process connector and icon refinement (2026-11-14): My Process now uses a responsive curvy dashed SVG connector with an animated lime trace and consistent search, pencil, code, rocket and chart outline icons. Existing saved legacy symbols map to the new icons, while Admin supports named icon styles or a custom symbol. Mobile retains the compact vertical dashed timeline. Focused regressions pass 32/32; syntax, typecheck/build and diff checks pass. Preview deployment/visual acceptance remain pending.

Preview navigation and CMS control pass (2026-11-14): Shared public pages now receive the same fixed capsule navigation and a complete dark mobile drawer; mobile hero whitespace is reduced. Project and Journal lists expose drag/up/down ordering with validated atomic endpoints. Admin save/fallback previews are non-obstructive, Profile Hero previews and public rendering use a dark full-image treatment, Hero can select Media Library assets, empty Capabilities receive editable starter cards, and Process offers five SVG connector presets. TypeScript build, JavaScript syntax, static smoke and frontend regressions (32/32) pass. Preview deployment/browser acceptance is pending; Main remains untouched.

## Release integration hardening — 2026-11-22

- Status: `VERIFIED` locally for the bounded UI/release fixes; `P8-003` remains `IN_PROGRESS` until commit, normal merge to `main`, push, and remote verification complete.
- Reconciled and retained the four pending Admin preview fixes from 2026-11-15; the Homepage Site Modules preview now mounts even when its earlier load event was missed, with a matching cache-key/test update.
- Versioned the shared responsive runtime on all 12 public shells, added reduced-motion handling to the Admin hero typewriter preview and capsule drawer, restored mobile header clearance on Work, Creative Lab, Hire, and Studio, and corrected CMS login inputs to a computed 16px on mobile.
- Verification: 267/267 Node tests, TypeScript typecheck/build, Prisma schema validation with a loopback dummy URL, static smoke 5/5, performance budget, JavaScript syntax, and `git diff --check` passed.
- Visual evidence: local `http://127.0.0.1:8799/` at 1280x800 and 390x844; mobile drawer opens inside the viewport with no overflow; Work/Creative Lab/Hire/Studio H1s clear the fixed header; CMS login is overflow-free at desktop/mobile and its mobile input computes to 16px.
- Not verified: authenticated CMS mutation/persistence and DB-derived local content; the loopback preview intentionally has no PostgreSQL/session and its public API fallback warnings are expected.

### Main promotion result

- Preview commit `1315c11` and normal merge commit `ad2f880` were pushed successfully; `origin/main` exactly matched `ad2f880` after push and no force operation was used.
- The merged tree is content-identical to Preview and passed 267/267 Node tests, TypeScript typecheck/build, JavaScript syntax, and diff validation again on `main`.
- `P8-003` remains `IN_PROGRESS`, not `VERIFIED`: the stable Preview alias still served `responsive.js?v=20261114-nav-2` and the documented custom domain served older `20261027-studio-v3` after the Git push. This is deployment/alias propagation evidence, not a Git failure.
- Follow-up propagation check: the stable Preview alias advanced to `responsive.js?v=20261122-nav-1` with no horizontal overflow. The documented custom domain mismatch remains unresolved, so full production acceptance is still not claimed.

## 2026-11-22 CMS feedback and project presentation checkpoint

- **COMPLETED / TESTED:** Project and Journal libraries now show `updatedAt`-based last-edited metadata, published records expose a public View link, and both editors show status, last-edited time and the same contextual link.
- **COMPLETED / TESTED:** Homepage Hero shortcut now targets the actual `.hero-theme-manager`, whose controls already cover image upload/library selection, crop/focal point, alt text, theme, copy and motion.
- **COMPLETED / TESTED:** Desktop CMS header no longer inherits the full-height panel rule and uses a compact heading treatment. My Process now includes a `DOTTED` connector preset with reduced-motion-safe public styling.
- **COMPLETED / TESTED:** Project pages retain modular blocks but also render top-level gallery images not represented by those blocks. This reconnects saved gallery fit/frame metadata to the public case study without duplicating block images.
- Verification: JavaScript syntax checks passed; focused regressions passed 43/43; full Node suite passed 268/268; `npm.cmd run typecheck`, `npm.cmd run build`, and `git diff --check` passed.
- Visual evidence: loopback preview `http://127.0.0.1:8799/#process` was checked at 1440x900 and the process region at 390x844; layouts remained contained and the mobile vertical connector stayed legible. Admin sign-in and hidden CMS source confirmed the manager/option assets, but authenticated CMS save/reload, timestamps, links, compact workspace header and DB-backed project rendering are **NOT VISUALLY VERIFIED**.
- `updated portfolio` remains intentionally out of scope and untouched. No commit or push was made for this checkpoint.

### Authenticated production audit (2026-11-22)

- **LIVE ISSUE CONFIRMED:** At the effective 1263x546 desktop viewport, `.admin-top` still computes `min-height: 100%`, is 404px tall, and renders its H1 at about 53px. The local compact-header fix is not deployed.
- **LIVE ISSUE CONFIRMED:** Project and Journal libraries/editors do not show last-edited metadata or public View links. The local feedback/link implementation is not deployed.
- **LIVE ISSUE CONFIRMED:** The Hero card still says `OPEN HERO COPY` and targets an absent legacy surface; clicking it does not reach the visible `.hero-theme-manager`. The deployed Process selector contains five older presets and no `DOTTED` option.
- **ROOT CAUSE RUNTIME-EVIDENCED:** The TMNT record retains gallery presentation data (cover `ROUNDED`; full board `ORIGINAL / NO CROP`), proving the backend save is present. Its public case study renders only the hero plus the modular full-board block, so top-level gallery presentation is bypassed while blocks exist. This matches the local renderer fix.
- Production was inspected read-only; no record was saved, reordered, published or deleted. Reverification requires committing/pushing/deploying the local batch first.
- **FOLLOW-UP RESOLVED LOCALLY:** TMNT's duplicated full-board media now has an explicit contract: the modular block owns placement; AUTO inherits matching gallery presentation, while an explicit block setting overrides it. The gallery editor labels the owning block and links to it.

### CMS feedback completion checkpoint (2026-11-22)

- **COMPLETED / TESTED:** Desktop `WAVE_DASHED` renders visible dash sequences (`7 12` base, `9 13` animated trace); `DOTTED` is also represented in the Admin preview.
- **COMPLETED / TESTED:** Hero Manager provides a Hero Media panel with selected-image preview, clickable Media Library navigation, existing-media selection with alt-text transfer, direct upload, URL/alt/focal controls and a single atomic Site Config save.
- **COMPLETED / TESTED:** Full `statementConfig` siblings are preserved; Process steps are reindexed; the server derives legacy hero fields inside the same Site Settings update/revision.
- Verification: focused 45/45, full Node 270/270, JavaScript syntax, TypeScript typecheck/build and `git diff --check` pass.
- Visual evidence: desktop Process at 1440x900 shows a dashed curving line, five equal steps and no overflow. Mobile 390x844 geometry is single-column and `scrollWidth === clientWidth`; exact Process viewport screenshot was not recaptured due dynamic hash timing.
- **NOT VERIFIED:** Authenticated Hero controls, compact Admin header and save/reload require a deployed database-backed CMS. No commit, push or deployment was made; `updated portfolio` remains untouched.

### Main deployment acceptance (2026-11-22)

- **VERIFIED:** Commit `bdeb9de` was pushed normally to `origin/main`; both the Vercel main alias and `mahmudportfolio-azure.vercel.app` now serve `20261122-hero-media-2` assets.
- **VISUALLY VERIFIED:** Authenticated production Admin desktop header is approximately 102px tall with `min-height: 0` and a 30.72px H1. The previous 404px blank header is gone.
- **VISUALLY VERIFIED:** Hero Media panel displays the selected image, upload control, Media Library chooser/open actions, URL, alt and focal controls without horizontal overflow.
- **VERIFIED READ-ONLY:** Project and Journal libraries expose Last Edited metadata and public View links; Process includes Dotted; no save/publish/delete mutation was performed during acceptance.
- **VERIFIED:** Published TMNT renders `full-board.jpg` once with inherited `ORIGINAL` fit and its cover once with `ROUNDED` frame; `scrollWidth === clientWidth` and the deployed Project runtime uses the new key.
- Production/main/custom-domain acceptance is complete for this batch. Mobile remains locally responsive-tested rather than authenticated production screenshot-verified.

### Admin narrow-column responsive repair (2026-11-26)

- **COMPLETED / TESTED:** Hero Media now sizes from its available Admin content width with an auto-fitting grid instead of relying only on the browser viewport breakpoint. URL, Alt Text and Focal Point inputs retain usable width and cannot force horizontal overflow.
- **COMPLETED / TESTED:** Site Modules now reacts to its actual content width, stacking the shared preview below the editor before the Workflow form becomes cramped. Process settings are top-aligned, Intro is full-width, controls use zero-safe tracks, and narrow Process cards collapse cleanly.
- Cache key advanced to `20261126-admin-layout-4`; frontend regressions pass 37/37 and the production TypeScript build passes.
- **VISUALLY VERIFIED:** authenticated production on `20261126-admin-layout-4` shows a 984px Workflow editor at the reported 1795px desktop viewport, stacked Preview, balanced settings, full-width Intro and zero page overflow. Hero Media is 947px wide with usable URL/Alt/Focal fields and zero panel overflow. Mobile 390x844 geometry is single-column with zero overflow.

### Homepage fallback proof layering repair (2026-11-26)

- **VERIFIED LOCALLY:** Runtime-generated Homepage Studio groups now establish `position: relative; z-index: 1`, so the legacy “How I Work” fallback no longer sits behind the fixed neural background while still occupying layout space.
- Cache key advanced to `20261126-layering-1`; regression tests pass 37/37, the TypeScript build passes, and desktop 1795x900 plus mobile 390x844 browser checks show the heading and three cards with zero horizontal overflow.
- Production remains unchanged until the user separately authorizes commit/push for this batch.

### Motion & CTA live previews (2026-11-26)

- **VERIFIED LOCALLY:** All five Motion & CTA cards now continuously demonstrate their configured motion in the preview stage and replay through hover/click interaction. Built-in SVG fallbacks animate without requiring a Lottie URL.
- **VERIFIED LOCALLY:** Trigger, tone, fallback, size, speed, loop and enable/global control changes refresh the affected preview without saving or reloading. Reduced-motion and data-saving preferences still receive static fallbacks.
- Cache keys advanced to `20261126-motion-preview-1` / `20261126-live-preview-1`; JavaScript syntax, frontend regressions 37/37, TypeScript build and diff validation pass.
- Browser integration mounted the real Admin component with five cards, five icons and five active animations; hover, click and live size/fallback refresh passed. Production remains unchanged pending explicit commit/push authorization.

### CMS workspace consistency repair (2026-11-27)

- **COMPLETED / TESTED:** Context navigation now reserves the third desktop column only when at least two useful section targets exist. Empty Analytics/SEO/other rails are removed from layout instead of leaving a blank right-side strip.
- **COMPLETED / TESTED:** Projects and Journal/Content refresh their own API collection whenever their destination opens. A temporary failure in another boot collection can no longer leave either library permanently blank; failures surface in the relevant list/toast.
- **COMPLETED / TESTED:** Motion & CTA's lower save action is now an in-flow action panel, not a sticky overlay over unfinished settings.
- **COMPLETED / TESTED:** Site Maintenance status cards use adaptive minimum-width tracks and protected status typography, preventing words such as `CONFIGURED` from splitting mid-word.
- **COMPLETED / TESTED:** Global Appearance is relocated from Account to `Settings / Site -> Site`; Account retains private-entry/team/security ownership and expands to the released width.
- Verification: `node --check` passed for `admin.js`, `admin-context-index.js`, and `admin-account-upgrade.js`; focused frontend regressions passed **38/38**; `npm.cmd run build` and `git diff --check` passed.
- **NOT VISUALLY VERIFIED:** Loopback server `http://127.0.0.1:8799/` is healthy under PID `4712`, but the in-app browser entered a failed-navigation data page before server restart and its URL policy blocked re-navigation. No screenshot or authenticated CMS persistence claim is made for this batch.
- No commit, push, deployment, schema change or CMS mutation was performed. `updated portfolio` remains untouched.

### Homepage Outcomes mode hardening + Creative Lab modular expansion (2026-11-27)

- **VERIFIED / TESTED:** `PROOF_STRIP` now normalizes its display mode, explicitly clears inherited `hidden`, identifies the rendered mode, and always renders fallback proof cards for `OUTCOMES`. The public runtime/cache keys and regression contract were updated.
- Verification: `node --check portfolio/homepage-studio-runtime.js` and focused frontend regressions **39/39** pass.
- **IN PROGRESS:** Creative Lab expansion is being reconciled against the shared planning discussion, the supplied demo bundle and the existing twelve-tool implementation. Current blockers identified: eager loading of every engine, hardcoded twelve-tool snapshot/Page Studio contracts, and an incomplete custom-tool workflow (nullable model ID but no create endpoint and v1 publish schema rejection).
- **NOT VISUALLY VERIFIED:** Current Outcomes fix still requires desktop/mobile browser evidence. No commit, push, deployment or database mutation has occurred; `updated portfolio` remains untouched.

### Creative Lab modular foundation release gate (2026-11-27)

- **VERIFIED / TESTED:** Creative Tool demo engines now load through a deployment-owned allowlist only after the selected tool is known. A module failure is contained inside that tool workspace and does not break details, navigation or other apps.
- **COMPLETED / TESTED:** Admin can create a custom app as a private, hidden, noindex draft. CMS fields cannot supply executable JavaScript; implementation remains code-owned. Published snapshots carry an optional stable `toolId` while retaining all legacy F/M canonical IDs.
- **COMPLETED / TESTED:** Page Studio accepts up to 100 stable published-tool references and resolves either canonical IDs or custom tool IDs. The editor no longer truncates the catalog back to the original twelve.
- **COMPLETED / TESTED:** Creative Tools participate in portable backup/restore and Media Library usage protection. Asset replacement propagation remains a separate follow-up.
- **VISUALLY VERIFIED (desktop):** Homepage `OUTCOMES` mode at `http://127.0.0.1:8799/` rendered three visible proof cards at 1280x720, with `hidden=false`, `display:block` and zero horizontal overflow. Mobile visual evidence is still pending.
- Verification: Creative/engine suite **105/105**, Page Studio suite **52/52**, frontend regressions **39/39**, operations **9/9**, JavaScript syntax, TypeScript typecheck and production build passed. No migration, dependency, production data mutation or `updated portfolio` edit was introduced.

### Creative Tool published-snapshot isolation (2026-11-27)

- **VERIFIED / TESTED:** Published Creative Tool snapshots now freeze visibility, schedule, featured state and ordering alongside SEO. Public catalog/detail HTML and APIs, recruiter/presentation evidence, Page Studio, sitemap and `llms.txt` all evaluate the published snapshot rather than mutable draft fields.
- **VERIFIED / COMPATIBLE:** Existing v1 snapshots without the new optional fields continue through row-field fallbacks; invalid, private, hidden, future-scheduled and archived snapshots fail closed.
- Verification: complete Node test matrix passed with the dot reporter; focused discovery/detail/recruiter contracts **19/19**, TypeScript typecheck, elevated production build and `git diff --check` passed. No database migration or production mutation was required.

### Creative Tool media/redirect completion and CMS ownership regression (2026-11-27)

- **VERIFIED / TESTED:** Media replacement now rewrites Creative Tool draft and published media references (`coverImage`, `galleryImages`, `pageBlocks`, `ogImage`, `publishedSnapshot`) within the existing transaction without changing tool identity.
- **VERIFIED / TESTED:** Explicit Creative Tool slug publication now preserves both old detail and old `/demo` routes, and flattens historical aliases for each route to one canonical hop.
- **VERIFIED / TESTED:** Global Appearance relocation is idempotent and identifies the theme panel through `#themePreset`; repeated initialization can no longer move Private Entry into Site Settings.
- Verification: full Node matrix **273/273**, frontend **39/39**, TypeScript typecheck/build, static smoke **5/5**, performance budget, JavaScript syntax and `git diff --check` passed. Production desktop was inspected read-only; mobile authenticated browser evidence and live database mutation remain **NOT VERIFIED**.
- **DEPLOYED / VISUALLY VERIFIED (desktop):** commit `5279bf6` propagated to the custom domain. Authenticated Admin at 1280x720 shows Global Appearance inside Site Settings and Private Entry still inside Account, with `scrollWidth === clientWidth === 1280`. The in-app browser could not resize, so authenticated mobile remains **NOT VISUALLY VERIFIED**.

### Homepage Manager card containment repair (2026-11-27)

- **COMPLETED / TESTED:** Wide Admin Homepage section cards now use a 180px identity track and a zero-safe flexible label track, keeping visibility and reorder controls inside the card border at the measured 758px content width.
- Verification: frontend regressions **39/39**, TypeScript typecheck/build and `git diff --check` passed. The deployed site still serves the previous CSS until commit/push authorization; post-deploy desktop visual verification is pending.
- **DEPLOYED / SOURCE VERIFIED:** commit `c1d93d3` is on `origin/main` and the custom domain serves the new fit-safe grid rule. The available browser session returned to sign-in, so authenticated post-deploy visual verification remains pending rather than claimed.
