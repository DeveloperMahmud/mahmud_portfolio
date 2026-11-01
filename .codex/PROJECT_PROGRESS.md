# Project Progress

Last reconciled: 2026-10-30 (Asia/Dhaka)  
Canonical repository: `D:/Web Works/search-hub/.portfolio-codex-work`  
Branch / baseline: `main` at `3f3fa90` before V2 setup changes  
Master specification: `docs/MAHMUD_CODEX_MASTER_IMPLEMENTATION_INSTRUCTIONS_V2.md`  
Specification SHA-256: `C14540F0234C91EB7D4210AD4862CD88526FBBC3100DF8EAA76615B3BCF70407`

## Preview branch checkpoint — 2026-11-01

- Canonical repository, Git metadata, source, `AGENTS.md`, local Master Plan and all recovery records are colocated at `D:/Web Works/search-hub/.portfolio-codex-work`.
- Preview target: a dedicated Git branch and Vercel Preview environment using the owner's separate Preview database. Production deployment is not authorized by this checkpoint.
- Consolidated pre-push validation passed: TypeScript build plus V2 routes, Recruiter Mode, Studio Mode, service pages, mini-tool demos, image safe-zone, background inspector and design handoff suites (33/33 focused checks).
- Database migration was not run locally. The additive Creative Lab migration remains pending against the dedicated Vercel Preview database during preview deployment.
- Current implementation statuses remain unchanged: unfinished tasks stay `IN_PROGRESS`/`BLOCKED`; this checkpoint only packages the current recoverable implementation for visual review.

## Current state

### Latest checkpoint — 2026-11-01 (P5-002)

- Current active phase: **Phase 5 — Six mini-tool engines**. Phase 4 evidence-dependent items remain blocked/in progress, not skipped or completed.
- Current task: **P5-002 Product Background Inspector — IN_PROGRESS**.
- Implemented this Phase 5 pass: P5-001 image dimension/safe-zone engine, P5-006 project handoff workflow, and P5-002 browser-local near-white/edge/transparency sampler.
- Validation: focused tests for all three engines are authored but intentionally deferred to the Phase 5 batch checkpoint under the user’s credit-saving workflow.
- Not verified: JavaScript/browser execution, desktop/mobile visuals, focused/regression suites and P3-007 DB-backed acceptance.
- Exact next action: implement P5-003 Visual Brief to PDF, then the remaining Phase 5 engines; run one consolidated Phase 5 validation checkpoint before claiming completion.
- This checkpoint supersedes older current-task wording below; the historical entries remain for recovery context.

> Recovery checkpoint (2026-11-01): the evidence-backed active phase is **Phase 4 — Portfolio, recruiter and client conversion experiences**. P4-004 and P4-007 are code-complete; P4-003 is `BLOCKED` on 4–6 real case-study facts/media. P4-005 now has a tested, default-OFF presentation foundation but remains `IN_PROGRESS` until that real evidence and DB/browser verification exist. P3-007 remains independently `BLOCKED` on a safe non-production database target. This checkpoint supersedes older active-phase wording below.

- Current active phase: **Phase 4 — Portfolio, recruiter and client conversion experiences** (P3-007 remains independently blocked on a safe non-production database target)
- Overall status: **IN_PROGRESS**
- Current task: **P4-005 Three-minute recruiter presentation — foundation implemented, evidence blocked**
- Next pending task: **Complete P4-003/P4-005 with real case-study evidence; P4-006 only after verified Page Studio evidence**

## Completed tasks

- P0-001 repository audit (code and architecture inspected; audit document created).
- P0-002 persistent progress system (four mandatory files created).
- P0-003 project-scoped custom agent configuration and routing instructions created.
- P0-005 public/private, data, migration and release boundaries documented.

## Verified tasks

