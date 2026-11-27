# Twelve-app roadmap

Each app below is a separate deployment. “MVP” means the smallest real engine worth releasing, not the existing concept page.

## Flagship tools

### F01 — Amazon Thumbnail Readability Tester

- MVP: private browser upload, 80/120/160px previews, crop/background controls, side-by-side comparison and PNG export.
- Modules: upload validation, image transform, preview grid, comparison, export.
- Boundary: no Amazon compliance certification or sales prediction.
- Done when the uploaded image is processed locally, exported accurately and reviewed on mobile/desktop.

### F02 — Text Readability & Contrast Analyzer

- MVP: image/color inputs, selectable region, color sampling, contrast math, scale preview and explainable guidance.
- Modules: sampler, contrast calculator, region canvas, guidance, report export.
- Boundary: contrast math does not fully judge text embedded in imagery; no invented OCR score.

### F03 — Amazon Listing & Premium A+ Creative Planner

- MVP: guided product brief, configurable listing/A+ module plan, overlap warnings, asset checklist and JSON/PDF export.
- Modules: intake wizard, plan model, module library, overlap rules, export.
- Boundary: marketplace formats are configurable and must not be presented as permanent rules.

### F04 — Smart Creative Brief Builder

- MVP: autosaving local draft, conditional questions, completeness prompts, clean brief preview and PDF/JSON export.
- Modules: schema-driven form, rules, local persistence, preview, export.
- Boundary: generated prompts require human review; no silent submission.

### F05 — Amazon Listing Visual Audit

- MVP: manual evidence-based rubric, image-by-image notes, prioritized findings and exportable review.
- Modules: asset set, rubric, annotation, priority model, report.
- Boundary: no automated conversion score, compliance badge or unverified benchmark.

### F06 — Creative Review & Approval Portal

- MVP: secure project/reviewer access, versioned assets, anchored comments, decisions, activity log and notifications.
- Modules: identity/RBAC, projects, assets, versions, comments, approval, audit log.
- Boundary: highest-risk app; requires threat modeling, storage retention policy and authorization tests before release.

## Mini tools

### M01 — Image Dimension & Safe-Zone Checker

- MVP: local image metadata, custom/preset dimensions, aspect comparison, safe-zone overlay and checklist export.
- Boundary: presets are editable examples, not universal marketplace law.

### M02 — Product Image Background Inspector

- MVP: local pixel sampling, near-white distribution, edge/shadow preview and explainable observations.
- Boundary: no automatic background removal; lighting can create false positives.

### M03 — Visual Brief to PDF

- MVP: structured brief input, brand token options, print preview and accessible PDF export.
- Boundary: validate fonts/assets and keep export deterministic.

### M04 — Brand Asset Kit Generator

- MVP: colors, type, logo notes, image direction and a downloadable starter guide/token file.
- Boundary: user owns or licenses all uploaded brand assets and fonts.

### M05 — Portfolio Presentation Builder

- MVP: project selection, ordering, audience mode, presentation view and expiring/private share option when auth exists.
- Boundary: never include draft/private portfolio records in a public share.

### M06 — Design Handoff Checklist

- MVP: configurable deliverables, naming/version/export checks, local save, print/share report and reusable templates.
- Boundary: checklist guidance does not prove files are technically correct unless a real validator runs.

## Dependency map

- Common shell → every app.
- Local file/privacy helpers → F01, F02, F05, M01, M02, M03, M04.
- Schema-driven form/export pattern → F03, F04, M03, M04, M06.
- Identity/RBAC/audit foundation → F06 and future private M05 sharing only.
- Do not delay low-risk local tools while waiting for the account/storage platform needed by F06.
