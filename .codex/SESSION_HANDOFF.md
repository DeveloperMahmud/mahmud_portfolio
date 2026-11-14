# Session Handoff

## 2026-11-12 case-study board containment handoff

1. Affected route: `/work/color-changing-lip-cheek-tint-amazon-premium-a-plus`.
2. Before the fix, `.case-image.full-bleed` measured 1280px in a 1280px viewport despite a 1120px project column.
3. `classifyProjectMedia` now marks standalone images by aspect and flags long boards.
4. Full-bleed blocks now use `--case-gallery-max` (900px default); long boards use `--case-long-board-max` (780px default), centered with a restrained frame/caption.
5. Project assets use the `20261112-editorial-boards-1` cache key.
6. Verification passes: JS syntax, 44/44 focused tests, typecheck, build and diff check.
7. Commit `cd2000f` is live on Preview; Browser QA measured the loaded 1464x3600 board at 780px wide, centered at x=242.4 in a 1280px viewport, with `is-long has-long-media` and no horizontal overflow.
8. No follow-up is required for this layout defect. Main remains untouched.

## 2026-11-12 project-card navigation handoff

1. Preview reproduction proved that thumbnail clicks opened `.image-viewer` and did not change the homepage URL.
2. `portfolio/app.js` now renders native project-card anchors to `/work/:slug`.
3. `portfolio/image-viewer.js` ignores `.project-card` and `.featured-slide` navigation surfaces; case-study gallery images still open in the viewer.
4. Homepage JS, viewer and stylesheet URLs use `20261112-project-links-1` cache keys.
5. Verification passes: JS syntax, 44/44 focused tests, typecheck, build and diff check.
6. Commit `cc7503f` is live on Preview; app, image viewer and stylesheet all serve the `20261112-project-links-1` cache key.
7. Browser acceptance passed: clicking the first project thumbnail navigated to `/work/asf`, `.project-detail` rendered, and `.image-viewer` remained closed.
8. No follow-up is required for this defect. Main remains untouched.

## 2026-11-12 gallery preset deployment handoff

1. Commit `8e56754` is pushed and the stable Preview alias serves `project.js?v=20261112-layout-presets-1` plus `styles.css?v=20261112-layout-presets-1`.
2. Public TMNT verification at 1280x720 confirms AUTO defaults and no horizontal overflow.
3. Preview CMS is signed out. Its deployed shell revealed a stale `admin-addendum.js` cache key that could load the old case-study editor.
4. The worktree now cache-busts the admin addendum URL and asserts both loader versions in the focused regression suite.
5. Post-fix checks pass: 43/43 tests, typecheck, build and diff check.
6. Cache fix `d93c729` is pushed and stable-alias Browser QA confirms `admin-addendum.js?v=20261112-layout-presets-1` loads `admin-case-study.js?v=20261112-3`.
7. Remaining optional acceptance: sign in to Preview CMS and perform one non-production save/reload round trip. Main remains untouched.

## 2026-11-12 case-study media handoff

1. Current branch: `codex/v2-preview-2026-11-01`.
2. `project.js` classifies rendered images from natural dimensions and applies hero/gallery treatments without changing CMS records.
3. `styles.css` gives tall covers an intentional editorial crop and keeps complete long boards centered at readable width.
4. Focused validation passes 33/33 plus syntax, TypeScript and diff checks.
5. Completed: Preview visual comparison passes for representative long and landscape projects; leave `main` untouched until separately authorized.
6. First live measurement: frame 1120×630, complete board 780×2235, no overflow/logs; a follow-up bounds the cropped hero image itself to 1120×630 before final acceptance.
7. Project CSS cache revision is `20261112-case-media-2`; do not verify the earlier revision.
8. Final CSS cache revision is `20261112-case-media-3`; every hero reserves its responsive stage before image decode.
9. Final evidence: 1120×630 hero stage/image, centered 780×2235 long board, no fallback, no overflow and no browser logs.

## 2026-11-12 release handoff

1. The worktree contains ten additional Behance case studies plus fifteen verified local media assets.
2. New entries are public/archive eligible but not featured, on the homepage or in the slider.
3. Production seeds are authorized, create-only and idempotent; existing slugs/settings/pages remain untouched.
4. Local release gate passes completely: 251 tests, smoke, performance, Prisma validation/generation, build and diff check.
5. Preview commit `22189d2` is deployed and accepted: 10/10 routes, source media, archive inclusion and homepage exclusion pass with zero browser log errors.
6. Completed: `main` was pushed exactly once at `91f752f`; production acceptance passed all ten routes/media, archive inclusion, homepage exclusion and browser logs. Code rollback is one commit revert; additive seeded records require CMS unpublish for data-level rollback.
7. Preview is synchronized with the released application tree and retains the later production-acceptance audit records.

## Active Preview-experience checkpoint - 2026-11-11

1. Completed task: P4-005 recruiter presentation, P4-006 Page Studio technical case study and P5-005 client/portfolio presentation are `VERIFIED` on stable Preview after P4-003 became verified.
2. New files: `scripts/preview-experiences.mjs`, `scripts/seed-preview-experiences.mjs`, and `scripts/preview-experiences.test.mjs`; `package.json` runs the seed after the Behance seed in `vercel-build`.
3. Safety: the script runs only when `VERCEL_ENV=preview`, production is skipped, settings are changed only before seed marker version 1 exists, and an existing technical-case-study CMS record is never overwritten.
4. Presentation evidence: both modes use the four verified Behance slugs and retain published/public-only runtime resolution plus noindex, keyboard, reduced-motion and analytics boundaries.
5. Technical evidence: the create-once public page uses ten complete evidence sections, states AI-assisted engineering honestly, includes no unsupported performance claims, and intentionally invents no media.
6. Local verification: Preview experiences 4/4, presentation 5/5, technical template 5/5, Behance 9/9, commercial 4/4, V2 case-study 4/4, typecheck/build and diff check pass.
7. Deployment evidence: `e75ba51` renders `/hire/presentation`, `/studio/presentation`, and `/pages/modular-page-studio-technical-case-study` at 463x698. Arrow navigation, published project evidence, canonical work link, ten technical sections, overflow and console checks passed.
8. Remaining release blocker: the prior CMS-only backup file is absent and the browser CMS session is signed out, so the reversible `SKIP_EXISTING` restore could not be run. No database mutation occurred. Direct text/XML crawler navigation is also blocked by Browser Use. Do not touch main/production.

## Active Behance case-study checkpoint - 2026-11-11

1. Current task: P4-003 Commercial case studies is `VERIFIED`; four owner-published evidence-led records meet the 4-6 acceptance range and render publicly on the stable Preview alias.
2. Slugs: `tmnt-face-body-glitter-jelly-amazon-listing`, `round-powder-brush-amazon-premium-a-plus`, `divine-face-perfecting-kit-amazon-premium-a-plus`, and `color-changing-lip-cheek-tint-amazon-premium-a-plus`.
3. Shared source/seed/test files are under `scripts/`; ten tracked cover/board assets are under `portfolio/assets/case-studies/behance/`.
4. Seed behavior is create-only and preserves existing CMS records. Local/manual runs default to drafts, Preview deploys publish for visibility, and production deploys skip the seed without an owner-approved production release.
5. Validation passed: Prisma generate, typecheck, build, Behance 9/9, commercial case study 4/4, V2 contract 4/4, and diff check.
6. Deployment evidence: `aca2c10` reached the stable Preview alias and published the four create-only records; all four public routes rendered correct headings/deliverables, checked images loaded with valid natural dimensions, and captured console errors were zero. `b9fc0f4` then corrected source gallery metadata to those verified original dimensions.
7. Main and production were not changed. Next exact action is owner visual review of the four Preview URLs; any copy/layout refinement should remain on the preview branch until separately approved for production.

## Final local verification checkpoint — 2026-11-03

1. Last verified implementation: admin pages no longer start the public neural canvas RAF/link loop; the branded admin background is static, while public pages retain their existing effect.
2. Verification completed: Prisma schema valid with a loopback-only dummy URL (no DB connection), Prisma Client generated, typecheck/build passed, 237/237 tests passed, static smoke 5/5 passed, performance budget passed at 424,033 bytes, and `git diff --check` passed.
3. Current task: one authorized Preview-branch commit/push and post-deployment browser smoke.
4. Restore acceptance state: local CMS-only backup integrity is verified, but upload/restore is `NOT VERIFIED` because the browser automation surface cannot attach the local JSON file. No restore or database mutation occurred. The remaining manual drill is: upload the named JSON, server-validate, select only `SKIP_EXISTING`, restore, and capture created/updated/skipped plus pre-restore backup evidence.
5. Modified files in this batch: `portfolio/admin.html`, `portfolio/neural-bg.js`, `scripts/frontend-regressions.test.mjs`, and the four `.codex` tracking files.
6. Remaining blockers: P3-007 full DB-backed CMS verification; P4-003 real commercial evidence; P4-005/P4-006/P5-005 truthful activation dependent on P4-003; four historical missing upload assets; protected crawler response contents; Preview restore round-trip described above.
7. Next exact action: review/stage these seven files, commit once on `codex/v2-preview-2026-11-01`, push once, wait for Vercel Preview Ready, and smoke-test the stable Preview alias. Do not touch `main` or production.

## Consolidated Preview quality checkpoint — 2026-11-03

1. Last verified completed task: public Preview visual coverage for the six flagship demo routes at desktop and mobile widths, with no checked horizontal overflow or console errors.
2. Current task: P8-001/P8-003 release acceptance remains `IN_PROGRESS`; P8-002 is complete.
3. Exact implementation state: restore hardening is deployed to the authorized Preview branch; build/typecheck and focused release suites pass. Public homepage/CMS shell propagation and six flagship interfaces are browser-observed.
4. Files modified by this checkpoint: only the four persistent recovery Markdown files. No application source was changed during this evidence-recording step.
5. Unfinished work: authenticated reversible Preview backup/restore, complete non-admin RBAC matrix, test-owned mutation cleanup, and an owner decision/recovery path for four historical missing uploads.
6. Tests executed: build; typecheck; operations 9/9; frontend 21/21; V2 quality 4/4; performance budget; Creative Lab Phase 2 4/4; thumbnail 6/6; contrast 5/5; planner 4/4; brief 4/4; audit 4/4; review workspaces 4/4; release configuration with a loopback non-production validation URL; diff check.
7. Browser evidence: all six flagship demo routes rendered at 1440x900 and 390x844; no checked horizontal overflow or browser-console error; homepage checked 11 visible images with 0 broken. This does not verify every interactive upload/export/approval flow.
8. SEO evidence limitation: Vercel Deployment Protection intercepted unauthenticated `/sitemap.xml`, `/robots.txt`, and `/llms.txt` probes with its HTML login shell. Treat those endpoint contents as `NOT VERIFIED`, not broken.
9. Next exact development action: with a safe authenticated Preview CMS session, create only test-owned records, download a private-aware backup, exercise MERGE/REPLACE rollback boundaries and restore counters, verify allowed/denied non-admin workspaces, then remove or disable only those test records.
10. Resume command: `Set-Location 'D:\Web Works\search-hub\.portfolio-codex-work'; git status --short; Get-Content .codex\SESSION_HANDOFF.md -TotalCount 45`.