- P0-001 repository audit.
- P0-002 persistent progress system and fresh-session resume reconciliation.
- P0-003 project-scoped agent routing: Codex CLI 0.164.0 recognized `medium_worker` at medium effort and `high_specialist` at high effort.
- P0-004 baseline validation: TypeScript build, 85 automated checks and static smoke passed.
- P0-005 public/private, data, migration and release boundary map.
- P1-001 collision-safe V2 route/navigation map.
- P1-002 canonical Creative Lab domain, publishing, RBAC, migration and seed contract.
- P1-003 reusable Creative Lab card/status/action/empty-state foundation.
- P1-005 case-study content contract.

## In-progress tasks

- P4-005 Three-minute recruiter presentation. The shared recruiter/client engine and CMS/public safety gates are implemented; route activation and final acceptance remain blocked by missing real P4-003 evidence and DB/browser verification.
- P4-006 Page Studio technical case study. Draft template and evidence gates are implemented; real content and DB/browser verification remain blocked.
- P5-001 Dimension & Safe-Zone Checker. Browser-local engine code is implemented; batch validation is deferred.
- P5-006 Design Handoff Checklist. Browser-local engine code is implemented; batch validation is deferred.
- P5-002 Product Background Inspector. Browser-local sampling engine code is implemented; batch validation is deferred.

## Completed but not verified

- P4-001 Recruiter Mode. Code, focused regressions and static responsive shell checks pass; authenticated DB-backed save/role/API output remains pending.
- P4-002 Client / Studio Mode. Code, focused regressions, build and static desktop/mobile checks pass; authenticated DB-backed save/role/API output remains pending.
- P4-004 Service landing pages. Three canonical CMS-backed routes, strict public API, public-only project evidence, responsive shell and canonical Amazon alias pass 5/5 plus build; DB/browser roundtrip remains pending.
- P4-007 Inquiry segmentation and conversion tracking. Bounded intent/source routing, Lead Center/export tags and aggregate analytics contexts pass 5/5 plus build; DB-backed submission/report roundtrip remains pending.
- P1-004 recruiter/client route and page skeletons. Static acceptance and build pass; HTTP runtime verification awaits a reachable configured database.
- P2-001 additive CreativeTool schema/migration. Static safety, Prisma validation/generation and build pass; migration has not been applied to a populated PostgreSQL database.
- P2-002 idempotent 12-tool seed. Contract tests pass; migration/seed double-run on real PostgreSQL remains pending.
- P2-003 filterable Creative Lab catalog. Static accessibility/responsive/API contract and build pass; DB-backed browser verification remains pending.
- P2-004 Creative Tool detail/API/demo route. Static contract and build pass; DB-backed browser verification remains pending.
- P2-005 Amazon Thumbnail Readability concept demo. Sample-only interaction, accessibility/responsive contract and build pass; DB-backed browser verification remains pending.
- P2-006 Text Readability & Contrast concept demo. Fixed-sample interaction, accessibility/responsive contract and build pass; DB-backed browser verification remains pending.
- P2-007 Amazon Listing & A+ Creative Planner concept demo. Fictional sample planning interaction, responsive contract and build pass; DB-backed browser verification remains pending.
- P2-008 Smart Creative Brief Builder concept demo. Local-only form/preview, responsive contract and build pass; DB-backed browser verification remains pending.
- P2-009 Amazon Listing Visual Audit concept demo. Explainable authored findings, responsive contract and build pass; DB-backed browser verification remains pending.
- P2-010 Creative Review & Approval concept demo. Local-only version/decision state, security boundary, responsive contract and build pass; DB-backed browser verification remains pending.
- P2-011 six mini-tool concept demos. Separate local-only renderer, six distinct interactions, responsive contract and build pass; DB-backed browser verification remains pending.
- P2-012 Homepage Creative Lab teaser. Existing HomepageSection persistence, bounded presentation config, canonical published-tool cards, hidden/empty collapse, responsive public UI and Homepage Studio mapping pass focused/static regressions; DB-backed browser verification remains pending.
- P2-013 Phase 2 aggregate gate. All 12 canonical IDs/slugs, detail/demo routes, honest status/action fallbacks, public boundaries, keyboard semantics, mobile breakpoints and every focused Phase 2 suite pass; DB-backed browser verification remains pending.
- P3-001 authenticated Creative Lab Tool Manager. ADMIN/EDITOR/VIEWER can inspect a bounded lightweight list with search, filters, ordering, status, pagination and responsive UI; no mutation endpoint or control exists yet. DB-backed authenticated browser verification remains pending.
- P3-002 Creative Lab Tool editor. ADMIN/EDITOR can edit strictly validated draft fields with optimistic locking, conflict-safe errors and activity logging; VIEWER remains read-only and no draft save changes the published snapshot. DB-backed authenticated browser verification remains pending.
- P3-003 explicit Creative Lab publishing and revision safety. ADMIN/EDITOR can publish/unpublish with optimistic locking, inspect versioned draft snapshots and restore only into the working draft; the live snapshot is unchanged until an explicit publish. DB-backed authenticated browser verification remains pending.
- P3-004 Creative Lab media and URL validation. Cover, gallery and social images reuse authenticated Media Library records without new uploads; explicit live-URL verification is HTTPS-only, DNS/IP pinned, bounded, audited and never coupled to draft saves. DB-backed authenticated browser verification remains pending.
- P3-005 Creative Lab slug redirect safety. Explicit publish atomically creates one-hop old-to-new redirects, flattens prior internal aliases, rejects claims/chains/conflicts and runs in a serializable transaction. DB-backed authenticated browser verification remains pending.
- P3-006 Page Studio Creative Tool blocks. Catalog/card/CTA widgets retain canonical IDs and bounded presentation only, resolve eligible published snapshots, keep UNLISTED tools out of catalogs, include responsive empty states and run in the existing Widget QA fixture. DB-backed authenticated editor/public verification remains pending.

