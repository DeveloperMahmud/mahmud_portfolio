# Project Progress

## 2026-11-12 - Professional case-study image containment

- Diagnosed the unprofessional full-width board as the legacy `100vw` rule on `FULL_BLEED_IMAGE` blocks.
- Standalone boards are now centered within CMS-controlled maximum widths: 900px for standard boards and 780px for extra-tall presentations.
- Aspect classification, frame styling and caption treatment are responsive and preserve the existing image viewer.
- Local verification passes 44/44 focused tests, JS syntax, typecheck, build and diff check. Preview browser verification is next.
- Commit `cd2000f` is live. Browser QA confirms the affected 1464x3600 board is centered at 780px in a 1280px viewport after aspect classification, with no horizontal overflow.

## 2026-11-12 - Project-card navigation correction

- Root cause: the global lightbox capture listener treated homepage project thumbnails as standalone zoomable media and stopped card navigation.
- Homepage cards are now real `/work/:slug` links, and the lightbox ignores card thumbnails while remaining enabled within case-study pages.
- Versioned assets and a regression test prevent cached or future reintroduction of the conflict.
- Local verification passes 44/44 focused tests, typecheck, build and diff check. Preview deployment/browser verification is next.
- Commit `cc7503f` is live on Preview. A real thumbnail click navigated from the homepage to `/work/asf`, rendered the project detail and did not open the image viewer; this correction is browser-verified.

## 2026-11-12 - Gallery preset deployment follow-up

- Commit `8e56754` is live on the stable Preview alias; public project assets resolve to the new layout-preset versions.
- The TMNT page retains AUTO presentation defaults and has no horizontal overflow at 1280x720.
- A stale admin shell loader version was identified during deployed inspection and fixed by cache-busting `admin-addendum.js`; regression coverage now prevents the shell and case-study module versions from drifting silently.
- Commit `d93c729` propagated to the stable alias and Browser QA confirms the new addendum and case-study editor asset versions load.
- Post-fix verification passes 43/43 focused tests, typecheck, build and diff check. The CMS is signed out, so authenticated control rendering and persistence are not claimed as verified.

## 2026-11-12 - Case-study visual refinement

- Diagnosed the odd presentation as a layout issue: tall source boards were squeezed into a wide `object-fit: contain` hero and single-board galleries inherited a half-width grid cell.
- Added natural-dimension media classification, editorial hero framing, centered readable long-board widths and consistent responsive galleries.
- Local validation passes 33/33 focused tests, project JavaScript syntax, TypeScript and diff checks. Preview deployment/browser comparison is next.
- First Preview measurement confirmed the intended 16:9 frame and 780px centered full board, then exposed an oversized internal image layer; the follow-up positions the crop to the frame bounds.
- The stylesheet URL now uses the second case-media revision to make the corrected frame deterministic at the edge/browser cache.
- Landscape QA exposed a pre-decode collapse; the final media stage now reserves 16:9 desktop and 4:3 mobile geometry for every project, with shape-aware focal positioning after load.
- Final Preview acceptance: landscape and long heroes both measure 1120×630, the long source artwork remains 1464×4200, its complete gallery presentation centers at 780×2235, and fallback/overflow/log counts are zero.

## 2026-11-12 - Ten-project Behance release candidate

- Collected ten additional owner-published Behance projects and bundled fifteen verified source images under `portfolio/assets/case-studies/behance/`.
- Implemented structured evidence-bounded case studies with unique slugs, empty unsupported metrics and archive-first placement.
- Production activation is authorized and remains create-only/idempotent; no existing record or CMS setting is overwritten.
- Local acceptance passes: 251/251 tests, 5/5 smoke checks, performance budget, Prisma validation/generation, TypeScript build and diff check.
- Preview commit `22189d2` is deployed. Browser acceptance passes all ten routes with real source media, zero fallbacks/log errors, exact archive inclusion and no homepage auto-feature placement.
- Released as single squash commit `91f752f` on `main`. Production browser acceptance passes 10/10 routes, source media, archive-first placement and empty browser logs.
- The released application tree and whitespace cleanup are synchronized to `codex/v2-preview-2026-11-01`; Preview retains its additional acceptance audit history.

## Preview presentation and technical case-study implementation - 2026-11-11

- Added a one-time, Preview-only activation seed for recruiter/client presentations and public Page Studio. Production is explicitly skipped, and the seed marker prevents later CMS edits from being overwritten.
- Both presentation modes select the four verified Behance case studies and keep `noIndex` enabled for the focused walkthrough URLs.
- Added a create-once, evidence-led Page Studio technical case study covering motivation, constraints, architecture, components, workflow, QA, accessibility, security, trade-offs and individual contribution. It contains no fabricated metrics or invented media; the owner will add any missing/authorized visual evidence manually.
- Focused validation passed: Preview experiences 4/4, presentation 5/5, technical template 5/5, Behance 9/9, commercial case study 4/4, V2 case-study contract 4/4, TypeScript typecheck, production build and diff check.
- Commit `e75ba51` reached the stable Preview alias. Recruiter and client presentations rendered at 463x698; ArrowRight advanced live progress, and the client case-study step resolved the published TMNT record with its canonical link. The technical page rendered all ten sections without placeholder text, horizontal overflow or console errors.
- P4-005, P4-006 and P5-005 are now `VERIFIED`. Main/production remain untouched.
- P8-001/P8-003 remain `IN_PROGRESS`: the previous local CMS-only backup is no longer present and the current browser CMS session is signed out. No restore or other database mutation was attempted. Direct Browser Use navigation to protected text/XML crawler endpoints remains blocked by the client.