## Viewer RBAC and backup-export checkpoint — 2026-11-03

1. Current task: P8-001/P8-003 acceptance remains `IN_PROGRESS`.
2. Viewer runtime evidence: authenticated `auth/me`, projects, content, brands and brand-assets requests returned 200; analytics, maintenance settings/status, inquiries and activity returned 403 in the latest Preview deployment logs.
3. Test-account cleanup: `codex.preview.rbac.20261102@example.com` was returned to `DISABLED`; the UI confirmed `User access updated.` Do not store its temporary password in repository files.
4. Backup evidence: CMS-only export completed with checksum prefix `1d383c499dbe`; downloaded local file `C:/Users/USER/Downloads/mahmudul-portfolio-2026-11-02T20-14-36-322Z-v2.json`, 361,079 bytes. Private inquiries were excluded.
5. No restore has run. The Backup pane currently needs the exported JSON selected, server validation completed, then a confirmed `SKIP_EXISTING` restore. This file upload requires explicit user confirmation under Windows UI automation policy.
6. Exact next action after confirmation: select that exact file in the Preview Backup pane, verify checksum/count/conflict response, keep mode `SKIP_EXISTING`, invoke the validated restore, confirm created/updated/skipped counts and downloadable pre-restore recovery copy, then run the remaining role checks.

## Non-admin role matrix checkpoint — 2026-11-03

1. Used the single test-owned account sequentially as Editor, Writer and Moderator on separate Preview deployment origins; login and auth/me returned 200 for every role.
2. Editor/Writer content reads returned 200. Moderator content reads and `/api/admin/operations/inquiries?pageSize=100` returned 200. The prior Viewer run supplied 200 allowed reads and 403 protected-route evidence.
3. Existing regressions retain write-boundary coverage: Viewer read-only; Writer draft-only/no delete/bulk/share; Editor excluded from account/system/recovery controls; Moderator limited to leads/testimonials/reviews/review workspaces.
4. Cleanup verified: account role `VIEWER`, status `DISABLED`, success message observed.
5. Remaining blocker: upload the exact exported backup JSON to the Preview Operations pane, validate it, apply `SKIP_EXISTING`, and inspect counts/pre-restore recovery copy. Windows file upload awaits explicit user confirmation.

## Restore safety hardening checkpoint — 2026-11-03

1. Current task: P8-001/P8-003 Preview acceptance remains `IN_PROGRESS`; P3-007/non-admin RBAC remains unverified.
2. Implemented locally: private-aware pre-restore snapshots, durable private-data metadata, one serializable restore transaction, consistent `SKIP_EXISTING`, accurate created/updated/skipped counters, immutable update protection, date normalization and fail-closed natural-key identity checks.
3. Pending cache/version changes for the fixed account form are also present in `portfolio/admin-page-studio.js`, `portfolio/admin.html` and `scripts/frontend-regressions.test.mjs`.
4. Files modified/created: `src/lib/backup-restore.ts`, `src/routes/operations.ts`, `scripts/operations.test.mjs`, the three account cache/version files above, and the four recovery Markdown files.
5. Validation passed: `npm.cmd run build`; `npm.cmd run typecheck`; `npm.cmd run test:operations` (9/9); `npm.cmd run test:frontend` (21/21); `git diff --check`.
6. Not verified: no Preview/live restore was run. Cross-database relationship remapping is intentionally not attempted; a natural-key/different-ID collision stops and rolls back instead of silently corrupting references.
7. Exact next action: commit and push only `codex/v2-preview-2026-11-01`, monitor Vercel, then perform a reversible backup/restore drill using test-owned Preview records and confirm the pre-restore payload remains downloadable. Do not push main or touch production.
8. Deployment evidence: `cf230f2` reached the stable Preview alias. Browser inspection loaded the homepage and CMS sign-in shell, with `/admin-page-studio.js?v=20261102-11` present. Backup/restore runtime semantics remain unverified.

## Preview Viewer/account checkpoint — 2026-11-02

1. Current task remains P8-001/P8-003 Preview acceptance (`IN_PROGRESS`).
2. A test-owned Viewer was created in Preview, seen in the ADMIN account list, used for an isolated-host login attempt, and then disabled; cleanup confirmation was `User access updated.`
3. The create UI threw after the successful server response because `event.currentTarget` was read after `await`. `portfolio/admin-account-upgrade.js` now captures the form before awaiting and `scripts/frontend-regressions.test.mjs` protects the fix.
4. Validation: frontend 21/21, TypeScript build and diff check pass.
5. The isolated Viewer tab left the sign-in shell but became unresponsive to further inspection. Do not claim allowed/denied workspace verification.
6. Exact next action: commit/push the account fix only to `codex/v2-preview-2026-11-01`, verify the deployed form, then perform reversible backup/restore acceptance using only test-owned Preview data. Production/main remains unauthorized.

## Final mobile CMS acceptance checkpoint — 2026-11-02

1. Preview commit `a65519c` (`Integrate mobile drawer close with CMS router`) is deployed on the stable branch alias; `main` and production remain unchanged.
2. Browser evidence at 462x698 confirms the alias loads `/admin.js?v=20261102-4` and `/admin-mobile-nav.css?v=20261102-1`.
3. The drawer opens at `x=0`, lower items are scroll-reachable, selecting Account/Lead Center/System Health changes the active workspace, and the drawer closes to `x=-336`, `aria-expanded=false`, `aria-hidden=true`.
4. Read-only browser checks also opened Page Studio and Homepage Studio; both render their authenticated workspaces and visible Back to CMS actions. No save, publish, account, feature-flag, backup or content mutation was performed.
5. P8-001/P8-003 remain `IN_PROGRESS`: backup/restore acceptance, non-admin RBAC, and test-owned mutation/cleanup are still unverified. Four historical upload assets remain missing.
6. Exact next action: use a separate non-admin test account and test-owned Preview records to verify denial/allowed boundaries and reversible backup/restore behavior without touching owner content or production.

## Authenticated CMS/mobile drawer checkpoint — 2026-11-02

0. Follow-up deployment: commit `555e6c6` (`Fix mobile CMS drawer navigation`) and the preceding documentation commit `dce9acf` were pushed only to `codex/v2-preview-2026-11-01`. Vercel deployment `8wpfNd8c6v2T7oKBuySifBHzEy9w` is `Ready`; its immutable URL serves `admin-mobile-nav.css?v=20261102-1`.
1. Last browser-verified work: ADMIN dashboard; Creative Lab manager with 12 tools; one F01 editor opened/closed without mutation; Analytics, SEO & Visibility, Control Center and Settings / Site loaded.
2. Current task: P8-001/P8-003 Preview acceptance remains `IN_PROGRESS`.
3. Mobile defect evidence: at 462 px, `#adminMenuToggle` reached `aria-expanded=true` and body had `admin-menu-open`, while `#adminSidebar` stayed at `x=-336px` with `translateX(-105%)`; lower CMS navigation was unusable.
4. Local fix: `portfolio/admin-mobile-nav.css` adds a specific open-state transform, `portfolio/admin.js` cache-busts the stylesheet to `v=20261102-1`, and `scripts/frontend-regressions.test.mjs` protects the behavior.
5. Validation: frontend regressions 21/21; TypeScript build passed. No CMS/DB mutation was performed.
6. Git state after the follow-up: Preview branch is clean and synchronized through `555e6c6`; `main` and production were not changed.
7. Commit `b002827` fixed the parent cache key. The authenticated stable alias then loaded `admin.js?v=20261102-2` plus `admin-mobile-nav.css?v=20261102-1`; after its transition, the mobile drawer reached `x=0` and System Health opened successfully.
8. Follow-up defect: clicking a lower navigation item left the drawer open. Browser evidence traced this to the existing capture-phase tab router calling `stopImmediatePropagation()` before a later close listener. The local correction invokes `window.closeAdminMobileMenu()` from that canonical router, exposes the bounded close callback from the mobile setup and advances the loader to `admin.js?v=20261102-4`.
9. Next exact action: run frontend/build validation, commit/push the canonical-router close fix to Preview, verify the drawer closes after navigation, then finish read-only Lead Center, Account, Page Studio and Homepage Studio checks.
10. Backup/restore and non-admin role-denial mutation are still unverified and must not be claimed. Production/main remains unauthorized. Four historical `/uploads/portfolio/...` assets remain missing.

## Preview catalog activation checkpoint — 2026-11-02

1. Commit `f18d79f` deployed successfully and removed the serverless import crash.
2. Browser-verified routes: `/`, `/hire`, `/studio`, `/creative-lab`, `/admin.html`. The public experiences and CMS login shell render.
3. Creative Lab shows 0 tools with no browser error. This indicates the Preview schema/API is reachable but the canonical seed was not executed.
4. Local change: `package.json` now runs `node scripts/seed-creative-tools.mjs` after migrations in `vercel-build`; `scripts/creative-tool-seed.test.mjs` verifies safe ordering. Existing owner fields remain preserved by the seed update branch.
5. Tests: seed suite 5/5, TypeScript build and `git diff --check` pass.
6. Exact next action: commit/push the seed activation to `codex/v2-preview-2026-11-01`, monitor Vercel, verify exactly 12 public tools and their demo routes, then obtain CMS login for authenticated CRUD/RBAC and backup/restore checks. Do not push main or touch production.

## Preview runtime crash fix checkpoint — 2026-11-02

1. Authorized Preview request reached the app and returned `500 FUNCTION_INVOCATION_FAILED`.
2. Vercel runtime logs identified the exact cause: `Error: .omit() cannot be used on object schemas containing refinements` at `src/lib/creative-tools-admin.ts:90`.
3. Local fix: `creativeToolDraftFieldsSchema` is now constructed before refinement; `creativeToolDraftPatchSchema` extends it with `expectedUpdatedAt` and then adds the non-empty patch refinement. No data model or API contract was changed.
4. Files changed for the fix: `src/lib/creative-tools-admin.ts`, `scripts/creative-tool-editor.test.mjs`, plus the four recovery files.
5. Tests: compiled module import passes; Creative Tool focused suites 10/10; all repository tests 232/232; TypeScript build and `git diff --check` pass.
6. Exact next action: commit and push the fix to `codex/v2-preview-2026-11-01`, monitor the new Vercel deployment, then verify `/api/health`, `/`, `/hire`, `/studio`, `/creative-lab`, `/admin.html`, Preview migrations and authenticated CMS behavior. Do not push main or run production migrations.

## Preview deployment checkpoint — 2026-11-02