## Blocked tasks

- P3-007 end-to-end CMS verification: this workspace has no `.env`/`TEST_DATABASE_URL`, local PostgreSQL client or Docker runtime. Automated mutation against the production database is intentionally prohibited.
- P4-003 commercial case-study completion: 4–6 real selected projects need verified role, challenge, process, deliverables, outcome and media supplied/confirmed by the user. This blocks P4-005 and P4-006 acceptance without inventing evidence.

## Repository findings

- Runtime: Node 20–24, Express 5, TypeScript, Prisma 6/PostgreSQL.
- Public UI: static vanilla HTML/CSS/JavaScript served from `portfolio/`.
- Admin: authenticated CMS with `ADMIN`, `EDITOR`, `WRITER`, `MODERATOR`, `VIEWER` roles.
- Existing systems: projects/case-study metadata, content, brands, media, testimonials, inquiries, analytics, SEO/GEO, revisions, backups, feature controls, Homepage Studio and Page Studio.
- Page Studio has a large reusable widget library, templates, blocks, navigation presets, trusted embed sources, publishing gates and a QA fixture page.
- Existing stable routes include `/`, `/work.html`, `/work/:slug`, `/blog.html`, `/journal/:slug`, `/pages/:slug`, preview/share routes and admin APIs.
- Missing V2 foundations: no canonical Creative Lab tool model, no `/creative-lab` catalog/details/demos, and no dedicated `/hire` or `/studio` public experience.
- Safe extension path: add one canonical tool domain to Prisma/API/CMS, reference it from Page Studio, preserve all existing content and public fallbacks.

## Test results

- 2026-11-01 Page Studio technical case-study checkpoint: focused checks 5/5 and TypeScript build passed. No DB writes or public publishing were performed.