## Behance case studies verified on Preview - 2026-11-11

- P4-003 is `VERIFIED` with four selected owner-published Behance case studies: Glitter Jelly listing images, Round Powder Brush A+, Divine Face Perfecting Kit A+, and Color-Changing Lip & Cheek Tint A+.
- Each package includes role, challenge, evidence-bounded process, deliverables, Behance-attributed tools, accessible cover/board media, structured project blocks, and honest outcome language. All unverified metric arrays are empty.
- Preview visibility is automated safely: `vercel-build` runs the create-only seed, `VERCEL_ENV=preview` publishes the records, and `VERCEL_ENV=production` skips the seed pending a separate owner-approved release. Existing CMS-edited slugs are preserved.
- Validation passed: Prisma client generation, typecheck, build, Behance 9/9, commercial case study 4/4, V2 contract 4/4, and `git diff --check`.
- Preview commit `aca2c10` created/published all four missing records. The stable alias rendered each public route with the correct case-study heading and deliverables; full-page asset checks found valid natural dimensions and zero broken images, and the browser error log was empty. Follow-up commit `b9fc0f4` corrected source metadata to the verified original image dimensions.
- Main and production remain unchanged. Production seed execution is explicitly disabled pending a separate owner-approved release.

## Consolidated closeout gate — 2026-11-03

- Dependency-ready implementation is closed. The admin GPU/compositor mitigation is included; documented evidence/data-dependent tasks remain blocked rather than being represented as complete.
- Final local gate passed: Prisma schema validation (with a loopback-only dummy URL; no database connection or migration), Prisma Client generation, TypeScript typecheck, production build, all 237 automated tests, 5/5 static smoke routes, performance budget (424,033 measured bytes), and `git diff --check`.
- Preview backup integrity is verified locally: CMS-only format `mahmudul-portfolio-backup-v2`, schema `2.0`, 18 sections, checksum prefix `1d383c499dbe`, private inquiries excluded and media binaries excluded.
- Preview restore round-trip remains `NOT VERIFIED`: the authenticated CMS is reachable and the BACKUP workspace is functional, but the available in-app browser automation cannot attach a local file to the native file input. No restore was attempted and no database was mutated. Manual upload plus `SKIP_EXISTING` remains the exact safe verification step; `REPLACE` must not be used.
- Next action: commit and push this validated batch once to `codex/v2-preview-2026-11-01`, wait for Vercel Preview readiness, then inspect the stable Preview alias. Production/main remains untouched.

Last reconciled: 2026-11-03 (Asia/Dhaka)
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

### Consolidated Preview quality checkpoint — 2026-11-03

- Active release work remains Phase 8: P8-001 and P8-003 are `IN_PROGRESS`. P8-002 is `COMPLETED`; production/main remain unauthorized and untouched.
- Consolidated local validation passed: build, typecheck, operations 9/9, frontend 21/21, V2 quality 4/4, performance budget, Creative Lab Phase 2 gate 4/4, all six flagship focused suites, review-workspace security 4/4, and `git diff --check`.
- The Vercel Preview stable alias was browser-checked at 1440x900 and 390x844 for all six flagship demo routes. Every route rendered its real interface, retained honest concept/limitations language, and showed no horizontal document overflow or browser-console error at the checked viewports.
- Homepage visible-media inspection checked 11 rendered images and found 0 visibly broken images. This confirms the current fallback presentation, not recovery of the four historical missing upload objects.
- The six flagship tasks remain `COMPLETED`, not `VERIFIED`: upload/export/approval interactions and DB-backed P3-007 acceptance were not fully exercised.
- Authenticated backup/restore round-trip and complete non-admin RBAC acceptance remain the two release-blocking verification gaps. No production or owner data was mutated.
- SEO runtime evidence is protected: unauthenticated requests to `/sitemap.xml`, `/robots.txt`, and `/llms.txt` returned the Vercel Deployment Protection HTML shell (`text/html`), not application responses. This is not recorded as an application failure; crawler endpoint contents remain `NOT VERIFIED` on this protected Preview alias.
- Exact next action: obtain/retain a safe authenticated Preview CMS session and test-owned records, run the reversible backup/restore drill plus non-admin permission matrix, clean up only test-owned data, then re-run the release gate. Do not promote P8-001/P8-003 before that evidence exists.

### Viewer RBAC and backup-export checkpoint — 2026-11-03

