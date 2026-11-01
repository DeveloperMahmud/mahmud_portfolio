# V2 Implementation Checklist

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
| P4-003 | Commercial case studies | Upgrade 4–6 selected projects into complete evidence-led case studies. | P1-005 | BLOCKED | Each has role, challenge, tools, process, deliverables and honest outcome. | Public DTO privacy, schedule gates, publish-readiness validation and matching CMS readiness panel pass 4/4. Completion requires 4–6 real project records with user-supplied facts/media; fabricated claims are prohibited. |
| P4-004 | Service landing pages | Add Amazon/e-commerce, brand systems and digital experience service pages. | P4-002 | COMPLETED | Pages have clear offer, proof, process and CTA. | Three strict routes reuse canonical Studio CMS services/process/CTAs and eligible published projects; API/publication/alias/responsive/static checks pass 5/5 and build passes. DB-backed CMS roundtrip and browser visuals remain required for VERIFIED. |
| P4-005 | Three-minute recruiter presentation | Add focused presentation route/view assembled from CMS content. | P4-001, P4-003 | IN_PROGRESS | View is concise, keyboard usable and shareable without exposing drafts. | Shared recruiter/client engine, strict public-only project resolution, 8-step CMS settings, publish/noindex gates, keyboard controls, optional pauseable guided playback, reduced-motion support and privacy-safe analytics pass 5/5 plus TypeScript build. Route defaults OFF and completion remains blocked by P4-003 real evidence plus DB/browser verification. |
| P4-006 | Page Studio technical case study | Publish an honest technical/creative case study of the modular CMS work. | P4-003 | IN_PROGRESS | Architecture, workflow, QA and personal contribution are documented. | Dedicated draft-only template, ten required evidence-section markers, unresolved-scaffold publish blocking and an authorized-media reminder are implemented. Focused checks pass 5/5 and TypeScript build passes. No page was created or published; truthful content and DB/browser verification remain blocked by P4-003 evidence. |
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
| P5-001 | Dimension & Safe-Zone Checker | Implement bounded production-capable engine. | P3-007 | IN_PROGRESS | Inputs, outputs, errors, privacy and mobile behavior verified. | Existing canonical M01 demo route now has a real browser-local PNG/JPEG/WebP inspector, 12 MB/12,000 px limits, real dimensions/ratio, generic/custom presets, configurable safe-zone overlay and local checklist export. No network/storage path is used. Focused tests are authored but intentionally deferred to the Phase 5 batch checkpoint; browser/mobile verification and P3-007 remain pending. |
| P5-002 | Product Background Inspector | Implement bounded production-capable engine. | P3-007 | IN_PROGRESS | Documented criteria and honest limitations verified. | Existing canonical M02 route now performs bounded browser-local image downsampling and explainable near-white border, edge-contact and transparency sampling with an editable threshold. It never removes backgrounds or claims compliance. Focused tests are authored but deferred to the Phase 5 batch checkpoint; browser/human-review validation and P3-007 remain pending. |
| P5-003 | Visual Brief to PDF | Implement export workflow with safe limits. | P3-007 | NOT_STARTED | Output is valid, accessible and protected from unsafe content. | Not run. |
| P5-004 | Brand Asset Kit Generator | Implement lightweight asset-system output. | P3-007 | NOT_STARTED | Export and preview are consistent with global design tokens. | Not run. |
| P5-005 | Portfolio Presentation Builder | Implement selected-project presentation workflow. | P4-003 | NOT_STARTED | Published-only records and responsive presentation verified. | Not run. |
| P5-006 | Design Handoff Checklist | Implement reusable checklist workflow. | P3-007 | IN_PROGRESS | State, export and accessibility verified. | Existing canonical M06 route now supports local project labels, up to 24 checks, custom items, remove/reset, live progress, copyable summary and dedicated print output without persistence or network transfer. Focused tests are authored but intentionally deferred to the Phase 5 batch checkpoint; browser/accessibility verification and P3-007 remain pending. |

## Phase 6 — Six flagship tool engines

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P6-001 | Thumbnail Readability engine | Implement evidence-based scoring/export workflow. | P2-005, P3-007 | NOT_STARTED | Results are explainable, bounded and tested. | Not run. |
| P6-002 | Contrast Analyzer engine | Implement real image/text analysis workflow. | P2-006, P3-007 | NOT_STARTED | Contrast/readability behavior and limits are verified. | Not run. |
| P6-003 | A+ Creative Planner engine | Implement structured planning workflow. | P2-007, P3-007 | NOT_STARTED | Input/output persistence and export are verified. | Not run. |
| P6-004 | Creative Brief Builder engine | Implement client-ready brief workflow. | P2-008, P3-007 | NOT_STARTED | Draft, validation and export are verified. | Not run. |
| P6-005 | Listing Visual Audit engine | Implement criteria-driven audit and report. | P2-009, P3-007 | NOT_STARTED | Audit is explainable and does not overclaim automated certainty. | Not run. |
| P6-006 | Review & Approval engine | Implement secure review, comments, versions and approval. | P2-010, P3-007 | NOT_STARTED | Tokens, permissions, expiry, audit trail and privacy verified. | Not run. |

## Phase 7 — SEO, analytics, accessibility, security, performance and QA

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P7-001 | SEO/GEO integration | Extend sitemap, metadata, schema, llms.txt controls and entity data to new routes. | P2, P4 | NOT_STARTED | Published routes are discoverable; drafts/demos follow intended indexing rules. | Not run. |
| P7-002 | Creative Lab analytics | Add privacy-respecting catalog/detail/demo/CTA events and exports. | P2, P4 | NOT_STARTED | Event taxonomy and reporting are documented and tested. | Not run. |
| P7-003 | Accessibility audit | Verify keyboard, focus, labels, contrast, reduced motion and screen-reader semantics. | P2–P6 | NOT_STARTED | No known critical WCAG 2.2 AA regression remains. | Not run. |
| P7-004 | Responsive/visual regression QA | Cover desktop/tablet/mobile and critical builder/public components. | P2–P6 | NOT_STARTED | QA artifacts identify and prevent major layout regressions. | Not run. |
| P7-005 | Security review | Review RBAC, validation, uploads, embeds, tokens, headers and rate limits. | P2–P6 | NOT_STARTED | High-risk findings are fixed or explicitly blocked. | Not run. |
| P7-006 | Performance budget | Optimize assets, lazy loading, caching and animation; retain fast perceived speed. | P2–P6 | NOT_STARTED | Agreed budgets are measured and no severe regression exists. | Not run. |
| P7-007 | WordPress/export portability | Keep clean structured exports and document migration mapping. | P3, P4 | NOT_STARTED | Content can be exported without proprietary UI state leakage. | Not run. |

## Phase 8 — Release readiness

| Task ID | Task | Description | Dependencies | Status | Acceptance criteria | Verification |
|---|---|---|---|---|---|---|
| P8-001 | Full regression and data safety | Run builds, tests, migration checks, route checks and backup/restore validation. | P1–P7 | NOT_STARTED | Required suites pass against a production-like copy; no data loss. | Not run. |
| P8-002 | Documentation and operations | Finalize admin guides, environment guide, rollback and ownership notes. | P8-001 | NOT_STARTED | A new maintainer can operate and recover the system. | Not run. |
| P8-003 | Authorized release | Prepare release notes and deploy only with explicit user authorization. | P8-001, P8-002 | NOT_STARTED | User approves; release is monitored and rollback-ready. | Not run. |