1. Consolidated V2 batch commit: `94a22f0` (`Complete Portfolio V2 tools quality and preview release gate`).
2. Pushed branch: `codex/v2-preview-2026-11-01`; `main` and production were not changed.
3. Vercel status: deployment `8TnSMRhbBR6nNhoUJjzHetvyFEGd` completed successfully.
4. Preview URL: `https://mahmudportfolio-git-codex-v2-preview-2026-11-01-alpha-8307.vercel.app`.
5. Runtime state: Vercel Deployment Protection redirects `/api/health`, `/`, `/hire`, `/studio`, `/creative-lab` and `/admin.html` to Vercel login. Application routes, Preview DB migrations, authenticated CMS and backup/restore are therefore NOT VERIFIED.
6. P8-001 and P8-003 remain `IN_PROGRESS`; P3-007 remains DB-runtime blocked and P4-003 remains blocked on owner-supplied real case-study facts/media.
7. Tests already passed before push: Prisma validate/generate, all 42 test files (232/232), static smoke, performance budget, TypeScript build and diff check. Vercel build status passed. Local Playwright visual execution remains unavailable because browser binaries are absent.
8. Exact next action: use an authorized Vercel Preview login session or a scoped Deployment Protection bypass for this preview, then verify health, public routes, admin login/RBAC, migrations and backup/restore against the separate Preview database. Do not use production credentials, push main or run production migrations.
9. Relevant resume checks: `git -c safe.directory="D:/Web Works/search-hub/.portfolio-codex-work" status --short --branch` and `git -c safe.directory="D:/Web Works/search-hub/.portfolio-codex-work" log -2 --oneline --decorate`.

## Phase 8 pre-push checkpoint — 2026-11-02

1. Local release gate passes: Prisma validate/generate, all 42 test files (232/232 tests), static smoke, performance budget, TypeScript build and diff check.
2. P8-001 remains `IN_PROGRESS` until separate Preview DB migration/authenticated runtime and backup/restore acceptance. P8-002 is code/documentation complete. P8-003 is authorized for preview only and remains `IN_PROGRESS`.
3. Release notes: `docs/release-notes-v2-preview-2026-11-02.md`. Rollback code baseline before this batch: `400b7dc`.
4. Playwright suite exists but local Chromium/WebKit binaries are missing; no visual pass is claimed.
5. Exact next action: stage all intended Phase 5–8/recovery changes, commit on `codex/v2-preview-2026-11-01`, push that branch once, monitor Vercel Preview and test public/admin/health routes. Do not push main or run a local migration.

## Phase 7 code gate — 2026-11-02

1. P7-001 through P7-007 are code-level complete; P7-006 performance budget is verified. Browser/runtime work remains unverified.
2. Added `scripts/v2-quality-gates.test.mjs`, `scripts/performance-budget.mjs`, `scripts/static-preview-server.mjs`, `tests/v2-visual.spec.mjs` and `playwright.v2.config.mjs`.
3. Accessibility changes: Page Studio project tabs support Arrow/Home/End and roving focus; public widgets have visible focus; motion/semantic/static checks pass.
4. Security changes: legacy share expiry/revoke/audit/rate limit/log suppression/privacy headers/redacted DTO; modern Review Workspace remains the recommended path. Confidential binary review remains blocked without private storage.
5. Portability changes: WordPress handoff v2 exports enabled clean content, semantic design tokens, media manifest and migration notes; editor state, animation data and custom JS are excluded.
6. Documentation added: Creative Lab admin/roadmap, WordPress migration, operations/release, verification report.
7. Tests: quality 4/4, Page Studio 49/49, frontend 21/21, performance budget (424,033 measured bytes) and TypeScript build pass. Playwright visual execution was attempted but local Chromium/WebKit binaries are absent.
8. Exact next action: execute Phase 8 consolidated Prisma/build/regression/data-safety checks, reconcile docs and blockers, then commit/push `codex/v2-preview-2026-11-01` once and test Vercel Preview. Do not push main or apply migrations locally.

## P7-001/P7-002 checkpoint — 2026-11-02

1. SEO discovery and Creative Lab analytics are code-level `COMPLETED`, not `VERIFIED`.
2. Affected files: `src/app.ts`, `src/routes/analytics.ts`, `portfolio/analytics.js`, `portfolio/creative-lab.js`, `portfolio/creative-lab-components.js`, `portfolio/creative-tool.js`, `scripts/creative-lab-discovery-analytics.test.mjs`, `package.json`, four recovery files.
3. Published/indexable tools/services enter sitemap; llms.txt includes public projects/articles/tools. Demo/review routes stay noindex.
4. Tool and recruiter analytics taxonomy is accepted/exported while existing DNT/GPC, local, admin and bot privacy guards remain.
5. Validation: combined suite 3/3, JavaScript syntax, TypeScript build and diff check pass. Runtime crawler/reporting/browser evidence pending.
6. Next exact action: complete P7-003–P7-007 quality/security/performance/export work, then Phase 8; do not stop at phase boundary.

## Phase 6 code gate — 2026-11-02

1. P6-001 through P6-006 are code-level `COMPLETED`, not `VERIFIED`; P3-007 safe DB-backed acceptance remains unresolved.
2. P6-006 adds migration `0025_review_workspaces`, review schema, admin APIs, public session/comment/decision APIs and `/creative-review.html`.
3. Security properties: raw tokens stored hash-only; 1–30 day expiry; scoped comment/decision permissions; revoke/close; strict HttpOnly cookie; fragment removal; public-safe DTOs; immutable versions/decisions; origin/rate-limit/noindex/no-store/referrer/CSP; audit events.
4. Only existing public Media assets are allowed. Confidential binary delivery is still blocked without private storage and signed authenticated delivery.
5. Validation: Prisma generation, security 4/4, prototype 3/3, JavaScript syntax, TypeScript build and diff check pass. Migration/runtime/browser/RBAC remain unverified.
6. Next exact action: implement P7-001 SEO/GEO integration and continue through all dependency-ready Phase 7/8 tasks, then consolidated validation and one preview-branch push/test.

## P6-005 code checkpoint — 2026-11-02

1. Phase 6 remains active; P6-005 is `COMPLETED`, not `VERIFIED`.
2. `listing-audit-engine.js` supplies eight bounded criteria, normalized human statuses, attached evidence notes, factual counts and local JSON/text output. F05 provides the accessible editor.
3. Files: `portfolio/listing-audit-engine.js`, `portfolio/creative-tool.html`, `portfolio/creative-tool.js`, `portfolio/creative-lab.css`, `scripts/audit-demo.test.mjs`, and all four recovery records.
4. Focused checks 4/4, JavaScript syntax, TypeScript build and diff check pass. Browser/export/responsive and P3-007 DB-backed acceptance remain pending.
5. High-specialist P6-006 audit found existing `/share` unsafe to reuse directly. Implement an isolated review domain with hashed expiring scoped tokens, redacted DTOs, immutable versions/decisions, origin/rate-limit/security headers and public-safe existing Media only.
6. Confidential review uploads remain blocked until private object storage/signed authenticated delivery exists.
7. Next exact action: implement the public-safe P6-006 review MVP, then continue directly through Phases 7–8 before one consolidated preview push/test.

## P6-004 code checkpoint — 2026-11-02

1. Phase 6 remains active; do not stop at the phase boundary.
2. P6-004 is `COMPLETED`, not `VERIFIED`. `creative-brief-engine.js` sanitizes/bounds input, creates clarification questions/readiness and local JSON/text output; F04 provides the editor and preview.
3. Files: `portfolio/creative-brief-engine.js`, `portfolio/creative-tool.html`, `portfolio/creative-tool.js`, `portfolio/creative-lab.css`, `scripts/brief-demo.test.mjs`, and four recovery records.
4. Focused checks 4/4, JavaScript syntax and TypeScript build pass. Browser/export/responsive and DB-backed P3-007 acceptance remain pending.
5. Next exact action: implement P6-005 Listing Visual Audit engine, then P6-006 per high-specialist security review; continue through Phases 7–8 before one preview push/test.

## P6-003 code checkpoint — 2026-11-02

1. Active phase: Phase 6 — Flagship Tool Functional Activation.
2. Last task: P6-003 A+ Creative Planner is `COMPLETED`, not `VERIFIED`; P6-001/P6-002 remain code-complete.
3. Exact implementation: `creative-planner-engine.js` sanitizes/bounds inputs, creates deterministic listing/A+ role maps, attaches available assets, records evidence, flags exact cross-lane repetition and generates local JSON/text exports. F03 supplies the accessible form and responsive board.
4. Files added/modified for P6-003: `portfolio/creative-planner-engine.js`, `portfolio/creative-tool.html`, `portfolio/creative-tool.js`, `portfolio/creative-lab.css`, `scripts/planner-demo.test.mjs`, plus the four recovery records.
5. Validation: P6-003 4/4; P6-002 5/5; P6-001 6/6; Phase 2 gate 4/4; JavaScript syntax, TypeScript build and diff check pass.
6. Still required: browser export and desktop/mobile visual checks plus P3-007 DB-backed persistence/public acceptance. No remote save/publish has been added or claimed.
7. Exact next action: implement P6-004 Smart Creative Brief Builder as a bounded local validation/clarification/export workflow, preserving its no-delivery/no-consent/no-durable-save boundary.
8. Branch is `codex/v2-preview-2026-11-01`; push only after the authorized batch is complete, then run one consolidated gate and Vercel Preview test against the separate Preview database.

## P6-002 code checkpoint — 2026-11-02

1. Current active phase: Phase 6 — Flagship Tool Functional Activation.
2. Last meaningful task: P6-002 Text Readability & Contrast Analyzer is `COMPLETED`, not `VERIFIED`; P6-001 is also code-complete.
3. Exact implementation: `contrast-analyzer-engine.js` provides six-digit color parsing, WCAG relative-luminance ratio, normal/large-text thresholds, bounded local-image validation, deterministic pixel sampling and limitation-bearing report output. Canonical F02 exposes editable colors, size, weight, scale, local image sampler and download.
4. Files added/modified for P6-002: `portfolio/contrast-analyzer-engine.js`, `portfolio/creative-tool.html`, `portfolio/creative-tool.js`, `portfolio/creative-lab.css`, `scripts/contrast-demo.test.mjs`, plus all four recovery records.
5. Tests: P6-002 5/5, Phase 2 gate 4/4, both JavaScript syntax checks, TypeScript build and `git diff --check` pass. P6-001 regressions remained 6/6 earlier in this checkpoint.
6. Still required: browser file/pixel/download/desktop/mobile review and DB-backed P3-007 acceptance. Do not promote either task to `VERIFIED` without this evidence.
7. Exact next action: implement P6-003 A+ Creative Planner as a local structured plan builder/exporter with bounded inputs, distinct listing/A+ roles and explicit evidence/current-requirement review gates.
8. Branch remains `codex/v2-preview-2026-11-01`; do not push until the user-authorized batch is complete, then run one consolidated gate, push once and test Vercel Preview with its separate Preview database.

## P6-001 code checkpoint — 2026-11-02