- Re-enabled the existing test-owned Viewer account with a temporary password, authenticated it on an isolated current Preview deployment origin, and inspected the current deployment runtime logs.
- Runtime evidence: `/api/auth/me`, projects, content, brands and brand-assets returned 200; analytics, maintenance settings/status, inquiries and activity returned 403. This confirms the deployed Viewer read/deny boundary for the exercised routes.
- The isolated Viewer CMS tab became unresponsive to browser inspection after login, but Vercel runtime logs captured the authenticated requests. The test account was returned to `DISABLED` and the CMS confirmed `User access updated.`
- Exported one CMS-only portable backup from Preview. The UI recorded `COMPLETE`, checksum prefix `1d383c499dbe`; the downloaded file is `C:/Users/USER/Downloads/mahmudul-portfolio-2026-11-02T20-14-36-322Z-v2.json` (361,079 bytes). Private inquiries were not included.
- Restore validation and application are still pending. Uploading that local backup through the Windows file dialog requires explicit user confirmation; no restore request or data mutation has occurred.
- P8-001/P8-003 remain `IN_PROGRESS`: Viewer runtime evidence is stronger, but the Editor/Writer/Moderator runtime matrix and reversible restore round-trip are not complete.

### Non-admin role matrix checkpoint — 2026-11-03

- Reused only the existing test-owned account, one role at a time, on isolated Preview deployment origins. Editor, Writer and Moderator authentication all returned 200 for login and auth/me.
- Editor and Writer sessions loaded projects, content and brands with 200 responses. Moderator loaded projects/content/brands and the role-specific `/api/admin/operations/inquiries?pageSize=100` route with 200; maintenance settings and brand assets also loaded under the documented Moderator read scope.
- The earlier Viewer run confirmed protected analytics/maintenance/inquiry/activity routes return 403 while its allowed content reads return 200.
- Existing focused static regressions cover Viewer read-only writes, Writer draft-only/no-delete/no-share behavior, Editor account/system/recovery exclusion, and Moderator workflow scoping. No owner content was changed during runtime role checks.
- Cleanup is complete: the test account is back to role `VIEWER`, status `DISABLED`, with CMS confirmation `User access updated.`
- The non-admin runtime/read matrix is now accepted for the exercised boundaries. P8-001/P8-003 remain `IN_PROGRESS` only because the portable backup still needs server validation plus the reversible `SKIP_EXISTING` restore/pre-restore-copy drill.

### Local backup integrity checkpoint — 2026-11-03

- Parsed the downloaded CMS-only Preview export locally without exposing record content. Format is `mahmudul-portfolio-backup-v2`, schema is `2.0`, and all 18 data-section counts equal the manifest counts.
- Recomputed the checksum with the same SHA-256 over `JSON.stringify(unsignedBackup)` used by the server; it exactly matches checksum prefix `1d383c499dbe`.
- The artifact is CMS-only: `includesPrivateData=false`, no `inquiries` collection is present, and `mediaFilesIncluded=false`.
- This is local artifact verification, not a restore. Upload/server validation and the reversible `SKIP_EXISTING` restore remain `NOT VERIFIED` and require explicit user confirmation because they upload a local file and mutate the Preview database.
- Exact next action: after explicit confirmation, upload the exact export to the authenticated Preview CMS, run server validation, then execute only `SKIP_EXISTING`; record counters, pre-restore backup ID/checksum and rollback state. Do not use `REPLACE` and do not touch production/main.
- External blocker audit: explicit upload/restore confirmation remained absent across three consecutive goal turns. All safe local integrity work is exhausted, so the active goal is blocked at this exact acceptance step; P8-001/P8-003 themselves remain `IN_PROGRESS`, not falsely completed.

### Dependency-ready implementation closeout — 2026-11-03

- The owner requested implementation-first batching: no focused test suite or browser verification is run until all dependency-ready code changes are complete.
- Removed the perpetual public neural canvas loop from the admin shell only. Admin now retains a static branded ambient background; public routes retain the interactive animation. The asset URL is cache-busted and a regression assertion is staged for the final validation batch.
- Reconciled P4-005 and P4-006 to `BLOCKED`: their reusable engines/templates and publish-safety code exist, but honest activation requires P4-003 real project facts/media. No placeholder client evidence was substituted.
- Dependency-ready Phase 6 and Phase 7 source work is complete. Remaining executable work is Phase 8 consolidated validation, Preview-only reversible restore acceptance, one authorized Preview push and post-deploy checks.

### Latest checkpoint — 2026-11-03 (Restore safety hardening implemented locally)

- P8-001/P8-003 remain `IN_PROGRESS`; main/production remain untouched. The working Preview branch is `codex/v2-preview-2026-11-01`.
- The pending account asset cache/version patch is present and frontend regressions pass 21/21.
- Backup restore now creates a private-aware pre-restore recovery payload, records its private-data scope, and runs every content mutation plus success audit inside one serializable transaction.
- `SKIP_EXISTING` now applies consistently to all exported collections; page-taxonomy no-ops count as skipped; responses distinguish created/updated/skipped; natural-key ID mismatches fail closed; date-shaped fields are normalized; failed transactions report rollback and retain the pre-restore payload.
- Verification: TypeScript build, typecheck, operations 9/9, frontend 21/21 and `git diff --check` pass. No live/Preview database restore has been executed, so runtime backup/restore acceptance is still `NOT VERIFIED`.
- Exact next action: commit/push this bounded patch to the Preview branch, wait for Vercel Ready, then run a reversible test-owned Preview backup/restore drill before promoting P8-001.
- Deployment evidence: Preview commit `cf230f2` was pushed; the stable Preview alias loads the public homepage and CMS sign-in shell and serves `admin-page-studio.js?v=20261102-11`. This verifies release propagation, not restore behavior.