- 2026-11-01 Presentation Mode checkpoint: focused checks 5/5, new browser scripts syntax checks and TypeScript build passed.
- 2026-11-01 Phase 4 consolidated checkpoint: commercial case study 4/4, service pages 5/5, inquiry segmentation 5/5, recruiter 5/5, studio 5/5 and TypeScript build passed.
- `npm.cmd run build` — passed.
- `npm.cmd run test:frontend` — 21/21 passed.
- `npm.cmd run test:page-studio` — 49/49 passed.
- `npm.cmd run test:operations` — 7/7 passed.
- `npm.cmd run test:slider` — 5/5 passed.
- `npm.cmd run test:publish-safety` — 3/3 passed.
- `npm.cmd run test:smoke:static` — all five static checks passed.
- Agent TOML parse — passed for config and both agents.
- Codex CLI strict read-only recognition — passed; named agents and efforts reported correctly.
- `npm.cmd run test:creative-lab` — 4/4 foundation tests passed.
- `npm.cmd run build` after Creative Lab foundation — passed.
- `npm.cmd run test:v2-routes` — 3/3 passed.
- `npm.cmd run test:creative-lab` after route work — 4/4 passed.
- `npm.cmd run build` after route work — passed.
- `npm.cmd run test:v2-case-study` — 4/4 passed.
- `npm.cmd run test:creative-tool-schema` — 3/3 passed.
- `npx.cmd prisma validate` with a temporary non-secret validation URL — passed.
- `npx.cmd prisma generate` — passed with Prisma 6.19.3.
- `npm.cmd run build` after CreativeTool schema generation — passed.
- `npm.cmd run test:creative-tool-seed` — 4/4 passed.
- `git diff --check` after schema/seed work — passed.
- `npm.cmd run test:creative-lab-catalog` — 3/3 passed.
- `npm.cmd run test:creative-lab` — 5/5 passed after published-action integration.
- `npm.cmd run build` after catalog/API work — passed.
- `npm.cmd run test:creative-tool-detail` — 3/3 passed.
- `npm.cmd run build` after detail/demo routing — passed.
- `npm.cmd run test:thumbnail-demo` — 3/3 passed.
- Creative Tool detail 3/3, catalog 3/3 and foundation 5/5 regressions passed after the F01 demo.
- `npm.cmd run build` and `git diff --check` after the F01 demo — passed (line-ending notices only).
- `npm.cmd run test:contrast-demo` — 3/3 passed; F01 3/3 and detail-route 3/3 regressions pass.
- `npm.cmd run build` after the F02 demo — passed.
- `npm.cmd run test:planner-demo` — 3/3 passed; F01/F02 regressions pass.
- `npm.cmd run build` after the F03 demo — passed.
- `npm.cmd run test:brief-demo` — 3/3 passed; F03 and detail-route regressions pass.
- `npm.cmd run build` after the F04 demo — passed.
- `npm.cmd run test:audit-demo` — 3/3 passed; F04 and foundation regressions pass.
- `npm.cmd run build` after the F05 demo — passed.
- `npm.cmd run test:review-demo` — 3/3 passed; F05 and detail-route regressions pass.
- `npm.cmd run build` after the F06 demo — passed.
- `npm.cmd run test:mini-tool-demos` — 4/4 passed; F06 and detail-route regressions pass.
- `npm.cmd run build` after the six mini demos — passed.
- Local HTTP `/hire` and `/studio` probe — not completed: server awaited `db.$connect()` and did not listen within 10 seconds in the restricted local environment.