1. Current active phase: Phase 6 — Flagship Tool Functional Activation.
2. Last meaningful task: P6-001 Amazon Thumbnail Readability Tester is `COMPLETED`, not `VERIFIED`.
3. Exact implementation state: canonical F01 now uses `thumbnail-readability-engine.js` for bounded file/dimension validation, deterministic luminance-spread and edge-density observations, preview upscaling facts and a method-bearing local report. The UI shows 80/120/160 px previews and four human checks; it has no composite score.
4. Files created/modified for P6-001: `portfolio/thumbnail-readability-engine.js`, `portfolio/creative-tool.html`, `portfolio/creative-tool.js`, `scripts/thumbnail-demo.test.mjs`, plus the four `.codex` records. Shared Phase 5 changes remain uncommitted in the same authorized batch.
5. Safety: PNG/JPEG/WebP only, 12 MB, 12,000 px and 40 MP limits; invalid/decode-failed replacements revoke object URLs and clear stale results. No input is uploaded or persisted.
6. Tests executed: P6-001 6/6, Creative Tool detail 3/3, Phase 2 aggregate 4/4, both JavaScript syntax checks, TypeScript build and `git diff --check` pass.
7. Still required: real browser upload/download and desktop/mobile visual checks; DB-backed P3-007 acceptance. These are not claimed verified.
8. Exact next action: implement P6-002 Text Readability & Contrast Analyzer as the next dependency-ready Phase 6 code task, retaining honest limitations and avoiding a fake full-image accessibility/compliance score.
9. Branch remains `codex/v2-preview-2026-11-01`. Do not push yet; after the authorized implementation batch is complete, consolidate tests, push this preview branch once and test the Vercel Preview deployment against its separate Preview database.

## Phase 5 code gate — 2026-11-02

1. P5-001, P5-002, P5-003, P5-004 and P5-006 are code-level `COMPLETED`, not `VERIFIED`.
2. P5-004 now provides editable local brand tokens, safe system-font presets, consistent live preview, versioned JSON download and print output without persistence or network transfer.
3. P5-005 is `BLOCKED`: the existing safe presentation foundation passes tests but requires at least two real complete public case studies from P4-003. Do not substitute fictional projects or enable the public route prematurely.
4. Consolidated checks pass: M01 4/4, M02 4/4, M03 4/4, M04 4/4, M06 3/3, aggregate mini tools 4/4, presentation 5/5, JavaScript syntax, TypeScript build and diff check.
5. Browser file/clipboard/download/print workflows, desktop/mobile visuals and DB-backed acceptance remain unverified.
6. Exact next action: audit P6-001 and the shared flagship demo architecture, then implement only an independent bounded engine path that does not require unsafe database mutation. Preserve P3-007 as a release/verification blocker.
7. Do not push until the authorized implementation batch is complete; then push the preview branch once and test the Vercel Preview deployment against its separate Preview database.

## Latest recovery checkpoint — 2026-11-02 (P5-003 complete)

1. Active phase: Phase 5 — Six mini-tool engines. Phase 4 evidence blockers and P3-007 DB verification remain preserved.
2. Last meaningful task: P5-003 Visual Brief to PDF is `COMPLETED`, not `VERIFIED`.
3. Exact state: canonical M03 has bounded editable title/brand/objective/deliverables/timeline, optional local-only logo, accent and section visibility, accessible live preview, reset and browser print/Save-as-PDF. No input is transmitted or persisted.
4. Modified files: `portfolio/creative-tool-mini-demos.js`, `portfolio/creative-lab.css`, `scripts/visual-brief-pdf-engine.test.mjs`, `scripts/mini-tool-demos.test.mjs`, `package.json`, and all four `.codex` recovery files.
5. Tests run: M03 focused 4/4, aggregate mini-tool 4/4, JavaScript syntax, TypeScript build and `git diff --check` pass.
6. Still required: actual browser print/PDF validation, desktop/mobile visual review, accessibility interaction review and safe DB-backed P3-007 acceptance.
7. Known limitation: browser print output depends on the user's installed print/PDF engine; no custom font is embedded into a binary PDF.
8. Next exact action: implement P5-004 Brand Asset Kit Generator on the existing M04 route with bounded editable tokens, documented system-font choices, logo-usage/imagery guidance and local printable/exportable output. Do not claim licensed proprietary assets or fonts.
9. Branch remains `codex/v2-preview-2026-11-01`. Do not push until the user-authorized implementation batch is complete; then push once and test the Preview deployment.

## Preview runtime fix — 2026-11-01

- Vercel Preview returned `500 FUNCTION_INVOCATION_FAILED` after branch deployment.
- The startup environment guard was adjusted so an isolated Preview can run without sharing production Blob storage. Production still requires Blob; Preview still requires its separate `DATABASE_URL` and a secure 32+ character `JWT_SECRET`.
- Next action: build, commit and push this fix to `codex/v2-preview-2026-11-01`, then verify the redeployment. If 500 remains, inspect the first Function Log line; the most likely remaining configuration is a missing/short Preview-scoped `JWT_SECRET` or unreachable Preview `DATABASE_URL`.

## Latest preview deployment checkpoint — 2026-11-01

1. Canonical project root: `D:/Web Works/search-hub/.portfolio-codex-work`; source, `.git`, `AGENTS.md`, `.codex/*` and `docs/MAHMUD_CODEX_MASTER_IMPLEMENTATION_INSTRUCTIONS_V2.md` are colocated here.
2. Purpose of this checkpoint: publish the current partial implementation to a non-main preview branch for owner visual review. It does not complete or verify unfinished roadmap tasks.
3. Validation completed before branch packaging: `npm.cmd run build` plus eight focused suites passed (33/33 checks).
4. Database state: no local migration was executed. Vercel Preview must use the separately configured Preview database; production database/storage mutation remains prohibited.
5. Exact next action after preview review: reconcile owner feedback against the current `IN_PROGRESS` Phase 5 work, preserve Phase 4 evidence blockers, and continue the first dependency-ready unfinished task. Merge to `main` only after explicit owner approval.

Updated: 2026-11-01 (Asia/Dhaka)

## Latest recovery checkpoint — Phase 5 local engines (P5-001, P5-002 and P5-006)

This is the authoritative resume point and supersedes older current-task statements below.

1. Last `VERIFIED` task remains `P1-005`; later work has focused/static evidence but lacks safe DB-backed acceptance.
2. Current task: `P5-002 Product Background Inspector` — `IN_PROGRESS`; P5-001 and P5-006 are also `IN_PROGRESS` pending batch verification.
3. Exact state: M01 provides bounded local dimensions/ratio/presets/safe-zone/export; M02 provides bounded local downsampling plus near-white border, edge-contact and transparency observations; M06 provides local custom checks/progress/copy/print/reset. None transmits user input.
4. Files added/modified in the latest Phase 5 steps: `portfolio/creative-tool-mini-demos.js`, `portfolio/creative-lab.css`, shared mini-tool tests, three focused engine test files, `package.json`, and the four `.codex` progress records.
5. Tests authored but not yet executed: `test:image-safe-zone-engine`, `test:background-inspector-engine`, `test:design-handoff-engine` and updated `test:mini-tool-demos`. This deferral is intentional under the user’s implementation-first/Phase-batch validation instruction.
6. Still required for P5-001/P5-002/P5-006: JavaScript syntax, focused/regression tests, desktop/mobile browser checks and P3-007 DB-backed acceptance. Do not mark them complete before these are checked.
7. Prior Phase 4 state is preserved: P4-003 lacks verified project evidence; P4-005 remains default OFF; P4-006 remains draft-only. P3-007 still lacks a safe non-production PostgreSQL target. Production mutation is prohibited.
8. Next exact action: implement P5-003 Visual Brief to PDF on the existing M03 route, then continue the remaining Phase 5 engines, keeping each unverified task `IN_PROGRESS` until the consolidated checkpoint.
9. No commit, push or deployment was performed.

## Recovery checkpoint — 2026-11-01

This section supersedes every older current-task/next-action statement below. Preserve the historical record, but resume from here.

### Last verified task and current phase

- Last task marked `VERIFIED`: `P1-005 Case-study content contract`. Later work is code-complete with focused/static evidence but awaits safe DB-backed acceptance.
- Active phase: **Phase 4 — Portfolio, recruiter and client conversion experiences**.
- `P4-001`, `P4-002`, `P4-004` and `P4-007` are code-level `COMPLETED`, not `VERIFIED`.
- `P4-003` is `BLOCKED`: 4–6 real selected projects still need confirmed role, challenge, process, deliverables, honest outcome and media. The code-level privacy, schedule and readiness foundation is complete.
- `P4-005` is `IN_PROGRESS`: its shared, default-OFF recruiter/client presentation engine is implemented and passes focused checks, but it must not be claimed complete or enabled while P4-003 evidence is missing. `P4-006` also requires actually verified Page Studio evidence.
- `P3-007` remains blocked on a safe non-production PostgreSQL target; production mutation is prohibited.

### Latest implementation state

- Added strict canonical Studio service registry and public API for `/services/amazon-ecommerce`, `/services/brand-systems` and `/services/digital-experiences`.
- Added `/services/amazon-creative` 301 compatibility alias and `/services` redirect to the canonical Studio services section.
- Service pages reuse `aboutConfig.studioConfig` services/process/CTAs and eligible published Project records. No new model or parallel CMS exists.
- Added one responsive service shell and safe renderer. No fake testimonials, clients, metrics or outcomes are introduced; missing proof collapses honestly.
- Added bounded inquiry `intent` (`GENERAL`, `CLIENT`, `RECRUITER`) and source-path tags, same-origin contact routing, service preselection and privacy-safe analytics contexts/aggregate intent export.
- Added commercial case-study public DTO redaction, schedule gates, `llms.txt` eligibility gates, featured-project publish readiness and a matching Project CMS readiness panel.
- Added default-OFF `/hire/presentation` and `/studio/presentation` routes, strict public presentation API, shared eight-step renderer, keyboard/pause/reduced-motion behavior, CMS editor and privacy-safe analytics. No draft/private project can be substituted.

### Files created or modified in the latest checkpoint

- `src/lib/studio.ts`
- `src/lib/public-project.ts`
- `src/lib/publish-safety.ts`
- `src/routes/public.ts`
- `src/routes/analytics.ts`
- `src/app.ts`
- `portfolio/service.html`
- `portfolio/service.js`
- `portfolio/inquiry-routing.js`
- `portfolio/experience-pages.css`
- `portfolio/index.html`
- `portfolio/analytics.js`
- `portfolio/admin-studio-mode.js`
- `portfolio/admin-case-study.js`
- `portfolio/admin-case-study.css`
- `portfolio/admin-addendum.js`
- `scripts/commercial-case-study.test.mjs`
- `scripts/service-pages.test.mjs`
- `scripts/inquiry-segmentation.test.mjs`
- `package.json`
- `src/lib/presentation.ts`
- `portfolio/presentation.html`
- `portfolio/presentation.css`
- `portfolio/presentation.js`
- `portfolio/admin-presentation-mode.js`
- `portfolio/admin-presentation-mode.css`
- `scripts/presentation-mode.test.mjs`
- the four existing `.codex` progress files

### Consolidated verification

- `npm.cmd run test:commercial-case-study` — 4/4 passed.
- `npm.cmd run test:service-pages` — 5/5 passed.
- `npm.cmd run test:inquiry-segmentation` — 5/5 passed.
- `npm.cmd run test:recruiter-mode` — 5/5 passed.
- `npm.cmd run test:studio-mode` — 5/5 passed.
- `npm.cmd run build` — passed.
- `npm.cmd run test:presentation-mode` — 5/5 passed.
- `node --check portfolio/presentation.js` and `node --check portfolio/admin-presentation-mode.js` — passed.
- Not verified: authenticated CMS saves, public DB projections, real inquiry/analytics roundtrip and browser visual checks for the three service routes.

### Exact next action