### Latest checkpoint — 2026-11-02 (Preview Viewer lifecycle partially verified)

- Created one test-owned `VIEWER` account in the separate Preview database, confirmed the Account list round-trip, attempted an isolated-host login, then disabled the account and confirmed `User access updated.` No owner record or production data was changed.
- The live create flow exposed an async form bug: `event.currentTarget` became null after the request. The handler now captures the form before `await`; frontend regressions 21/21, TypeScript build and diff check pass.
- The isolated Viewer login left the sign-in shell, but browser inspection of that host became unresponsive before allowed/denied workspaces could be evidenced. Non-admin RBAC therefore remains `IN_PROGRESS`, not verified.
- Exact next action: deploy the form fix to Preview, verify the create form no longer throws, then complete reversible backup/restore acceptance with test-owned Preview data. Four historical upload assets still need an owner decision.

### Latest checkpoint — 2026-11-02 (Mobile CMS acceptance verified)

- Preview commit `a65519c` is deployed on the stable branch alias. At 462x698 the CMS loads `admin.js?v=20261102-4` and the corrected mobile stylesheet.
- Browser evidence verifies drawer open position `x=0`, scroll access to lower navigation, Account/Lead Center/System Health routing, and automatic close with `aria-expanded=false`, `aria-hidden=true`, `x=-336`.
- Page Studio and Homepage Studio both opened from the authenticated CMS and rendered their workspaces plus Back to CMS controls. No mutation was performed.
- P8-001/P8-003 remain `IN_PROGRESS`; next acceptance work is non-admin role verification and reversible backup/restore using test-owned Preview data only.

### Latest checkpoint — 2026-11-02 (Authenticated CMS audit and mobile drawer fix)

- Preview commit `b002827` is deployed. The authenticated stable alias now loads `admin.js?v=20261102-2` and `admin-mobile-nav.css?v=20261102-1`; the drawer reaches `x=0` and System Health opens at 462 px.
- A second mobile defect was observed: selecting System Health left the drawer open. The capture-phase canonical tab router stopped later listeners, so the local follow-up now closes the menu from that same router through a bounded callback and advances the loader cache key to `admin.js?v=20261102-4`; redeploy verification is pending.
- The owner-authenticated ADMIN Preview session loaded the dashboard and Creative Lab manager with 12 canonical tools. One F01 draft editor was opened and closed without mutation; its published state, editable fields, draft/publish separation and revision controls rendered correctly.
- Read-only navigation/browser evidence passed for Analytics, SEO & Visibility, Control Center and Settings / Site. No content, feature flag, account, backup or publication state was changed.
- At the 462 px browser viewport, the mobile menu toggle correctly set `aria-expanded=true` and `admin-menu-open`, but the drawer retained `translateX(-105%)` and remained at `x=-336px`. This blocked lower navigation such as System Health & Recovery.
- Added a higher-specificity mobile drawer open rule with an explicit cache-busted stylesheet URL, plus a regression assertion. Frontend regressions pass 21/21 and TypeScript build passes.
- P8-001 and P8-003 remain `IN_PROGRESS`. Exact next action: validate/deploy the canonical-router close follow-up, confirm the drawer closes after mobile navigation, then finish read-only Lead Center, Account, Page Studio and Homepage Studio checks. Backup/restore mutation and non-admin RBAC remain unverified.

### Latest checkpoint — 2026-11-02 (Preview catalog activation pending redeploy)

- The fixed Preview loads `/`, `/hire`, `/studio`, `/creative-lab` and `/admin.html`; the Zod serverless crash is resolved.
- Creative Lab reaches its public API without an error but reports 0 tools, proving the Preview database migration is reachable while the canonical catalog was not seeded by deployment.
- Added the already-tested idempotent `seed-creative-tools.mjs` step to `vercel-build` after migrations and before TypeScript build. Existing canonical rows retain all owner-editable fields; only missing rows are created and seed metadata is refreshed.
- Focused seed/deploy-order checks pass 5/5, TypeScript build and diff check pass.
- Exact next action: push this Preview-only branch change, confirm Vercel migration/seed/build success, verify 12 public tools and demos, then continue authenticated CMS/RBAC and backup/restore checks.

### Latest checkpoint — 2026-11-02 (Preview runtime crash fixed locally)