- `npm.cmd run test:creative-tool-manager` — 3/3 passed.
- `npm.cmd run test:creative-lab-phase2` — 4/4 passed after manager integration.
- `npm.cmd run test:frontend` — 21/21 passed after manager integration.
- Creative Lab catalog 3/3, CreativeTool schema 3/3, JavaScript syntax and TypeScript build passed; `git diff --check` reported only expected Windows line-ending notices.
- `npm.cmd run test:creative-tool-editor` — 3/3 passed.
- `npm.cmd run test:creative-tool-manager` — 3/3 passed after guarded editor integration.
- Phase 2 gate 4/4, frontend 21/21, catalog 3/3 and schema 3/3 regressions passed after P3-002.
- Creative Tool editor JavaScript syntax, TypeScript build and `git diff --check` passed.
- `npm.cmd run test:creative-tool-publishing` — 4/4 passed.
- Creative Tool editor 3/3 and manager 3/3 passed after replacing obsolete pre-publish assertions with bounded route/schema assertions.
- Phase 2 gate 4/4, frontend 21/21, catalog 3/3, schema 3/3, Creative Lab foundation 5/5 and publish safety 3/3 regressions passed after P3-003.
- Creative Tool manager JavaScript syntax, TypeScript build and `git diff --check` passed after P3-003.
- `npm.cmd run test:creative-tool-media-url` â€” 3/3 passed.
- Creative Tool publishing 4/4, editor 3/3 and manager 3/3 remained green after P3-004.
- Phase 2 gate 4/4, frontend 21/21 and publish safety 3/3 passed after P3-004.
- Creative Tool manager JavaScript syntax, TypeScript build and `git diff --check` passed after P3-004.
- `npm.cmd run test:creative-tool-redirect` â€” 4/4 passed.
- Creative Tool publishing 4/4 and media/URL 3/3 remained green after P3-005.
- Phase 2 gate 4/4, frontend 21/21, publish safety 3/3, TypeScript build and `git diff --check` passed after P3-005.
- `npm.cmd run test:page-studio-creative-tools` — 3/3 passed.
- Page Studio 49/49, Phase 2 gate 4/4, frontend 21/21, TypeScript build and `git diff --check` passed after P3-006.

### Latest P4-001 checkpoint results (2026-10-30)

- `npm.cmd run test:recruiter-mode` — 3/3 passed for bounded configuration, published-evidence filtering and safe CV/contact rendering.
- `npm.cmd run test:frontend` — 21/21 passed after the partial Recruiter Mode implementation.
- `npm.cmd run test:v2-routes` — 2/3 passed; the remaining legacy assertion expects `/api/public/cv` statically in `hire.html`, while the partial implementation intentionally inserts it only when a real CV is configured.
- `npm.cmd run build` — failed at `src/routes/public.ts(40,165)` with `TS18047: 'item' is possibly 'null'`. The current worktree is not build-clean.

### Local visual preview checkpoint (2026-10-30)

- A dependency-free, loopback-only static preview is running from `portfolio/` at `http://127.0.0.1:8799/` (PID 28352). It does not expose the server publicly and does not use database credentials.
- Browser evidence was collected at 1440x900 and 390x844 for the homepage and Recruiter Mode shell. Both loaded without horizontal overflow or broken images at the checked viewport.
- The 18 static HTML surfaces were opened at 1280x800 and 390x844. All loaded and none reported horizontal document overflow; route-specific API/authenticated behavior is not implied by this layout check.
- `/hire.html` visually renders the English quick-scan hero and safe work/contact CTAs. API-derived skills, projects, evidence pillars, experience, real-CV action, CMS editing, SEO injection, and indexable `/hire` routing remain `NOT VERIFIED` because the full Express/PostgreSQL application is unavailable.
- Static preview limitations: public project/tool/catalog requests, authentication, CMS/Page Studio persistence, share/preview tokens, redirects, SEO endpoints, and database-derived content cannot be verified. Extensionless production routes such as `/hire`, `/studio`, and `/creative-lab` require the full Express app; static review URLs use their `.html` files.
- Permanent phase/UI visual-review rules were added to `AGENTS.md`; implementation, automated testing, visual verification, and unverified functionality must now be reported separately.

### Sticky public navigation checkpoint (2026-10-30)

- Added `nav-always-visible` as the homepage's safe HTML fallback so a failed/unavailable public-settings request no longer restores the old scroll-down hide behavior.
- CMS control remains authoritative when the API is available: `applyPublicExperience()` can still remove the class when `stickyNavigation` is explicitly disabled.
- `npm.cmd run test:frontend` passed 21/21.
- Browser evidence at 1440x900 and 390x844 confirmed that after downward scrolling the header remained `position: fixed`, with top `0`, no `hidden` class and no transform. Database-derived content remains outside this verification.

### Recruiter route/build checkpoint (2026-10-30)