1. Do not restart any Phase 0–4 implementation already recorded above.
2. Obtain/confirm 4–6 real project evidence records before completing P4-003 or enabling/completing P4-005; never fabricate missing client facts or results. Live read-only audit found six public records, but all lacked `results`/verified metrics and several are demo/placeholder records.
3. Obtain a safe non-production PostgreSQL URL/session before P3-007 or DB-backed acceptance. Do not point automated mutation tests at production.
4. When those blockers are unavailable, only continue a later task if the checklist dependency is genuinely satisfied; record the dependency exception if the user explicitly changes the roadmap.
5. No commit, push or deployment has been performed; the user requested one consolidated release only after all intended phases are ready.

## Recovery checkpoint — 2026-10-30

This checkpoint supersedes older current-task and next-action wording later in this historical handoff. Preserve the historical record; use this section first.

### Last verified completed task

- `P1-005 Case-study content contract` remains the last task marked `VERIFIED`. Later Phase 2/3 work is code-complete but still awaits DB-backed verification.

### Current task and exact state

- Active phase: **Phase 4 — Portfolio, recruiter and client conversion experiences**.
- Active task: **P4-001 Recruiter Mode — IN_PROGRESS**.
- `P3-007` remains separately `BLOCKED` because no `.env`/`TEST_DATABASE_URL`, local PostgreSQL client or Docker-backed safe non-production target exists. Production mutation is prohibited.
- Partial P4-001 code provides a bounded recruiter config/parser, published-only `/api/public/recruiter` projection, conditional real-CV/contact fallback, English `/hire` structure, selected published work, evidence pillars, verified experience and responsive styling.
- Public filtering currently requires published/public/non-client/schedule-eligible projects, verified experience entries, and evidence backed by eligible published project/tool references.
- The task is not complete or verified: TypeScript build fails, one legacy route assertion is stale, friendly CMS controls/server-validated save are incomplete, and DB/browser verification has not run.

### P4-001 files created or modified

- `src/lib/recruiter.ts` — new bounded recruiter configuration/parser.
- `src/routes/public.ts` — partial recruiter API; contains the current TypeScript error.
- `portfolio/hire.html` — reworked recruiter page structure.
- `portfolio/hire.js` — new public recruiter renderer.
- `portfolio/experience-pages.css` — recruiter layouts/responsive styles.
- `scripts/recruiter-mode.test.mjs` — focused static/contract tests.
- `package.json` — recruiter test script plus prior V2 scripts.

### Tests and known issues

- `npm.cmd run test:recruiter-mode` — 3/3 passed.
- `npm.cmd run test:frontend` — 21/21 passed.
- `npm.cmd run test:v2-routes` — 2/3 passed. The failure expects a static `/api/public/cv` link in `hire.html`; intended safe behavior inserts it only when a real `aboutConfig.cvUrl` exists.
- `npm.cmd run build` — failed at `src/routes/public.ts(40,165)` with `TS18047: 'item' is possibly 'null'`. Do not report the worktree as build-clean.
- Recruiter fields can currently be represented under `aboutConfig.recruiterConfig`, but no dedicated friendly visual editor/server-validated recruiter save exists yet.
- `/api/public/recruiter` and `/hire` still need DB-backed browser checks at 360/768/1280 widths, keyboard/accessibility checks, real/empty CV states and indexability review.

### Visual preview checkpoint

- A safe static preview is running at `http://127.0.0.1:8799/` from `portfolio/`, bound only to `127.0.0.1` (PID 28352).
- Homepage and `/hire.html` shells were browser-checked at 1440x900 and 390x844. Both loaded without horizontal overflow or broken images at those viewports.
- All 18 static HTML surfaces were opened at 1280x800 and 390x844. This confirms presentation shells load, not that their APIs, authentication, persistence, publishing, tokens, redirects or database content work.
- Recruiter data sections stayed hidden in the static preview because `/api/public/recruiter` is unavailable. Real CV/contact switching and production `/hire` remain `NOT VERIFIED`.
- Stop the preview with `Stop-Process -Id 28352` if that PID still belongs to the local Python server. Restart from the repository root with `python -m http.server 8799 --bind 127.0.0.1 --directory portfolio`.
- Do not substitute this static preview for full Express/PostgreSQL verification. The permanent visual-review evidence rules now live in `AGENTS.md`.

### Exact next implementation step

1. Resume P4-001 without restarting it. Fix the nullable Creative Tool projection in `src/routes/public.ts` without weakening published-status filtering.
2. Reconcile the V2 route test with conditional real-file CV behavior; rerun recruiter, V2 route and frontend suites.
3. Add a friendly Recruiter Mode editor using the existing `aboutConfig.recruiterConfig` source of truth and server-side schema validation; do not create a second CMS/model.
4. Rerun build and diff checks. Perform DB/browser verification only against a safe target, then decide whether P4-001 satisfies completion criteria.
5. Do not start P4-002 while P4-001 remains in this state.

### Resume commands

```powershell
Set-Location 'D:\Web Works\search-hub\.portfolio-codex-work'
git status --short
Get-Content 'C:\Users\USER\Downloads\MAHMUD_CODEX_MASTER_IMPLEMENTATION_INSTRUCTIONS_V2.md'
Get-Content AGENTS.md
Get-Content .codex\IMPLEMENTATION_CHECKLIST.md
Get-Content .codex\PROJECT_PROGRESS.md
Get-Content .codex\SESSION_HANDOFF.md
Get-Content .codex\IMPLEMENTATION_LOG.md
```

## 1. Last verified completed task

`P1-005 Case-study content contract` is the last verified task. `P1-004` is completed but awaits runtime HTTP verification.

## 2. Current task

`P4-001 Recruiter Mode`; P3-007 is blocked on a safe database target.

## 3. Exact implementation state

- The full V2 master specification was read and hashed.
- The canonical repository was audited at `main` commit `3f3fa90`.
- Project-scoped Codex configuration and two custom agents were added.
- Root `AGENTS.md` now defines resume, routing, safety and verification rules.
- Four mandatory progress files and an implementation audit were created.
- Build and all selected baseline suites pass (85 automated checks plus static smoke).
- Installed Codex CLI recognizes both project-scoped custom agents and their configured effort.
- No V2 public feature, database migration or production route has been implemented yet; Phase 1 architecture work is starting.
- `docs/v2-route-domain-contract.md` now fixes the route, API, RBAC, snapshot, link, seed and acceptance contracts.
- Reusable scoped Creative Lab components now provide safe CTA resolution, status badges, cards, empty states and responsive styling. They are foundation code and are not yet linked from a public route.
- `/hire` and `/studio` are explicit SEO-rendered routes registered before the Page Studio catch-all. Their responsive pages use honest positioning copy and existing work/CV/contact destinations.
- `creative-lab`, `services`, `hire`, `studio` and `resources` are reserved from custom Page Studio paths.
- `docs/v2-case-study-contract.md` now fixes Project as the sole case-study source of truth, maps existing fields, and defines commercial/technical publication, privacy, RBAC, metric-integrity and Page Studio reference rules.
- The case-study contract has focused automated coverage (4/4 passing); no parallel CaseStudy model or destructive migration is required.
- P2-001 adds one nullable-canonical-ID `CreativeTool` model, five bounded enums and migration `0024_creative_lab_catalog`; no existing table or record is altered.
- `canonicalId` is unique for seeded F01–F06/M01–M06 records and null for owner-created tools. A migration-only check prevents custom records from impersonating canonical seeds.
- P2-001 static safety tests, Prisma validation/generation and TypeScript build pass. Populated-database apply remains unverified.
- P2-002 adds an explicit transactional seed command and one canonical fixture for F01–F06/M01–M06. The update branch touches only seed metadata, so owner edits are preserved.
- Seed contract tests pass 4/4; real PostgreSQL migration plus two seed runs remain pending.
- P2-003 adds a strict public snapshot DTO, public search/filter API, explicit `/creative-lab` route and responsive catalog with loading/empty/error states.
- Reusable cards now consume the snapshot action descriptor, so published CTA labels and targets are respected without exposing draft/live-verification fields.
- P2-004 adds strict detail API delivery, explicit detail/demo SEO routes and one responsive data-driven detail/demo shell. Demo pages are noindex and honest about concept limitations.
- P2-005 adds an F01-only sample image comparison at 80/120/160 pixels with three visual backgrounds, native keyboard controls and explicit no-upload/OCR/scoring/compliance language.
- P2-006 adds three fixed readability/contrast states and 100/75/50% scale controls with explicit no-upload/OCR/full-image-WCAG-certification language.
- P2-007 adds an F03 fictional portable-blender plan with distinct listing-image and A+ lanes, audience/module-count controls and a marketplace-policy verification checkpoint.
- P2-008 adds a bounded F04 guided sample form whose preview updates with textContent only and never submits, persists, emails or claims AI generation.
- P2-009 adds an F05 fictional visual audit with six authored findings, explainable pass/review filters and explicit no-upload/computer-vision/compliance-decision language.
- P2-010 adds an F06 local-only version/review prototype with authored comments, local decisions and explicit production authentication/storage/audit requirements.
- P2-011 adds a separate mini-demo renderer for M01–M06 with safe-zone, background, print-preview, brand-kit, presentation and handoff-checklist interactions; none uploads, saves, exports or calls a backend.
- P2-012 adds a hidden-first homepage Creative Lab teaser backed by existing HomepageSection configuration and the canonical published CreativeTool API. Admin can edit bounded presentation copy, CTA and a 1–6 card limit; cards are never duplicated. Homepage Studio recognizes and reorders the canonical section.
- Homepage teaser 4/4, catalog 3/3, Page Studio 49/49, operations 7/7, frontend 21/21 and TypeScript build pass after P2-012.
- P2-013 adds an aggregate Phase 2 gate covering all 12 canonical tools, public routing/visibility, honest live fallback, keyboard/mobile semantics and every individualized demo. The aggregate gate and all focused Phase 2 suites pass.
- P3-001 adds a read-only `/api/admin/creative-tools` list behind the existing active-user RBAC middleware. ADMIN, EDITOR and VIEWER can inspect it; WRITER and MODERATOR remain denied.
- The Creative Lab admin workspace is injected idempotently into the existing sidebar/tab runtime and includes bounded search, kind/status/visibility/display/category filters, fixed ordering, pagination, loading/empty/error states and responsive layouts.
- The list response excludes page blocks, galleries, narrative arrays and published snapshots. It exposes only lightweight status/readiness metadata and is `private, no-store`.
- P3-001 focused 3/3, frontend 21/21, Phase 2 aggregate 4/4, catalog 3/3, schema 3/3, syntax and TypeScript build pass. DB-backed authenticated browser verification remains pending.
- P3-002 adds strict Creative Tool draft schemas, safe detail DTOs, authenticated detail loading and ADMIN/EDITOR-only optimistic-lock PATCH saves. Missing/stale versions and duplicate slugs return friendly 428/409 errors.
- P3-002 never accepts publish identity, snapshots, schedule, canonical seed identity, deletion fields or Page Studio blocks. A changed live URL clears prior verification and every successful draft save adds a `TOOL_DRAFT_UPDATED` activity entry.
- The Creative Lab manager now includes a responsive grouped editor for narratives, structured lists, media URLs, status/presentation, CTA and SEO fields. VIEWER sees no edit control and publish remains explicitly unavailable.
- P3-002 editor 3/3, manager 3/3, Phase 2 gate 4/4, frontend 21/21, catalog 3/3 and schema 3/3 pass; syntax, TypeScript build and diff check pass.
- P3-003 adds explicit ADMIN/EDITOR publish and unpublish endpoints, versioned `CREATIVE_TOOL_DRAFT` revisions, revision list/detail endpoints and a restore-to-draft endpoint. Every mutation requires `expectedUpdatedAt` and writes activity history inside the same transaction.
- Publishing validates and stores one bounded public snapshot; draft saves and revision restore never mutate the existing live snapshot. Unpublish removes public eligibility while retaining the last snapshot. Published slug changes are intentionally blocked with `SLUG_REDIRECT_REQUIRED` until P3-005.
- The Creative Lab editor now separates Save Draft, Publish, Unpublish and Revisions, shows readiness issues, and makes restore confirmation explicitly state that live content remains unchanged.
- P3-003 focused publication 4/4, editor 3/3 and manager 3/3 tests pass. Phase 2 gate 4/4, frontend 21/21, catalog 3/3, schema 3/3, Creative Lab foundation 5/5 and publish safety 3/3 regressions pass; JavaScript syntax, TypeScript build and diff check pass.
- P3-004 adds an editor-local Media Library picker for cover, gallery and social images. It reads existing authenticated media records and never uploads or duplicates Blob objects.
- P3-004 adds explicit saved-live-URL verification. It accepts only public HTTPS destinations, rejects any private/reserved DNS answer, pins the validated address per request, revalidates redirects, and bounds total time, bytes and redirect count.
- Verification requires the current saved URL plus `expectedUpdatedAt`, writes `liveUrlVerifiedAt` and activity history atomically, and remains separate from draft save. Changing the URL still clears prior verification.
- P3-004 focused 3/3, publishing 4/4, editor 3/3 and manager 3/3 tests pass. Phase 2 gate 4/4, frontend 21/21 and publish safety 3/3 regressions pass; JavaScript syntax, TypeScript build and diff check pass.
- P3-005 adds a focused Creative Tool redirect helper used only by explicit publish. Draft slug changes remain private and create no redirects.
- Publishing a changed slug atomically creates `/creative-lab/old` to `/creative-lab/new`, flattens older internal aliases to the newest canonical path, rejects path claims/manual conflicts/chains, and uses serializable transaction retry semantics.
- P3-005 redirect 4/4, publishing 4/4 and media/URL 3/3 tests pass. Phase 2 gate 4/4, frontend 21/21 and publish safety 3/3 regressions pass; TypeScript build and diff check pass.
- P3-006 adds Creative Tool catalog, single-card and CTA widgets to the existing Page Studio registry, inspector, server dynamic-data layer and public renderer.
- Tool blocks save only canonical IDs plus bounded filter/presentation options. Copy, media, status and actions resolve from eligible published snapshots; PUBLIC tools populate catalogs while PUBLIC/UNLISTED tools may be referenced directly.
- The production Widget QA fixture now covers all three widgets with in-memory sample snapshots and no database writes.
- P3-006 focused 3/3, Page Studio 49/49, Phase 2 gate 4/4 and frontend 21/21 pass; TypeScript build and diff check pass.
- No commit, push or deployment has been performed.