- Authorized Preview access exposed a real serverless import crash: Zod v4 rejected `.omit()` on the refined `creativeToolDraftPatchSchema` at `src/lib/creative-tools-admin.ts`.
- Refactored the schemas around one unrefined `creativeToolDraftFieldsSchema`, then extended it with `expectedUpdatedAt` before applying the patch-level refinement. Draft validation and snapshot boundaries remain unchanged.
- Added a regression assertion that forbids composing the refined patch schema with `.omit()`.
- Verification: compiled module import succeeds, focused Creative Tool suites pass 10/10, all repository tests pass 232/232, TypeScript build and diff check pass.
- Exact next action: commit and push this runtime fix to `codex/v2-preview-2026-11-01`, wait for the replacement Vercel Preview deployment, then retest health/public/admin routes and Preview DB behavior. Production/main remains unauthorized.

### Latest checkpoint — 2026-11-02 (Preview branch deployed)

- Commit `94a22f0` (`Complete Portfolio V2 tools quality and preview release gate`) was pushed to `codex/v2-preview-2026-11-01`; `main` was not changed.
- GitHub/Vercel reports deployment `8TnSMRhbBR6nNhoUJjzHetvyFEGd` as successful for commit `94a22f0`.
- Preview URL: `https://mahmudportfolio-git-codex-v2-preview-2026-11-01-alpha-8307.vercel.app`.
- Runtime route checks are blocked by Vercel Deployment Protection: `/api/health`, `/`, `/hire`, `/studio`, `/creative-lab` and `/admin.html` all redirect to the Vercel login flow. This proves protection is active, not that the application routes or Preview database are healthy.
- P8-001 remains `IN_PROGRESS`; Preview DB migrations, authenticated route behavior and backup/restore remain unverified. P8-003 remains `IN_PROGRESS` because the authorized Preview release exists but application monitoring is protection-blocked. Production/main release is still unauthorized.
- Exact next action: obtain an authorized Vercel Preview session or scoped Deployment Protection bypass for this preview, then test health/public/admin routes and Preview DB migration state without touching production. Separately, P4-003 still requires owner-supplied real case-study evidence.

### Latest checkpoint — 2026-11-02 (Phase 8 local release gate)

- P8-001 is `IN_PROGRESS`: Prisma validate/generate, all 42 test files (232/232 tests), static smoke, performance budget, TypeScript build and diff check pass. Production-like Preview DB migration/auth/backup-restore acceptance is still pending.
- P8-002 is `COMPLETED`: Creative Lab administration/roadmap, WordPress migration, environment/rollback/ownership, verification and preview release documents are in `docs/`.
- P8-003 is `IN_PROGRESS`: the user authorized one push to `codex/v2-preview-2026-11-01` and Vercel Preview testing. Production/main remains unauthorized.
- Playwright visual automation is configured; execution was attempted but local browser binaries are absent. This is recorded as NOT VISUALLY VERIFIED, not a false pass.
- Exact next action: stage and commit the complete recoverable batch, push the existing preview branch once, then inspect the Vercel Preview deployment, migrations and public/admin routes using the separate Preview database.

### Latest checkpoint — 2026-11-02 (Phase 7 code gate)

- P7-001 through P7-007 are code-level complete; P7-006 is `VERIFIED` by measured repository budgets, while browser/runtime-dependent work remains `COMPLETED`, not `VERIFIED`.
- Added a bounded accessibility/security/portability suite, Page Studio keyboard tab behavior and visible focus treatment.
- Hardened legacy project share links with mandatory 1–30 day expiry, revoke/audit, dedicated rate limit, token-log suppression, redacted project output and reviewer-PII-free responses. The isolated Review Workspace remains the recommended path.
- Added desktop/mobile Playwright regression artifacts and a loopback-only static preview server. Execution was attempted but browser binaries are absent, so no visual verification is claimed.
- Critical asset budgets pass: 424,033 measured bytes across seven named entry assets; lazy media, reduced motion, no autoplay and deferred head scripts pass.
- Page Studio WordPress handoff v2 excludes editor state, animation data and executable JavaScript; it emits semantic tokens, media remapping and manual-review notes. Migration documentation was added.
- Validation: quality 4/4, Page Studio 49/49, frontend 21/21, performance budget and TypeScript build pass. Exact next action: Phase 8 consolidated regression/data-safety gate, operations/release docs reconciliation, then one authorized preview-branch commit/push and Preview test.

### Previous checkpoint — 2026-11-02 (P7-001/P7-002 code complete)

- P7-001 and P7-002 are `COMPLETED`, not `VERIFIED`.
- Sitemap now includes stable recruiter/studio/lab routes, published service routes and only published/indexable Creative Lab records; llms.txt exposes only public indexable projects/articles/tools with the tool limitation boundary.
- Demo and review routes remain noindex; review pages also remain no-store.
- Analytics now accepts tool card/detail/demo/live and recruiter CTA events, respects DNT/GPC/admin/local/bot exclusions, keeps identifiers salted/hashed and exports an Event taxonomy worksheet.
- Validation: combined discovery/analytics suite 3/3, JavaScript syntax, TypeScript build and diff check pass. Live crawler/analytics configuration and browser interactions remain unverified.
- Exact next action: P7-003 through P7-007 quality/security/performance/export audit and fixes, then Phase 8.

### Latest checkpoint — 2026-11-02 (Phase 6 code gate)