- Guarded the nullable Creative Tool projection in `/api/public/recruiter`; `npm.cmd run build` now passes.
- Corrected the stale CV route contract: the static shell must not expose a dead CV link, and runtime JavaScript must add `/api/public/cv` only when `cvAvailable` is true.
- `npm.cmd run test:v2-routes` and `npm.cmd run test:recruiter-mode` both pass 3/3.
- P4-001 remains `IN_PROGRESS`; the friendly recruiter CMS editor and DB-backed runtime/browser verification are still unfinished.

### Recruiter CMS checkpoint (2026-10-30)

- Added a friendly Recruiter Mode editor inside Homepage → Structured Content for role/headline/introduction, availability, featured project slugs, skills, CTAs, verified experience and evidence pillars.
- Added a dedicated validated merge endpoint so recruiter saves preserve CV and unrelated About settings. Existing raw About JSON remains the advanced portable source and is synchronized after a successful save.
- Added server-side ADMIN/EDITOR authorization through the existing RBAC matrix; viewer/writer/moderator requests remain denied.
- `node --check portfolio/admin-recruiter-mode.js`, recruiter tests 5/5, V2 routes 3/3, frontend regressions 21/21 and `npm.cmd run build` passed.
- Static browser inspection confirmed the new CSS/JS assets load and the workspace mounts in the admin document. The authenticated editor itself is `NOT VISUALLY VERIFIED` because the loopback static preview has no database-backed session.
- `npm.cmd run test:publish-safety` passed 3/3. Environment inspection confirmed there is no `.env`, `TEST_DATABASE_URL`, `DATABASE_URL`, Docker or local `psql`; DB-backed verification cannot run safely in this workspace yet.

## Known issues and risks

- P4-001 is partially implemented and must not be promoted. The nullable Creative Tool filter was fixed on 2026-10-30 and the TypeScript build now passes; the conditional-CV regression, friendly CMS controls and DB-backed verification remain unfinished.
- The conditional CV regression is reconciled: static HTML has no dead CV link, while runtime JavaScript exposes the download only when `cvAvailable` is true.
- Recruiter content now has a dedicated friendly editor and server-validated merge workflow; authenticated persistence, role-denial and round-trip behavior remain unverified without a safe database target.
- `/api/public/recruiter` and `/hire` have not received DB-backed runtime/browser, responsive, SEO or accessibility verification.
- The static `/hire.html` presentation shell has desktop/mobile browser evidence, but this does not satisfy the DB-backed `/api/public/recruiter` or production `/hire` verification requirement.

- P2-012 focused verification: homepage teaser 4/4, catalog 3/3, Page Studio 49/49, operations 7/7, frontend 21/21 and TypeScript build all pass; DB-backed browser rendering remains pending.

- Production data exists; schema work must be additive and seeds idempotent.
- Public Page Studio is feature-gated. New blocks must not leak draft content.
- New external/live URLs require server-side protocol/origin validation.
- Existing roles are broad in some route modules; Creative Lab mutation endpoints need an explicit role matrix.
- Concept tools must be labeled demo/preview until real engines exist.
- New route roots are documented but not yet reserved in Page Studio code; P1-004/P2 routing implementation must add those guards before public activation.
- V2 route roots are now reserved in code. P1-004 runtime render remains unverified until a database-backed server is reachable.
- Case-study audit found follow-up gaps: direct `/work/:slug` and Page Studio preview schedule gating, dedicated public Project DTO, stricter `/llms.txt` eligibility, guided block editing and optional additive disclosure/audience governance.
- No production deploy, commit or push is authorized for this setup session.

## Remaining work

- Finish P4-001 verification before starting P4-002: use a safe non-production PostgreSQL/session target to verify ADMIN/EDITOR save and round-trip, denied roles, preserved CV/About siblings, DB-derived `/hire` output, and desktop/mobile editor/public visuals.
- Complete DB-backed end-to-end Creative Lab CMS and Page Studio verification (P3-007) without touching production data.
- Apply P2-001 migration to a populated database copy/target before promoting it to VERIFIED.
- Run HTTP/browser verification for `/hire` and `/studio` when database connectivity is available.
- Implement Phases 2–8 in dependency order, checkpointing after every meaningful task.