## 4. Files created or modified

- `.codex/config.toml`
- `.codex/agents/medium_worker.toml`
- `.codex/agents/high_specialist.toml`
- `.codex/IMPLEMENTATION_CHECKLIST.md`
- `.codex/PROJECT_PROGRESS.md`
- `.codex/SESSION_HANDOFF.md`
- `.codex/IMPLEMENTATION_LOG.md`
- `AGENTS.md`
- `docs/implementation-audit.md`
- `docs/v2-route-domain-contract.md`
- `portfolio/creative-lab-components.js`
- `portfolio/creative-lab.css`
- `scripts/creative-lab-foundation.test.mjs`
- `package.json`
- `src/app.ts`
- `src/lib/page-studio.ts`
- `portfolio/experience-pages.css`
- `portfolio/hire.html`
- `portfolio/studio.html`
- `scripts/v2-routes.test.mjs`
- `docs/v2-case-study-contract.md`
- `scripts/v2-case-study-contract.test.mjs`
- `prisma/schema.prisma`
- `prisma/migrations/0024_creative_lab_catalog/migration.sql`
- `scripts/creative-tool-schema.test.mjs`
- `scripts/creative-tools-catalog.mjs`
- `scripts/seed-creative-tools.mjs`
- `scripts/creative-tool-seed.test.mjs`
- `src/lib/creative-tools.ts`
- `src/routes/public.ts`
- `portfolio/creative-lab.html`
- `portfolio/creative-lab.js`
- `scripts/creative-lab-catalog.test.mjs`
- `portfolio/creative-tool.html`
- `portfolio/creative-tool.js`
- `scripts/creative-tool-detail.test.mjs`
- `scripts/thumbnail-demo.test.mjs`
- `scripts/contrast-demo.test.mjs`
- `scripts/planner-demo.test.mjs`
- `scripts/brief-demo.test.mjs`
- `scripts/audit-demo.test.mjs`
- `scripts/review-demo.test.mjs`
- `portfolio/creative-tool-mini-demos.js`
- `scripts/mini-tool-demos.test.mjs`
- `src/routes/creative-tools-admin.ts`
- `src/lib/rbac.ts`
- `portfolio/admin-creative-tools.js`
- `portfolio/admin-creative-tools.css`
- `portfolio/admin-page-studio.js`
- `scripts/creative-tool-manager.test.mjs`
- `src/lib/creative-tools-admin.ts`
- `scripts/creative-tool-editor.test.mjs`
- `scripts/creative-tool-publishing.test.mjs`
- `src/lib/revisions.ts`
- `src/lib/public-url-verification.ts`
- `scripts/creative-tool-media-url.test.mjs`
- `src/lib/creative-tool-redirect.ts`
- `scripts/creative-tool-redirect.test.mjs`
- `src/lib/page-studio-creative-tools.ts`
- `portfolio/page-studio-renderer.js`
- `portfolio/page-studio-public.css`
- `portfolio/page-studio.js`
- `portfolio/widget-qa.js`
- `scripts/page-studio-creative-tools.test.mjs`

## 5. Unfinished changes

- Complete P3-007 authenticated end-to-end CMS verification across the role matrix, publication transitions, reorder and Page Studio public rendering.
- Apply migration 0024 on a reachable populated PostgreSQL target/copy before marking P2-001 VERIFIED.
- Runtime-verify P1-004 when a reachable database lets the application server listen.

## 6. Tests executed

- `npm.cmd run build` — passed.
- Frontend 21/21, Page Studio 49/49, operations 7/7, slider 5/5 and publish-safety 3/3 passed.
- Static smoke passed all five checks.
- Python TOML parsing passed.
- Codex CLI 0.164.0 strict read-only recognition returned `medium_worker — medium` and `high_specialist — high`.
- Creative Lab foundation tests passed 4/4 and the TypeScript build remained green.
- V2 route tests passed 3/3; Creative Lab tests still pass 4/4; TypeScript build passes.
- V2 case-study contract tests passed 4/4.
- CreativeTool schema/migration contract tests passed 3/3.
- Prisma schema validation and client generation passed; TypeScript build passed after generation.
- CreativeTool seed contract tests passed 4/4; `git diff --check` passed.
- Creative Lab catalog tests passed 3/3, foundation/action tests passed 5/5, and build passed.
- Creative Tool detail/demo route tests passed 3/3 and build passed.
- Thumbnail demo tests passed 3/3; detail 3/3, catalog 3/3 and foundation 5/5 regressions pass; build and `git diff --check` pass.
- Contrast demo tests passed 3/3; thumbnail 3/3 and detail-route 3/3 regressions pass; build passes.
- Planner demo tests passed 3/3; F01/F02 regressions and build pass.
- Brief demo tests passed 3/3; planner and detail-route regressions and build pass.
- Audit demo tests passed 3/3; brief and foundation regressions and build pass.
- Review demo tests passed 3/3; audit and detail-route regressions and build pass.
- Mini-tool demo tests passed 4/4; F06 and detail-route regressions and build pass.
- Creative Tool Manager tests passed 3/3; frontend 21/21, Phase 2 aggregate 4/4, catalog 3/3 and schema 3/3 regressions pass; JavaScript syntax, TypeScript build and diff check pass.
- Creative Tool editor tests passed 3/3; manager 3/3, Phase 2 aggregate 4/4, frontend 21/21, catalog 3/3 and schema 3/3 regressions pass; JavaScript syntax, TypeScript build and diff check pass.
- Creative Tool publishing tests passed 4/4; editor 3/3 and manager 3/3 remain green after updating obsolete static assertions.
- Phase 2 aggregate 4/4, frontend 21/21, catalog 3/3, schema 3/3, Creative Lab foundation 5/5 and publish safety 3/3 pass after P3-003; JavaScript syntax, TypeScript build and diff check pass.
- Creative Tool media/URL tests passed 3/3; publishing 4/4, editor 3/3 and manager 3/3 remained green.
- Phase 2 aggregate 4/4, frontend 21/21 and publish safety 3/3 pass after P3-004; JavaScript syntax, TypeScript build and diff check pass.
- Creative Tool redirect tests passed 4/4; publishing 4/4 and media/URL 3/3 remained green.
- Phase 2 aggregate 4/4, frontend 21/21 and publish safety 3/3 pass after P3-005; TypeScript build and diff check pass.
- Page Studio Creative Tool block tests passed 3/3; Page Studio 49/49, Phase 2 aggregate 4/4 and frontend 21/21 passed after adding the QA fixtures; TypeScript build and diff check pass.

## 7. Tests still required

- Runtime HTTP verification for `/hire` and `/studio` with a reachable configured database.
- Browser/responsive verification when the first public Creative Lab page consumes the foundation components.
- DB-backed authenticated verification of Creative Tool CRUD, publish/unpublish, reorder, role denial and Page Studio tool rendering.

## 8. Errors or blockers

- No repository blocker. Codex Doctor separately reported restricted WebSocket/HTTP reachability and an old global `memories_1.sqlite` integrity warning; neither affected repository builds/tests or project-agent recognition.
- Local application startup waits for `db.$connect()`; under the restricted local network it did not listen within 10 seconds, so `/hire` and `/studio` HTTP rendering is not yet claimed as verified.
- P3-007 cannot safely execute: there is no `.env` or `TEST_DATABASE_URL`, and neither a local PostgreSQL client nor Docker is installed. Production mutation remains prohibited.

## 9. Next exact development action

1. Reconcile the existing test/runtime environment for a safe non-production PostgreSQL verification target; never mutate production data during automated verification.
2. Exercise ADMIN/EDITOR/VIEWER/denied-role access, optimistic draft edits, explicit publish/unpublish, revision restore, slug redirects and reorder behavior.
3. Create a draft Page Studio page containing catalog/card/CTA references, publish it, verify public snapshot rendering, then clean up only test-owned records.
4. Record any unreachable DB/browser checks honestly; promote P2/P3 tasks to VERIFIED only when acceptance criteria are observed.
5. When database connectivity is available, apply migration 0024, run the seed twice, and verify P2-001/P2-002/P3-001–P3-006 against real PostgreSQL.