- P6-006 Review & Approval is `COMPLETED`, not `VERIFIED`; all six Phase 6 engine code tasks are now complete, while P3-007 DB acceptance remains pending.
- Added isolated review workspaces, immutable media-backed versions, hash-only 1–30 day scoped tokens, revoke/close, fragment exchange to strict HttpOnly session, redacted DTOs, comments and append-only exact-version decisions.
- Public review routes use origin checks, dedicated rate limiting, no-store/noindex/referrer/CSP controls and ActivityLog audit events. Only existing `PUBLIC` complete Media assets are eligible.
- Confidential binary review remains explicitly `BLOCKED` until private object storage plus authenticated signed delivery exists.
- Validation: Prisma generation, review security 4/4, F06 prototype 3/3, JavaScript syntax, TypeScript build and diff check pass. Migration was not applied; DB runtime/browser/RBAC behavior remains unverified.
- Exact next action: start P7-001 SEO/GEO integration, then continue through Phase 8 before the authorized one-time preview push/test.

### Latest checkpoint — 2026-11-02 (P6-005 code complete)

- P6-005 Listing Visual Audit is `COMPLETED`, not `VERIFIED`; Phase 6 continues.
- Canonical F05 now records eight bounded human findings and visible evidence notes, reports only factual clear/review/not-checked counts and exports local JSON/text.
- It does not upload artwork, run computer vision, calculate a quality score, certify compliance or persist/transmit input.
- Validation: focused 4/4, JavaScript syntax, TypeScript build and diff check pass. Browser/export/responsive and P3-007 DB-backed acceptance remain pending.
- Exact next action: implement P6-006 as an isolated, redacted, expiring-token public-safe review MVP. Confidential binary delivery remains blocked until private object storage and signed authenticated delivery exist.

### Latest checkpoint — 2026-11-02 (P6-004 code complete)

- P6-004 Smart Creative Brief Builder is `COMPLETED`, not `VERIFIED`; Phase 6 continues without a phase-boundary stop.
- Canonical F04 now builds a bounded local brief, identifies missing brand/product/goal/audience/deliverable/deadline/asset information and exports local JSON/text. No network, persistence, email, approval, contract or AI-generation claim exists.
- Validation: focused 4/4, JavaScript syntax and TypeScript build pass. Browser/export/responsive and P3-007 DB-backed acceptance remain pending.
- Exact next action: P6-005 criteria-driven Listing Visual Audit engine, with explainable authored/human findings and no opaque automated certainty.

### Latest checkpoint — 2026-11-02 (P6-003 code complete)

- P6-003 Amazon Listing & Premium A+ Creative Planner is `COMPLETED`, not `VERIFIED`; Phase 6 remains active.
- Canonical F03 now turns bounded local product, audience, tone, marketplace, verified USP, asset and evidence inputs into a deterministic 4–9 image sequence and 3–7 A+ module map.
- It flags exact message reuse across listing/A+, exposes asset/evidence checklists and exports versioned JSON plus a human-readable brief locally. It does not invent copy/evidence, claim universal program rules or certify marketplace compliance.
- Validation: P6-003 4/4, P6-002 5/5, P6-001 6/6, Phase 2 aggregate 4/4, JavaScript syntax, TypeScript build and diff check pass.
- Not verified: real browser export interactions, desktop/mobile visual review and P3-007 DB-backed persistence/public acceptance.
- Exact next action: implement P6-004 Smart Creative Brief Builder with bounded validation, missing-information prompts and local printable/JSON output; do not imply delivery, consent or durable save.
- Preview push remains deferred until the authorized implementation batch is complete.

### Latest checkpoint — 2026-11-02 (P6-002 code complete)

- P6-002 Text Readability & Contrast Analyzer is `COMPLETED`, not `VERIFIED`; Phase 6 remains active.
- Canonical F02 now calculates the exact WCAG contrast ratio for known foreground/background colors, selects normal/large-text AA and AAA thresholds from editable size/weight, updates a scale preview and can sample representative pixels from a bounded browser-local image.
- Local-image processing is limited to PNG/JPEG/WebP, 12 MB and 40 MP. No OCR, text detection, remote upload, persistence, whole-image accessibility score or conformance certification is claimed.
- Validation: P6-002 focused 5/5, Phase 2 aggregate 4/4, JavaScript syntax, TypeScript build and diff check pass. A boundary fixture was corrected from `#777777` (4.48:1) to `#767676`; the production formula was correct.
- Not verified: real browser pixel sampling/report download, desktop/mobile visual review and P3-007 DB-backed acceptance.
- Exact next action: implement P6-003 A+ Creative Planner as a bounded structured local planning/export workflow without inventing product evidence or universal marketplace requirements.
- Preview push remains deferred until the authorized implementation batch is complete.

### Latest checkpoint — 2026-11-02 (P6-001 code complete)

- Current active phase: **Phase 6 — Flagship Tool Functional Activation**. Earlier evidence and DB verification blockers remain preserved.
- P6-001 Amazon Thumbnail Readability Tester is `COMPLETED`, not `VERIFIED`.
- The canonical F01 route now decodes PNG/JPEG/WebP locally, enforces 12 MB / 12,000 px / 40 MP safety limits, renders 80/120/160 px previews, reports source dimensions plus global luminance-spread and edge-density observations, tracks four explicit human checks and exports a local evidence report.
- Removed the prototype `/100` score because it implied unsupported certainty. No OCR, product identification, compliance certification, claim validation or performance prediction is represented.
- Validation: P6-001 focused 6/6, Creative Tool detail 3/3, Phase 2 aggregate 4/4, JavaScript syntax, TypeScript build and diff check pass.
- Not verified: real browser file/download behavior, desktop/mobile visual review and DB-backed P3-007 public/CMS acceptance.
- Exact next action: implement P6-002 Text Readability & Contrast Analyzer as a bounded browser-local engine, preserving the same honest evidence/no-certification boundary.
- Do not push yet. The user authorized one preview-branch push and deployment test only after the implementation batch is complete.

### Latest checkpoint — 2026-11-02 (Phase 5 code gate)

- Current active phase: **Phase 5 — Six mini-tool engines**. Phase 4 evidence-dependent items remain blocked/in progress, not skipped or completed.
- Phase 5 implementation state: P5-001, P5-002, P5-003, P5-004 and P5-006 are `COMPLETED`, not `VERIFIED`. P5-005 is `BLOCKED` by P4-003 real case-study evidence.
- Newly completed: P5-004 Brand Asset Kit Generator with bounded editable identity/palette/type/guidance tokens, system-font presets, token-driven preview, versioned local JSON and print output.
- Consolidated validation: M01 4/4, M02 4/4, M03 4/4, M04 4/4, M06 3/3, aggregate mini tools 4/4, presentation safety 5/5, JavaScript syntax, TypeScript build and diff check pass.
- Not verified: browser file/clipboard/download/print interactions, generated PDF/font rendering, desktop/mobile visuals and DB-backed P3-007 acceptance.
- Exact next action: preserve P5-005/P4-003 as evidence-blocked; audit the first independent Phase 6 engine implementation path without weakening the P3-007 database/publication dependency.
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

- P6-004 Smart Creative Brief Builder. Bounded clarification/export workflow passes focused/build checks; browser and DB-backed acceptance remain pending.
- P6-003 Amazon Listing & Premium A+ Creative Planner. Bounded deterministic plan/repetition/evidence/export workflow passes focused/static/build checks; browser and DB-backed acceptance remain pending.
- P6-002 Text Readability & Contrast Analyzer. Exact color contrast, type thresholds, local pixel sampling and evidence export pass focused/static/build checks; browser and DB-backed acceptance remain pending.
- P6-001 Amazon Thumbnail Readability Tester engine. Browser-local bounded analysis and report export pass focused/static/build checks; browser and DB-backed acceptance remain pending.

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

### Preview runtime checkpoint — 2026-11-02

- Authenticated Vercel Preview browser checks confirm `/`, `/hire`, `/studio`, `/creative-lab` and `/admin.html` load; public settings, projects, brands and homepage-layout APIs return HTTP 200 in runtime logs.
- Creative Lab currently renders `Showing 0 tools`. Root cause is verified in source: the seed script's direct-execution guard constructed a Windows-oriented `file:///` URL, so Vercel Linux exited successfully without calling `seedCreativeTools()`.
- Replaced that guard with `pathToFileURL(process.argv[1])`; focused seed tests pass 6/6 and TypeScript typecheck passes. Redeploy/browser verification is still required before the catalog can be marked active.
- Runtime logs expose four legacy `/uploads/portfolio/...` 404 image requests. These are missing historical local-upload assets, not a server crash; media repair/migration remains separate pending work.
- After the portable seed redeploy, the public catalog is browser-verified at 12 total, 6 flagship and 6 mini tools. The first detail-route check exposed `ui.statusBadge is not a function`; `statusBadge` is now exported by the shared UI module and the detail regression passes 3/3. Fresh deploy verification is pending.
- Preview commits `14c0e3c` and `945ed90` are Ready. The stable branch alias now browser-renders the F01 detail page and its local image-review demo correctly; the shared asset URL is versioned to prevent stale edge/browser copies. CMS `/admin.html` reaches the sign-in shell, but CMS-authenticated verification is blocked until the user signs in there.

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

## Case-study CMS presentation controls — 2026-11-12

- Audited the Behance layout polish and confirmed that media sources were CMS-managed but the new crop/grid behavior was code-level only.
- Added optional `Project.caseStudyStyle` JSON via additive migration `0026_case_study_style`; no existing record requires a backfill and `AUTO` preserves the accepted layout.
- The Project editor now exposes hero aspect, fit, focal point, gallery columns, standard-board width, long-board width and gallery gap.
- The public case-study renderer normalizes every value, clamps numeric ranges and applies scoped CSS variables/data attributes to modular and legacy galleries.
- Local verification: Prisma generate/validate, typecheck, build, JS syntax, diff check and focused tests 38/38 passed.
- Pending: commit/push only to `codex/v2-preview-2026-11-01`, wait for the Preview migration/deploy, then verify one default project and one CMS-customized project at desktop/mobile. Main remains untouched.
- Commit `5815335` is pushed and the stable Preview alias serves the new JS/CSS. Browser evidence on the TMNT project confirms AUTO attributes, 900px/780px/16px variables, a 1120×630 hero and no desktop horizontal overflow. CMS is signed out, so a customized save/round-trip and mobile viewport remain pending; main is still untouched.