## 10. Resume commands

```powershell
Set-Location 'D:\Web Works\search-hub\.portfolio-codex-work'
git status --short
Get-Content 'C:\Users\USER\Downloads\MAHMUD_CODEX_MASTER_IMPLEMENTATION_INSTRUCTIONS_V2.md'
Get-Content .codex\IMPLEMENTATION_CHECKLIST.md
Get-Content .codex\PROJECT_PROGRESS.md
Get-Content .codex\SESSION_HANDOFF.md
Get-Content .codex\IMPLEMENTATION_LOG.md
```

Always reconcile these notes with the actual repository before resuming.

## Phase 4 conversion checkpoint — 2026-10-30

1. Last completed tasks: P4-001 Recruiter Mode and P4-002 Client / Studio Mode are code-complete but not DB-verified.
2. Current task: P4-003 Commercial case studies (`IN_PROGRESS`).
3. Exact state: Recruiter and Studio use bounded configs, published-only projections and friendly sibling-preserving CMS editors. Studio includes honest services/process fallback content and never fabricates testimonials.
4. Latest files added/modified for P4-002: `src/lib/studio.ts`, `src/routes/public.ts`, `src/routes/maintenance.ts`, `src/lib/rbac.ts`, `portfolio/studio.html`, `portfolio/studio.js`, `portfolio/experience-pages.css`, `portfolio/admin-studio-mode.js`, `portfolio/admin-studio-mode.css`, `portfolio/admin-recruiter-mode.js`, `scripts/studio-mode.test.mjs`, `package.json`.
5. Latest verification: Studio 5/5, Recruiter 5/5, V2 routes 3/3, JavaScript syntax, TypeScript build and `git diff --check` pass. Static Studio browser checks passed at 1440x900 and 390x844 with no overflow; mobile menu open state was observed.
6. Still unverified: authenticated Studio/Recruiter save and role denial, DB-derived public projections, real selected projects/testimonials and full CMS editor visuals.
7. Known blocker: no safe non-production PostgreSQL/session target; do not mutate production for automated QA.
8. Next exact action: audit current Project schema/admin/public detail renderer against `docs/v2-case-study-contract.md`, then implement only the missing additive P4-003 fields/presentation and focused tests.
9. Workflow: complete and checkpoint each phase locally; run the comprehensive integration gate and perform one user-authorized push/deploy after the planned phases are complete.

## Latest UI checkpoint — 2026-10-30

- Fixed the homepage's no-database/no-settings sticky-navigation fallback in `portfolio/index.html` by defaulting the body to `nav-always-visible`.
- The existing runtime settings code remains able to turn sticky navigation off when the CMS explicitly requests it.
- `npm.cmd run test:frontend` passed 21/21.
- Browser verification passed at 1440x900 and 390x844 after downward scrolling: the public header stayed fixed at the top with no hide transform.
- P4-001 remains `IN_PROGRESS`. The nullable recruiter tool projection in `src/routes/public.ts` is now fixed and `npm.cmd run build` passes. Next exact action is to reconcile the conditional-CV regression contract and finish the friendly recruiter CMS editor before P4-002.
- The conditional-CV regression is also reconciled: `npm.cmd run test:v2-routes` and `npm.cmd run test:recruiter-mode` pass 3/3. The active implementation step is now the friendly recruiter CMS editor on the existing `aboutConfig.recruiterConfig` storage path.

## Recruiter CMS checkpoint — 2026-10-30

- Implemented the friendly editor in `portfolio/admin-recruiter-mode.js` and `portfolio/admin-recruiter-mode.css`; wired assets and settings-load synchronization through `portfolio/admin.html` and `portfolio/admin.js`.
- Added `/api/admin/maintenance/recruiter-profile` in `src/routes/maintenance.ts`, validated with the canonical recruiter schema and merged against current database About data. Added EDITOR write scope in `src/lib/rbac.ts`.
- Updated `src/lib/recruiter.ts` so public role title, headline and introduction cannot be saved blank through the canonical schema.
- Tests: recruiter 5/5, V2 routes 3/3, frontend 21/21, JavaScript syntax and TypeScript build all pass.
- Browser: static admin shell and both new assets load; authenticated editor visuals and persistence are not verified because no safe DB-backed local session exists.
- Exact next action: obtain/use a safe non-production PostgreSQL target, start the full Express app, verify ADMIN/EDITOR save plus VIEWER/WRITER/MODERATOR denial and sibling preservation, then visually verify `/admin…#homepage` and `/hire` at desktop/mobile. Do not begin P4-002 first.
- Verification environment evidence: no `.env`, `TEST_DATABASE_URL`, `DATABASE_URL`, Docker or local `psql` is available. Publish-safety regressions pass 3/3; do not substitute production credentials for the missing QA database.

## Preview seed recovery checkpoint — 2026-11-02

1. Last verified completed task: Preview runtime loads the public homepage, `/hire`, `/studio`, `/creative-lab` and `/admin.html`; public runtime APIs observed in Vercel logs return HTTP 200.
2. Current task: P8-001/P8-003 Preview verification, specifically activation of the canonical 12-tool Creative Lab catalog (`IN_PROGRESS`).
3. Exact implementation state: commit `0d3ebe0` deployed successfully, but Creative Lab shows zero tools. Source inspection proved the seed direct-execution guard is non-portable on Linux. The worktree now contains the portable `pathToFileURL(process.argv[1])` fix plus a regression test.
4. Files modified: `scripts/seed-creative-tools.mjs`, `scripts/creative-tool-seed.test.mjs`, `.codex/IMPLEMENTATION_CHECKLIST.md`, `.codex/PROJECT_PROGRESS.md`, `.codex/IMPLEMENTATION_LOG.md`, `.codex/SESSION_HANDOFF.md`.
5. Unfinished: commit/push the fix to the authorized Preview branch, wait for Vercel redeploy, confirm build seed output and exactly 12 public tools (6 flagship, 6 mini), then continue CMS/RBAC verification.
6. Tests executed: Creative Tool seed 6/6 passed; TypeScript typecheck passed.
7. Tests still required: fresh Preview deployment, public catalog/detail/demo browser checks, CMS login and role/persistence checks, Preview backup/restore drill.
8. Known issues: four historical `/uploads/portfolio/...` image paths return 404; missing local media is separate from the seed defect. Production/main remains unauthorized.
9. Next exact action: review diff, commit and push only the portable seed fix and recovery documentation to `codex/v2-preview-2026-11-01`, then inspect the resulting Vercel deployment.
10. Resume commands: `git status --short --branch`, `git diff --check`, `npm.cmd run test:creative-tool-seed`, `npm.cmd run typecheck`.

### Follow-up state

- Commit `5f3efbe` was pushed and Vercel deployment `B62G5aRKbExmoVehrPf9YJ1955bc` became Ready.
- Browser evidence confirms exactly 12 public tools and both 6-tool type filters.
- Representative detail rendering then exposed a missing `statusBadge` shared export. The worktree contains the fix in `portfolio/creative-lab-components.js`, its regression in `scripts/creative-tool-detail.test.mjs`, and updated recovery records.
- Current exact next action: commit/push this detail-route fix to the authorized Preview branch, wait for redeploy, re-open one detail and one demo route, then enter `/admin.html` for authenticated CMS/RBAC checks.

### Verified deployment state

- `14c0e3c` and cache-busting follow-up `945ed90` are pushed to `codex/v2-preview-2026-11-01` and both Vercel deployments are Ready.
- Stable Preview alias passes browser checks for 12 catalog tools, 6 flagship, 6 mini, the F01 detail page and its interactive demo.
- `/admin.html` currently shows the CMS sign-in form. Next exact action is user sign-in on the stable Preview CMS, followed by read-only/authenticated navigation and role-boundary checks. Never request or expose the password.
- Four historical `/uploads/portfolio/...` assets remain 404 and need a later media repair/migration decision.

## Preview release acceptance checkpoint — 2026-11-03

1. Last verified subtask: bounded Viewer/Editor/Writer/Moderator Preview RBAC evidence; the reused test account is back to `VIEWER` and `DISABLED`.
2. Current task: P8-001/P8-003 reversible backup/restore acceptance (`IN_PROGRESS`).
3. Exact state: ADMIN exported one CMS-only portable backup through Preview. The local file parses correctly; format `mahmudul-portfolio-backup-v2`, schema `2.0`, all 18 collection counts match, and the exact server checksum algorithm reproduces prefix `1d383c499dbe`.
4. Privacy boundary: `includesPrivateData=false`, no inquiries collection, media manifest only (`mediaFilesIncluded=false`).
5. No upload, server validation or restore has run. Do not claim round-trip acceptance.
6. Blocker: explicit user confirmation is required before uploading the local file through the Windows dialog and before the reversible Preview mutation.
7. Next exact action after confirmation: upload only `C:\Users\USER\Downloads\mahmudul-portfolio-2026-11-02T20-14-36-322Z-v2.json`, validate server-side, choose only `SKIP_EXISTING`, run restore, capture created/updated/skipped plus pre-restore backup evidence, and verify no private data/production mutation.
8. Current uncommitted files: only the four `.codex` recovery Markdown files. Source code is unchanged.
9. Blocked-audit state: the same explicit upload/restore confirmation was absent for three consecutive goal turns. No further meaningful, non-mutating acceptance work remains. Resume only after the user explicitly authorizes uploading the named CMS-only file and executing the Preview-only `SKIP_EXISTING` restore drill.

## Implementation-first closeout — 2026-11-03

1. Owner direction: finish all dependency-ready code first; run verification only after the implementation batch is closed.
2. Implemented admin GPU fix in `portfolio/neural-bg.js` and `portfolio/admin.html`: admin skips the public particle/link RAF loop and uses static ambient styling; public pages are unchanged. `neural-bg.js?v=20261103-1` forces the new asset on Preview.
3. Added the corresponding contract to `scripts/frontend-regressions.test.mjs`; it has not been executed yet by design.
4. P4-005 and P4-006 are dependency-blocked by truthful P4-003 content, not unfinished code. P3-007 and P5-005 remain blocked for their documented external/data dependencies.
5. Exact next action: run the single consolidated local validation gate, then perform the authorized Preview-only backup validation and `SKIP_EXISTING` restore drill, update recovery evidence, commit/push the Preview branch once, and inspect the resulting Vercel deployment. Never push main/production without separate authorization.

## Current handoff — case-study presentation controls (2026-11-12)