## Gallery preset module — 2026-11-12

- Researched first-party Behance project/photo-grid guidance, current Dribbble shot discovery, and Pinterest board/Pin organization before defining portfolio-native presets rather than cloning external interfaces.
- Added project presets: `BEHANCE_STORY`, `DRIBBBLE_SHOTS`, `PINTEREST_MASONRY`, and `EDITORIAL_BENTO`, with `AUTO` preserving the current accepted layout.
- Added default image shapes: Auto, Original, Square 1:1, Rectangle 4:3, Wide 16:9, Portrait 4:5 and Tall 2:3.
- Added three control levels: project defaults, GALLERY/IMAGE_GRID block overrides, and individual image overrides. Legacy gallery thumbnails also expose an individual shape selector.
- Added a CMS schematic preset preview and responsive public CSS; masonry uses 2–4 CMS columns, reduces on mobile and avoids splitting an image across columns.
- Passed build/typecheck, Prisma validation/generation, JS syntax, diff check and 43/43 focused tests. Next: push Preview, confirm deployed assets, inspect default and preset rendering, and record remaining authenticated CMS limits.
## Image module presentation controls — 2026-11-12

- Added CMS-managed standalone/gallery image width (`AUTO`, narrow, container, wide, full, custom), max width, fit, aspect, alignment, focal point, frame, caption and mobile presentation overrides.
- The contract is stored inside existing Project/block JSON and requires no schema migration. Server validation clamps ranges and rejects unsupported values.
- Public rendering preserves accepted `AUTO` layouts; explicit `FULL` is the opt-in viewport-bleed mode. Responsive mobile overrides are scoped per image.
- Local evidence: focused suites 45/45, TypeScript build, JS syntax and diff check pass.
- Next: deploy to Preview, browser-check a default Behance case study and CMS shell assets, then reconcile Preview/main histories and promote the accepted Preview set to main under the owner's new authorization.
## Image presentation Preview acceptance — 2026-11-12

- Preview commit `8ee1bb0` is live on the stable branch alias with the new project/CMS assets.
- Existing Behance AUTO behavior is visually accepted on desktop: a long board is centered at 780px and `scrollWidth === clientWidth === 1265`.
- CMS asset propagation is verified while signed out; authenticated edit/save/reload and a real mobile viewport remain pending and are not represented as accepted.
- The owner has authorized merging the accepted Preview history into `main`; fetch evidence shows main has one unique release commit and Preview has 43 unique commits. Promotion must use a normal merge, never force push.
## Main integration gate — 2026-11-12

- Accepted Preview content is merged locally into main without force and the resulting tree matches Preview exactly.
- Full regression evidence: 256/256 Node tests; TypeScript typecheck/build; admin/project/case-study JavaScript syntax; clean diff check.
- Local Prisma validation remains environment-blocked by missing `DATABASE_URL`; Preview deployment already completed migrations/build successfully for this content.
- Next: complete the merge commit, push main once, verify the deployed main site/assets, then return the local working branch to Preview for future experiments.
## CMS project ordering — 2026-11-12

- Projects can now be reordered directly in the admin list by drag/drop or ↑/↓ controls; the visible order is persisted through canonical `sortOrder` values.
- The save is atomic, validates duplicate/unavailable IDs and does not mutate project copy, media, publication status or timestamps beyond the order field.
- Local gate passed: focused suites 32/32, typecheck/build, JS syntax and diff check.
- Next: commit and push directly to main per owner instruction, confirm production serves the new versioned admin asset, and report authenticated drag persistence as unverified unless a signed-in controllable session is available.

## Gallery editor UI polish — 2026-11-13

- Project-wide preset controls now have a direct schematic preview for preset, shape and masonry-column choices; it is intentionally a layout simulation, not an embedded content preview.
- Legacy gallery image settings now render as responsive professional cards rather than narrow vertical control strips.
- Local gate passed: focused suites 32/32, typecheck/build, JS syntax and diff check; saved data/public rendering remain backward-compatible.
- Next: commit and push directly to main, then confirm production serves `admin.js`, `admin-addendum.js` and `admin-case-study.css` version `20261113-gallery-ui-1`.

## Library-first collection navigation — 2026-11-13

- Projects and Journal/Content now default to their searchable existing-item libraries; create forms appear only after the matching New action.
- Edit, dashboard quick-create, Back, Clear and post-save behavior all resolve to an explicit library/editor state.
- Create actions remain limited to ADMIN, EDITOR and WRITER; the change is frontend-only with no data or API migration.
- Local gate passed: focused suites 33/33, typecheck/build, JS syntax, clean diff and browser-verified transitions without horizontal overflow.