1. Current branch is `codex/v2-preview-2026-11-01`; main/production is not authorized.
2. Implemented an additive nullable `Project.caseStudyStyle` JSON field and migration `0026_case_study_style`.
3. CMS Project editor controls: hero aspect, hero fit, focal point, gallery columns, standard board max width, long board max width and gallery gap.
4. Public renderer keeps `AUTO` backward-compatible and applies validated/clamped per-project values to both modular and legacy galleries.
5. Verification passed: Prisma generate/validate, TypeScript typecheck/build, three JS syntax checks, `git diff --check`, and 38/38 focused frontend/commercial/Behance tests.
6. Not yet visually verified: authenticated CMS save/round-trip and deployed desktop/mobile rendering.
7. Next exact action: review the final diff, commit and push the authorized Preview branch, wait for Vercel deployment/migration, then browser-check default and customized presentation behavior. Do not push main.
8. Deployment follow-up: `5815335` is on the remote Preview branch and the stable alias serves the new versioned project assets. Default desktop rendering is browser-verified at 1280×720 with a 1120×630 hero and no horizontal overflow.
9. CMS authentication is absent. The sign-in shell loads, but no project mutation was attempted. Next exact runtime action is an authenticated edit/save/reload check plus mobile verification; main remains unauthorized.

## Current handoff — gallery presets (2026-11-12)

1. Implemented four validated gallery presets: Behance Story, Dribbble Shots, Pinterest Masonry and Editorial Bento; AUTO is backward-compatible.
2. Added project-level image shape and masonry-column defaults, gallery-block overrides, individual block-image shape selectors, legacy gallery-image selectors and a live CMS schematic preview.
3. Server validation now accepts the new case-study style keys and legacy gallery `displayShape`; no new database migration is required because `caseStudyStyle` is already JSON.
4. Public rendering normalizes untrusted block data and scopes preset/shape behavior to each gallery.
5. Verification passed: build, typecheck, Prisma generate/validate, three JS syntax checks, diff check and 43/43 focused tests.
6. Current changes are uncommitted. Next exact action: commit/push only `codex/v2-preview-2026-11-01`, wait for stable alias propagation, browser-check default and preset rendering, then update the four records. Never push main without new authorization.
## Current handoff — image presentation and authorized main promotion (2026-11-12)

1. Owner now authorizes the accepted Preview work, Behance projects and this image-presentation feature to be promoted to `main`; future new/testing work returns to Preview first.
2. Current branch remains `codex/v2-preview-2026-11-01`; working tree contains the image presentation implementation plus these recovery updates.
3. CMS controls cover standalone and gallery width/max-width/fit/aspect/alignment/focal/frame/caption/mobile behavior. `AUTO` preserves existing projects; explicit `FULL` enables true bleed.
4. Validation passed: 45/45 focused tests, TypeScript build, JS syntax and diff check.
5. Next exact action: commit/push Preview, wait for the stable alias, browser-check default rendering/assets, fetch and inspect `origin/main...origin/codex/v2-preview-2026-11-01`, merge without force, rerun the gate, and push `main` once.
6. Authenticated CMS save/reload remains `NOT VERIFIED` while the CMS session is signed out; do not claim that runtime mutation was exercised.
## Preview QA completed before main promotion (2026-11-12)

1. Preview `8ee1bb0` is deployed; public AUTO rendering remains professional and overflow-free on desktop.
2. CMS shell asset propagation is verified, but authenticated mutation remains unverified because the session is signed out.
3. Remote divergence after fetch is `1 43` for `origin/main...origin/codex/v2-preview-2026-11-01`; ordinary merge is required and force push is prohibited.
4. Next exact action: commit/push these QA records to Preview, checkout main, merge Preview with `--no-ff`, resolve only evidence-backed conflicts, rerun focused tests/build/diff check, then push main once and return the working copy to Preview.
## Main promotion gate passed locally (2026-11-12)

1. A normal merge is in progress on local `main`; resolved tree is identical to `codex/v2-preview-2026-11-01` and retains both histories.
2. Full Node regressions pass 256/256; typecheck/build, JS syntax and diff check pass.
3. `prisma validate` is locally blocked only by absent `DATABASE_URL`; do not invent or use production credentials for this check.
4. Next exact action: stage these final records, create the merge commit, push `main` once, wait for deployment propagation, browser-check main assets/layout, close QA tabs and checkout Preview again.
## Main promotion complete; Preview-first workflow restored (2026-11-12)

1. `origin/main` is at merge commit `97419dc`; the main push was performed once without force.
2. Vercel main branch alias visually serves the accepted image layout and new CMS assets; no horizontal overflow was observed.
3. `mahmudportfolio-azure.vercel.app` still served an older build and may be attached to a different Vercel project/alias. Do not confuse that with Git main push failure.
4. Current local branch is `codex/v2-preview-2026-11-01`, fast-forwarded to the merge. This final evidence commit belongs only on Preview so main remains a single rollback-friendly promotion commit.
5. Remaining unverified scope: authenticated image-setting save/reload and real mobile viewport QA.
## Direct-main project ordering handoff (2026-11-12)

1. Current branch is `main`; owner explicitly requested this small feature bypass Preview and deploy directly to production.
2. Implemented project drag/drop ordering, accessible up/down fallback and atomic server persistence; no migration or dependency change.
3. Validation passed: 32/32 focused tests, typecheck/build, JS syntax and diff check.
4. Next exact action: commit once, push main once, wait for `mahmudportfolio-azure.vercel.app/admin.html` to serve `admin.js?v=20261112-project-order-1`, then leave the worktree clean.
5. Authenticated drag/save/reload remains `NOT VERIFIED` unless the production CMS session becomes controllable; do not claim it from static tests alone.

## Direct-main gallery UI handoff (2026-11-13)

1. Current branch is `main`; owner explicitly requested the preset-preview and legacy image-control UI changes be deployed directly to production.
2. The preview is schematic-only and updates preset/shape/column labels; legacy image settings use responsive cards without changing stored payloads.
3. Validation passed: 32/32 focused tests, typecheck/build, JS syntax and diff check.
4. Next exact action: commit once, push main once, and verify production serves version `20261113-gallery-ui-1`; authenticated edit/save interaction remains `NOT VERIFIED` unless a controllable signed-in session is available.

## Direct-main library-first workspace handoff (2026-11-13)

1. Current branch is `main`; owner requested the Projects and Journal/Content create forms move behind explicit New buttons.
2. Library is the default state; New/Edit opens the editor, while Back/Clear/save returns to the library.
3. Validation passed: 33/33 focused tests, typecheck/build, JS syntax, diff check and local browser interaction/overflow QA.
4. Next exact action: commit once, push main once, and confirm production serves `admin.js` and `styles.css` version `20261113-collection-library-1`.

## Direct-main Modular Builder layout handoff (2026-11-13)

1. Current branch is `main`; owner requested this regression repair and related safeguards go directly to production.
2. Generic collection-row CSS no longer controls Modular Project Builder cards; both legacy and active render paths use `project-block-editor` with a dedicated responsive stylesheet.
3. Validation passed: 34/34 focused tests, typecheck/build, JS syntax, diff check and desktop/mobile browser geometry QA without horizontal overflow.
4. Next exact action: commit once, push main once, and confirm production serves `admin.js` and `admin-project-block-editor.css` version `20261113-project-block-layout-1`.

## Direct-main typography-system handoff (2026-11-13)

1. Current branch is `main`; owner requested a professional text hierarchy for admin, login and public frontend pages.
2. `typography-system.css` is linked from all 13 primary HTML pages and defines reusable caption, label, helper, body, control and button roles; guidance is recorded in `.codex/TYPOGRAPHY_GUIDELINES.md`.
3. Validation passed: 35/35 focused tests, typecheck/build, JS syntax, diff check and browser-computed desktop/mobile typography with no horizontal overflow.
4. Next exact action: commit once, push main once, and confirm production admin/index serve `typography-system.css?v=20261113-typography-1`.

## Preview cinematic homepage handoff (2026-11-13)

1. Active branch is `codex/v2-preview-2026-11-01`; main remains at `7e7b2b8` and must stay untouched for this experiment.
2. `homepage-cinematic-preview.css` provides the floating capsule nav and full-bleed hero while the existing CMS selectors still own navigation, image, text and CTA content.
3. Validation passed: 261/261 tests, typecheck/build, JS syntax, diff check and 1280/1024/480 browser QA without overlap or horizontal overflow.
4. Next exact action: commit and push only the Preview branch, then verify the Preview deployment serves `homepage-cinematic-preview.css?v=20261113-1` and leaves origin/main unchanged.

## Preview homepage themes/modules handoff (2026-11-13)

1. Active branch remains `codex/v2-preview-2026-11-01`; main must remain untouched.
2. New assets provide the service accordion, two-theme hero runtime/admin manager, compact Skills treatment and dynamic My Process module using existing JSON columns.
3. The Site Modules save path includes the new `statementConfig` draft while keeping Advanced JSON fallbacks for power users.
4. Full regressions pass 263/263 and deployed desktop/mobile QA passes. Preview commit `2d59576` is live; both admin managers load, and `origin/main` remains unchanged at `7e7b2b8`.

## Preview Profile Showcase v2 handoff (2026-11-14)

1. Active branch is `codex/v2-preview-2026-11-01`; Main must remain unchanged at `7e7b2b8`.
2. Profile Showcase now has CMS fields/toggles for every reference zone, a detailed Admin schematic, accent control and `?hero-theme=PROFILE` non-persistent visual override.
3. Local validation passes: 31/31 focused tests, both JavaScript syntax checks, typecheck/build and `git diff --check`.
4. Preview commit `33463d6` is deployed with `20261114-profile-3`. Browser QA confirms Profile mode, spotlight, social/proof/quote zones, four tags, ribbon and no desktop overflow; Admin loads the Profile radio, forced-preview link, schematic, spotlight field and seven toggles. Main remains untouched. Explicit mobile viewport emulation was unavailable in the connected browser; responsive source checks pass.

## Preview analytics/hero-control handoff (2026-11-14)

1. Active branch remains `codex/v2-preview-2026-11-01`; Main stays untouched.
2. Analytics has themed accessible bar detail, summaries and a more readable scrollable table. Homepage Hero Manager is now the single normal control surface for hero image, copy, theme and typewriter motion.
3. Missing structured hero data hydrates from live legacy values, and Save Site Modules synchronizes both endpoints to prevent old images or phrases from overriding the selected homepage state.
4. Local validation passes 40/40 focused tests plus JavaScript syntax, typecheck/build and diff checks. Next action: commit/push Preview, verify deployed asset versions, authenticated Analytics interaction and the live hero image shown in the manager.

## Preview process connector/icon handoff (2026-11-14)

1. Active branch remains `codex/v2-preview-2026-11-01`; Main stays untouched.
2. Homepage My Process uses a responsive wavy dashed SVG path and five consistent editable outline icon styles while preserving custom symbols and legacy saved values.
3. Public assets use `20261114-process-icons-1`; Admin manager assets use `20261114-controls-4`.
4. Local validation passes 32/32 focused tests plus syntax, typecheck/build and diff checks. Next: commit/push Preview and visually verify desktop/mobile behavior.

## Preview navigation/CMS completion handoff (2026-11-14)

1. Branch remains `codex/v2-preview-2026-11-01`; do not promote to Main without a new explicit instruction.
2. Shared capsule navigation/mobile drawer, mobile spacing, Project/Journal ordering, Hero Media Library selection, capabilities manager, Process connector presets and dark full-image Profile layout are implemented locally.
3. Local checks pass: JavaScript syntax, TypeScript build, frontend 32/32, static smoke and clean diff validation.
4. Next: commit and push Preview, wait for deployment, then verify public desktop/mobile navigation plus authenticated Admin reorder/media/capability controls.
