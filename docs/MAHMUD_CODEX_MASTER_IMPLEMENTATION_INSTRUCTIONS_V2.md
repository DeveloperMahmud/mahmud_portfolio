# MAHMUD CREATIVE STUDIO — CODEX MASTER IMPLEMENTATION INSTRUCTIONS

**Version:** 2.0 — expanded career, portfolio and studio specification
**Project:** Mahmudul Hassan / personal creative portfolio, client-facing studio, career hub, and Creative Lab
**Primary website:** https://mahmudportfolio-azure.vercel.app/
**Existing QA lab:** https://mahmudportfolio-azure.vercel.app/widget-qa.html
**Audience:** International e-commerce brands, Amazon sellers, creative agencies, and recruiters for remote/on-site roles (UAE, UK, Germany, and beyond).
**Instructions to Codex:** Use this document as an implementation specification. Begin by inspecting the **actual local repository**. Do not assume the production website's implementation matches the guesses/examples in this document. Implement phase-by-phase, maintain backward compatibility, and provide test evidence and a precise change log.

---

## 0. MISSION, OUTCOME, AND DEFINITION OF DONE

Turn the existing personal website into a coherent **designer-led personal creative studio** with three connected experiences:

1. **Portfolio / Career:** Compelling work, credible case studies, and a focused `Hire Me` destination for international employers.
2. **Client / Studio:** Clear services, trust signals, project inquiries, and a scalable client workflow.
3. **Creative Lab:** A polished discovery catalog for **all 6 flagship tools and all 6 mini tools**, each with an immediately available internal **concept/demo route** and with editable future live URLs.

**Crucial scope distinction:** In the INITIAL release, **all 12 tools must be visible and professionally presented** (landing page, mock/demo page, metadata, configuration, and links), but their full real-world engines are **not** required. Implement real features later in separate phases. The site must never suggest that a static concept preview is a working analysis tool. Provide functioning *navigation and configuration* from day one.

### Non-negotiable acceptance criteria for the initial release

- [ ] All 12 tool records are seeded and rendered from one canonical, editable registry.
- [ ] Each tool has a card, detail/landing page, and an internal, working concept/demo route; no dead-end buttons or 404 demo links.
- [ ] A visitor can browse, search, filter by category/status, and open details from a responsive Creative Lab page.
- [ ] The public CTA defaults to **View Demo / Preview Tool**, never to an invented deployed URL.
- [ ] Admin/editor can edit a tool's **title, slug (with safeguards), description, icon, images, category, tags, feature list, primary/secondary CTA labels, internal/external URL, link target, status, visibility, sort order, featured flag, and page content** without manually changing source code.
- [ ] Admin can add/change a future **Live URL** and publish it; the correct button then opens that URL. If no live URL exists, the button falls back safely to the internal preview/demo page.
- [ ] All relevant button text and destinations on new site features (not just tool cards) are editable through site settings/Page Studio where feasible.
- [ ] Preserve existing portfolio, Work Archive, Journal, client inquiry, Page Studio, and `widget-qa.html`; do not introduce regressions.
- [ ] Public site distinguishes **Software I Use / Creative Stack** from **Tools I Built / Creative Lab**.
- [ ] No fake testimonials, clients, jobs, measurable conversion uplift, product compliance certification, or working features.
- [ ] Responsive, accessible, secure-by-default, error-handled, and appropriately tested; finish with documented findings.

---

## 1. REQUIRED WORKING RULES FOR CODEX

1. **Inspect, do not overwrite:** Start with `git status`, package manifests, route structure, CSS/tokens, Page Studio/widget system, CMS/database models, contact form flow, existing analytics/SEO, tests, and deployment configuration. List what exists and what is missing. Do not discard or overwrite uncommitted work.
2. **Preserve the actual stack:** Reuse the project's real framework, routing, persistence, editor, and existing design system. Do not migrate to Next.js, Supabase, or another stack just because this document contains conceptual examples.
3. **Do not create a second CMS:** If Page Studio/admin already manages content, extend that system or its existing storage adapter. Only use a lightweight registry file as a bootstrap/fallback when no durable editing mechanism exists.
4. **Security:** Editing and publishing requires existing authorized admin access. Do not expose editor write endpoints publicly. No insecure demo credentials. Validate URLs and rich content server-side as well as client-side.
5. **Honest states:** `planned`, `preview`, `beta`, `live`, `archived`. Only use `live` if a real, verified destination or working internal tool exists; do not fabricate results or scores in demos without prominent sample-data labels.
6. **Keep stable routes:** Existing paths, anchors, external links, and content should keep working. For a renamed anchor, preserve a backward-compatible alias or redirect.
7. **Performance:** Reuse assets and image optimization; don't load massive animations or third-party dependencies on every page.
8. **No fake production changes:** Do not announce deployment unless deployment actually succeeds. If credentials/environment are missing, finish local implementation, state the blocker, and give exact next steps.
9. **Meaningful completion:** Implement actual code, schema/migrations if needed, tests, and concise documentation. Do not stop at a proposed plan unless blocked by repository access.
10. **Incremental changes:** Work phase by phase, verify each milestone before proceeding, and provide a summary of modified files and tests at the end.

### Existing public structure to preserve and inspect

- Homepage's current lead: **I DESIGN BRANDS THAT SELL.**
- Featured/selected work; full Work Archive (`work.html` in the public site); Journal (`blog.html`), Amazon services, capabilities, About, Why Me, Client Notes, contact.
- Existing homepage **Tools** area currently describes software/production tools used by the designer; avoid confusing it with public web apps.
- `widget-qa.html` is an existing Page Studio fixture/loading surface; inspect its runtime and widgets rather than assuming they all work.
- Page Studio controls, drafts, revisions, and publishing must not be broken. Existing CMS and styles take precedence over hypothetical architecture in this plan.

---

## 2. INFORMATION ARCHITECTURE AND BRAND POSITIONING

**Personal brand:** Mahmudul Hassan, independent creative designer / designer-led studio. Keep claims about employment, team size, clients, portfolio, awards, performance and relocation factual and editable.

**Primary positioning:** E-commerce Visual Design & Brand Experiences.
**Specialties:** Amazon Listing Images, Basic/Premium A+ Content, Brand Story, Storefront, Product Retouching, Lifestyle Compositing, Brand Identity, Performance Creatives.
**Differentiator:** Design + structured creative systems and useful tools.

### Proposed routes (adapt path style to existing router)

| Public destination | Suggested route | Purpose |
|---|---|---|
| Home | `/` | Clear value proposition + two visitor intents |
| Selected Work / Work Archive | Preserve existing `/work.html` and any current routes | Best projects + filters |
| Individual case studies | `/work/{project-slug}` or compatible existing route | Objective, role, process, deliverables, visuals, outcome |
| Services | `/services` or existing page/anchor | Conversion-oriented services |
| Amazon design service | `/services/amazon-creative` | Specific, commercially relevant offering |
| Creative Lab | `/creative-lab` (or `/tools/lab` if `/tools` reserved) | Public tool catalog |
| Tool details | `/creative-lab/{slug}` | Tool benefits, functions, status, demo |
| Tool concept/demo | `/creative-lab/{slug}/demo` | Honest demo/preview, accessible from day one |
| Hire Me | `/hire` | Recruiter view, resume, availability/contact |
| Studio / Work With Me | `/studio` or service page | Client view + inquiry |
| Resources | `/resources` | Templates/guides when content exists |
| Journal | Preserve `/blog.html` | Articles and process writing |
| Existing widget QA | Preserve `/widget-qa.html` | Development/internal QA, not lead-generation content |

Maintain old hashes such as `#tools`. Retitle old software listing **Creative Stack / Tools I Use**; add an unmistakably separate **Creative Lab / Free Tools & Experiments** section and navigation entry. Do not replace established sections with placeholder content. Prefer navigation items: Work, Services, Creative Lab, Journal, About, Contact; prominent CTAs: `Hire Me` and `Start a Project` where space allows.

### Homepage upgrades

- Retain recognizable visual identity; refine mobile typography, hierarchy, motion, and responsive spacing rather than redesigning wholesale.
- Hero: keep headline; add clearer supporting line explaining Amazon/e-commerce creative work and brand visuals; two editable CTAs: **Explore Work** and **Start a Project**. Optionally a subtle **For Recruiters** link.
- Featured projects: 4–6 curated, genuinely complete case studies; no made-up metrics.
- Services: link to individual services with real proof/example visuals.
- Creative Lab teaser: 3 featured tool cards + `Explore All Tools`.
- Recruiter signal: clear experience/skills summary, downloadable verified CV, remote/international availability only if confirmed.
- Testimonials/logos only with permission and attributable actual evidence.
- Existing form retains working behavior; optional routing by `Client Inquiry` vs `Recruiter Inquiry`, without exposing sensitive data.

---

## 3. ALL SIX FLAGSHIP TOOLS — CREATE COMPLETE CATALOG RECORDS NOW

For **every tool**, immediately provide: title, subtitle, visual card, cover/mockup asset, category/tags, tool detail page, problem statement, proposed inputs, intended outputs, limitations, structured feature list, sample UI/demo page, clear status, editable CTA labels, editable demo/live URLs, and admin publishing controls. **Do not imply functional production capabilities yet.**

### F01. Amazon Thumbnail Readability Tester
- Slug: `amazon-thumbnail-tester`
- Audience: Amazon sellers and listing image designers.
- Problem: Important features and packaging text become difficult to recognize at small sizes.
- Intended inputs: image upload (future), thumbnail size (80/120/160 px), background, competitor/adjacent layout optional.
- Intended outputs: search-result-size visual previews, side-by-side comparison, PNG/screenshot export (future).
- Initial demo: attractive **sample-image-only** responsive thumbnail grid with clearly labeled sample sizes and no fake uploaded analysis; optional browser-local sample zoom/size control if easy.
- Future implementation: real image upload/preview with privacy-safe client-side processing; evaluate actual Amazon layout standards per region when relevant.

### F02. Text Readability & Contrast Analyzer
- Slug: `text-readability-contrast`
- Problem: Low-contrast text inside flattened product imagery.
- Intended inputs: image, selected region, foreground/background sample, preview scale.
- Intended outputs: visual contrast/readability guidance, side-by-side variants, accessible contrast ratios **only when actual color values are available**.
- Initial demo: sample gold-on-beige/dark packaging comparison; editable example controls; no invented automated OCR findings.
- Future implementation: region selection, pixel sampling, contrast math, guidance with clear limits (image text is not fully assessed by WCAG color math alone).

### F03. Amazon Listing & Premium A+ Creative Planner
- Slug: `amazon-a-plus-planner`
- Problem: Creating distinct image sequences and A+ modules without repetition.
- Intended inputs: product, category, target audience, USPs, brand tone, assets, number/type of modules, marketplace.
- Intended outputs: structured listing plan, A+ module map, asset checklist, lifestyle allocation, exportable creative brief.
- Initial demo: a realistic, **fictional sample product** showing seven listing cards and seven Premium A+ cards; visibly label sample/non-live. No assertion that seven modules always match all Amazon program rules; formats must be configurable.
- Future implementation: wizard, reusable templates, content-overlap flagging, PDF/JSON export; validate up-to-date marketplace specifications before suggesting compliance.

### F04. Smart Creative Brief Builder
- Slug: `creative-brief-builder`
- Problem: Incomplete client briefs cause rework.
- Intended inputs: brand/product details, goals, category, references, deliverables, dates, budget range, file availability.
- Intended outputs: structured summary, questions to clarify, printable/sendable brief.
- Initial demo: one pre-filled sample brief and an **interactive preview form** if trivial; do not claim a submission was delivered or saved unless backend works.
- Future implementation: form validation, PDF/JSON export, optional authenticated save and client inquiry integration with consent.

### F05. Amazon Listing Visual Audit
- Slug: `amazon-listing-visual-audit`
- Problem: Existing listings need systematic creative review.
- Intended inputs: images, listing context, audience/category, design goals, optional link.
- Intended outputs: a qualitative rubric (visibility, hierarchy, lifestyle, information sequence, trust, mobile readability), issues and actions.
- Initial demo: clearly labeled **example audit** with fictional example data and illustrative recommendations; not a real automatic score.
- Future implementation: configurable rubric, optional human review, documented scoring rationale; no unsupported sales/conversion predictions or claim of Amazon compliance certification.

### F06. Creative Review & Approval Portal
- Slug: `creative-review-portal`
- Problem: Feedback is scattered across chats and file revisions.
- Intended inputs: project assets, reviewer comments, annotations, revision history, approval states.
- Intended outputs: version comparison, comments, review status, final approval record.
- Initial demo: realistic static walkthrough of `Upload → Comment → Revise → Approve` with fictional sample artwork, no live login/client data.
- Future implementation: authenticated client workspaces, RBAC, expiring review links, audit trail, file privacy, upload scanning/validation, retention/deletion policies.

---

## 4. ALL SIX MINI TOOLS — CREATE COMPLETE CATALOG RECORDS NOW

These are smaller, potentially easier to activate. Still create every card + page + editable demo/live link in the first release.

### M01. Image Dimension & Safe-Zone Checker
- Slug: `image-size-safe-zone`
- Planned functions: image dimensions, aspect ratio, editable output preset library, overlay safe zones, export checklist.
- Demo: dimension preset browser with sample overlays; do not hard-code all Amazon specs as universal/current.
- Activation order: first mini tool to make truly interactive.

### M02. Product Image Background Inspector
- Slug: `product-background-inspector`
- Planned functions: near-white sample analysis, edge/mask preview, visible shadow and clipping review.
- Demo: sample images with visual background comparisons; no fake background-removal outcome.
- Activation: browser-local image sampling, explain false positives due to shadows/lighting.

### M03. Visual Brief to PDF
- Slug: `visual-brief-to-pdf`
- Planned functions: branded preview, structured sections, logo/brand colors (optional), downloadable PDF.
- Demo: sample brief preview; if export is not implemented, button explicitly says `Preview Sample` rather than `Export PDF`.
- Activation: real client-side or server-side PDF export; font/encoding support and print styles.

### M04. Brand Asset Kit Generator
- Slug: `brand-asset-kit`
- Planned functions: color palette, typography, visual style, logo usage guidelines, exportable starter guide.
- Demo: editable **sample tokens** and a concept preview; no proprietary client brand assets.
- Activation: configurable brand kit generation and legitimate licensing for included assets/fonts.

### M05. Portfolio Presentation Builder
- Slug: `portfolio-presentation-builder`
- Planned functions: choose published projects, rearrange, presentation mode, private recruiter/client views, share link.
- Demo: pre-curated fictional/example presentation sequence; real projects only if selected from published content.
- Activation: presenter mode and securely scoped share links without leaking drafts.

### M06. Design Handoff Checklist
- Slug: `design-handoff-checklist`
- Planned functions: deliverable checklist, file naming guidance, export formats, revision/version handoff, shareable report.
- Demo: fully usable client-side checklist **can be activated early** (no backend needed); user must be told if selections are not persisted.
- Activation: local persistence and optional printable/PDF summary.

---

## 5. TOOL REGISTRY AND EDITABLE DATA MODEL (CRITICAL)

### One source of truth

Build/extend a content schema for **12 canonical seeded tools**, not 12 hardcoded static cards. Use the real project's existing database/CMS/Page Studio model if available. Support admin CRUD with migration/seed scripts and safe defaults. Keep stable `id` independent of editable `slug`.

Conceptual TypeScript-like model (adapt to stack, **not mandatory code**):

```ts
type ToolStatus = 'planned' | 'preview' | 'beta' | 'live' | 'archived';
type ToolKind = 'flagship' | 'mini';
type LinkTarget = 'same_tab' | 'new_tab';

type ToolEntry = {
  id: string;                  // immutable stable ID (F01..F06, M01..M06)
  slug: string;                // unique, route-safe, edit carefully
  kind: ToolKind;
  category: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  overview: string;
  problemStatement: string;
  audience: string[];
  featureBullets: string[];
  proposedInputs: string[];
  proposedOutputs: string[];
  limitations: string[];
  tags: string[];
  iconKey: string;             // whitelisted icon ID
  coverImage?: string;        // asset from existing media library
  galleryImages?: string[];
  status: ToolStatus;
  visible: boolean;
  featured: boolean;
  sortOrder: number;
  demoMode: 'concept' | 'sample_interactive' | 'actual';
  demoUrl?: string;            // defaults to internal /creative-lab/{slug}/demo
  liveUrl?: string | null;     // EMPTY at launch; owner adds later
  documentationUrl?: string;
  ctas: {
    primaryLabel: string;      // e.g. 'View Demo'; editable
    secondaryLabel?: string;   // e.g. 'Learn More'; editable
    primaryBehavior: 'auto' | 'demo' | 'live' | 'details';
    secondaryBehavior?: 'demo' | 'details' | 'external';
    secondaryUrl?: string;
    target: LinkTarget;
  };
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: string;
};
```

Also add a **Site CTA registry/settings** for editable buttons not belonging to an individual tool: `id`, `page/section`, `label`, `ariaLabel`, `href`, `target`, `styleVariant`, `visible`, `order`. Prefer integrating these with the Page Studio widget property editor if it already supports configurable actions.

### Seed data

- Exactly **6 flagship + 6 mini** tool entries from Sections 3 and 4, with unique canonical IDs and slugs.
- All tools visible in the catalog at first, with honest preview labels/status.
- `liveUrl = null` by default for every tool.
- `demoUrl = /creative-lab/{slug}/demo` as an actual existing route.
- `primaryLabel = "View Demo"`, `primaryBehavior = "auto"`, status `preview` if a demo is present.
- `featured = true` for the top 3: Amazon Thumbnail Tester, A+ Creative Planner, Creative Brief Builder (configurable).
- **Demo pages must be populated** with sample UI/screens and explanatory content, not blank cards, broken placeholders, generic 404s, or unimplemented action buttons.

### Link resolution logic

```text
If tool is hidden or archived -> do not display in public catalog.
If primaryBehavior = details -> link to detail page.
If primaryBehavior = demo -> open validated demo URL or internal fallback.
If primaryBehavior = live AND verified live URL exists -> open live URL.
If primaryBehavior = live AND URL missing -> show internal demo (do NOT create '#', javascript:void(0), dead click).
If primaryBehavior = auto:
  - status live/beta + nonempty validated live URL -> Live/Beta destination
  - otherwise -> internal concept/demo destination
External URLs: allow only https:// (or configured safe internal routes), encode safely, open in new tab only when chosen, use rel=noopener noreferrer.
If URL is malformed, show validation error in admin and do not publish it.
```

**Owner must be able to change a tool from Demo to Live in the CMS:**
1. Open `Admin → Creative Lab → Tools → Edit`.
2. Paste live URL, choose target, optionally edit CTA label.
3. Change status to `beta`/`live` after verifying URL and tool functionality.
4. Preview changes, then Publish.
5. Public card, detail page, homepage teaser, and navigation all update from the **same record** without code edits.
6. Unpublish/revert to demo with one status/link change.

### Editing requirements

- Browse tool list with search, kind/status filters, sort, and quick status/visibility toggle.
- `Create`, `Edit`, `Duplicate`, `Preview`, `Publish/Unpublish`, `Archive`; protect initial canonical IDs from accidental destructive deletion.
- Dedicated **Links & Buttons** panel to edit demo URL, live URL, secondary URL, labels, button style, target, and enabled state.
- Edit cover images from existing asset/media manager, not by pasting HTML.
- Reorder with drag/drop or numeric sort; preserve keyboard accessibility.
- Inline validation: unique slug, valid URL, concise title lengths, required fields, safe image references.
- Draft vs published version if existing CMS supports it; avoid leaking unpublished data in public APIs.
- Preserve old slug via redirect on rename, wherever router allows.
- Show a preview card before publish.
- Editable section headings, intros, categories, tool tags, empty-state copy, featured-tool selection, and homepage CTA destinations.
- Persist edits: a browser refresh and deployment must not silently erase changes. If using file-backed data only, explain build/deploy limitations and choose an existing durable persistence layer when available.
- Permission checks on every create/update/delete/publish endpoint. No bypass through direct API calls.

---

## 6. CREATIVE LAB PUBLIC UX AND DEMO PAGE SPECIFICATION

### `/creative-lab` catalog page

**Visual style:** Premium editorial design, consistent with the existing portfolio, clean hierarchy, strong imagery, deliberate whitespace, subtle micro-interactions, excellent mobile layout. Avoid generic SaaS dashboard aesthetic if it clashes with the website. Use real project style, but demos may use clearly labeled sample visuals.

**Above the fold:**
- Eyebrow: `MH / CREATIVE LAB`
- H1: `Tools that make creative work clearer.`
- Supporting copy: `A collection of visual design experiments, workflow helpers, and upcoming tools for e-commerce brands and creative teams.`
- Key count: `12 tools / 6 flagship / 6 mini` **computed from registry**, not hardcoded.
- One clear CTA to scroll to all tools.

**Catalog features:**
- Search by title, description, tags; `All / Flagship / Mini` segmented filter; optional category filters.
- Status labels: `Concept Demo`, `Beta`, `Live`, `Coming Soon` only as appropriate.
- Cards: icon, imagery, title, concise description, problem solved, status, CTA.
- Featured tools prominent; all twelve searchable. Filter and sort state reflected in URL when practical.
- Empty state with reset button; skeleton loading and error fallback if asynchronous.
- Bottom CTA: `Have a creative workflow problem? Tell me about it` → existing contact flow.
- No forced sign-in or paywall for static previews.

### `/creative-lab/{slug}` detail page

Display: breadcrumb, name, status, product mockup, intended audience/problem, key features, example workflow, what is included now, limitations, future capabilities, primary `View Demo` button, optional `Request a Custom Solution` CTA. All copy and links editable by admin. Related tools are selected from registry.

### `/creative-lab/{slug}/demo` page — immediately available

For all 12 tool demos:
- Distinct, well-designed, tool-specific preview; not the same generic placeholder for every tool.
- Banner/notice: **Concept preview / Sample content — full tool not live yet** unless genuinely implemented.
- Designed example input and output, sample visuals/interaction. A static demo is acceptable initially, but every clickable control must do a real action (navigate, toggle sample state, or show an explicit not-yet-available state). Do not show non-functional `Analyze`, `Generate`, or `Export` buttons as if they work.
- `Back to Tool Details`, `View All Tools`, `Start a Project` must work.
- Future live URL is not needed to make demo route work.
- Include sensible page title, no-index policy for purely repetitive demo pages if appropriate, and accessible keyboard operation.
- Avoid real user file uploads or private data storage in concept-only demos.

### Design behavior

- At 360px, 768px, 1280px and wider, no horizontal overflow or broken dialogs.
- Icon/illustration styles consistent across tool groups; avoid 12 unrelated stock graphics.
- Mobile tap targets, hover and focus states, reduced-motion preference, sufficient color contrast.
- Respect image asset licensing and text accuracy.

---

## 7. RECRUITER MODE, CLIENT MODE, CASE STUDIES

### `/hire` — International recruiter mode (ship early)

- Professional introduction, clear role/title and accurate availability.
- 4–6 hand-picked case studies (not necessarily same order as client landing page).
- Professional experience timeline with **only verified positions/dates**.
- Skills: Amazon A+, Product Visual Design, Photoshop, brand identity, Figma/motion only to the extent actually supported by portfolio.
- `Download CV` (real supplied file only; if absent show an editable contact CTA, **never a broken download**).
- Contact CTA for interview/recruiter inquiry.
- Optional 3-minute presentation mode after main routes are stable.

### `/studio` — Client mode (ship early)

- Services, deliverable examples, collaboration steps, case studies, verified client notes, FAQ, project inquiry.
- No fabricated portfolio stats, testimonials, success rates, clients, pricing or guaranteed sales.
- Editable buttons: `View Work`, `Explore Services`, `Start a Project`, `Book a Call` (booking only when a real booking URL is configured; otherwise contact fallback).
- Client form may capture desired service, product count/SKU, brand/site link, assets, deadline, budget and contact details. Preserve privacy and clear retention rules.

### Case study template

`Project overview → Client/industry (if publishable) → Role → Challenge → Constraints → Research/strategy → Creative concepts → Listing/A+ sequence or brand system → Before/after if available → Deliverables → Verified outcome/lessons → CTA`.

- Allow media galleries, widescreen A+ screenshots, image labels, mobile presentation, before/after control.
- Do not declare an A/B test, conversion improvement or sales number without evidence.
- Make template configurable inside existing CMS/Page Studio.

---

## 8. DEVELOPMENT PHASES (ORDER AND DELIVERABLES)

### PHASE 0 — Audit and safety baseline

**Tasks:** Inspect repo, log tech stack, current site routes, Page Studio models, widgets, authentication, persistence, existing components, tests, styles, deployment. Run baseline build/tests, identify broken/unimplemented states, document assumptions.

**Deliverables:** `docs/implementation-audit.md`, route map, data model plan, risk list, baseline test results. **Do not erase existing user edits.**

**Exit gate:** Existing site builds or baseline failures documented; safe extension path chosen.

### PHASE 1 — Brand + information architecture foundation

**Tasks:** Add Creative Lab routes/navigation without breaking current homepage anchors; distinguish `Creative Stack` from public tools. Create reusable card, filter, status, CTA, detail and sample-demo templates. Add shared design tokens only where compatible with existing site. Prepare recruiter/client page structures and reusable case-study content model.

**Deliverables:** Working route skeletons, navigation, mobile UX, reusable components.

**Exit gate:** No navigation regressions, accessibility checks, correct layouts on mobile/desktop.

### PHASE 2 — INITIAL CREATIVE LAB CATALOG: ALL 12 TOOLS VISIBLE

**This is a must-complete phase for the first launch, not an optional later phase.**

**Tasks:** Implement canonical 12-item seed registry, search/filter/sort, flagship/mini sections, card/detail pages, **12 individualized internal demo pages**, sample visuals, accurate status and clear concept-preview notices. Ensure all tool CTA paths resolve. Feature 3 selected tools on homepage.

**Deliverables:** Full publicly browseable `Creative Lab` with 6 flagship + 6 mini, all with working concept-demo navigation and no fake live links.

**Exit gate:** Automated test checks every seeded slug has valid details and demo routes; no dead links or placeholders that misleadingly imply functionality.

### PHASE 3 — ADMIN/EDITOR: ALL CONTENT, BUTTONS, AND URLS EDITABLE

**Also required for the first launch.**

**Tasks:** Extend existing Page Studio/admin content store, add tool list/detail editor, links & buttons editor, status/visibility/order controls, featured selection, category/tag management, cover asset selection, validation, preview/publish, persistence, RBAC. Add site-wide CTA editable settings for new sections. Implement slug redirect strategy if applicable.

**Deliverables:** Admin tool manager where owner can replace `View Demo` with `Open Tool` and paste a future live URL without touching code; editing remains durable across reloads and deploys.

**Exit gate:** Edit tool X → change label & URL → publish → view updated public card and detail and homepage → revert to demo; authenticated and unauthenticated permission tests pass.

### PHASE 4 — PROFESSIONAL PROFILE AND LEAD CONVERSION

**Tasks:** `/hire` recruiter view, `/studio` client view, stronger case-study templates, meaningful service landing pages, correct CV/download logic, segmented inquiry flow. Improve homepage CTAs, remove unverified claims, improve work archive and responsive detail pages.

**Deliverables:** Two credible visitor journeys with real contact conversion and accurate professional details.

**Exit gate:** Recruiter can inspect portfolio/contact; client can understand services/submit inquiries; no lost messages or broken download links.

### PHASE 5 — MINI TOOL FUNCTIONAL ACTIVATION (LATER, NOT A BLOCKER)

Suggested sequence:
1. Design Handoff Checklist — working selection, print/share; no backend dependency.
2. Image Dimension & Safe-Zone Checker — real browser-local image upload, dimensions, overlays.
3. Visual Brief to PDF — validated real PDF export.
4. Brand Asset Kit — real configuration + documented licensed typography.
5. Product Image Background Inspector — browser-local sampling with limitations.
6. Portfolio Presentation Builder — selection and presentation mode, privacy-safe sharing.

For each: functional requirements, unit/E2E tests, error states, accessibility, security/privacy review, versioned release. Update status only when usable. Do not build all six engines before shipping initial catalog.

### PHASE 6 — FLAGSHIP TOOL FUNCTIONAL ACTIVATION (LATER)

Suggested priority based on relevance and risk:
1. Thumbnail Readability Tester.
2. Smart Creative Brief Builder.
3. Listing & Premium A+ Planner.
4. Text Readability & Contrast Analyzer.
5. Listing Visual Audit.
6. Creative Review & Approval Portal (most demanding because of authorization, file storage, and user data).

Start with true MVPs; use service adapters for any AI APIs; never put secrets in the browser. Clearly state AI output limitations and customer-data handling. Do not imply proprietary Amazon access or authorized compliance claims.

### PHASE 7 — SEO, analytics, accessibility, and optimization

- Sitemap, canonical links, titles/descriptions/OG images, internal linking between work, services and tools.
- JSON-LD appropriate to actual content (no invented ratings or reviews).
- Event tracking: `tool_card_view`, `demo_open`, `tool_live_open`, `contact_start`, `contact_submit`, `cv_download`, `recruiter_cta` with privacy-conscious analytics. No unnecessary PII in event payloads.
- Optional consent management as required by relevant region/legal advice.
- Color contrast, keyboard, focus, reduced-motion, alt text and screen-reader semantics; test against WCAG 2.2 AA principles.
- Page speed, image dimensions/compression, lazy loading, Core Web Vitals monitoring where available.

**Exit gate:** No catastrophic accessibility defects; builds/tests pass; document real performance measurements instead of fictional Lighthouse scores.

### PHASE 8 — QA, release documentation and handoff

- Test route and link health, 12 seed records, filter/search behavior, status-dependent CTA logic, admin auth, edit persistence, unpublished visibility, mobile responsiveness, media fallback, publishing and rollback.
- Keep existing `widget-qa.html` functional and include new components in QA coverage **only if compatible** with current widget system.
- Document env vars (names only, never values), commands, routes, admin editing walkthrough, storage/migrations, deployment/rollback instructions.
- Produce `docs/creative-lab-admin-guide.md`, `docs/creative-lab-roadmap.md`, `docs/verification-report.md`.

---

## 9. PRECISE UX BEHAVIOR FOR EDITABLE BUTTONS

This is a core request. **Do not hardcode URLs/labels where the owner will need to edit them later.**

### Tools catalog card

- Primary CTA when preview only: `View Demo` → internal `/creative-lab/{slug}/demo`.
- Secondary CTA: `Learn More` → `/creative-lab/{slug}`.
- Live tool after owner adds URL and publishes: primary CTA can automatically become `Open Tool` (default) or use an admin-configured custom label.
- Inactive/unlisted: hidden from public pages (but still editable in admin).
- Never show `Live Demo` pointing to a blank page, `href="#"`, an invented Vercel URL, or a page that silently 404s.

### Site-wide buttons

Expose configurable properties in Page Studio/site settings for:
- Hero primary/secondary CTA.
- Featured project CTA.
- Amazon service CTA and each service card.
- `Explore Creative Lab` and featured tool CTAs.
- `Hire Me` and `Start a Project`.
- CV download link.
- Book a Call link (only if legitimate booking service exists; fallback to inquiry).
- Contact/submission confirmation link.
- Footer and social links.

Editor for each action: button label, destination (existing internal page selector or validated external URL), open mode, visible, disabled only when deliberately needed, accessible label, appearance. All clickable buttons must have an outcome.

### Admin example record (illustrative JSON)

```json
{
  "id": "F01",
  "slug": "amazon-thumbnail-tester",
  "title": "Amazon Thumbnail Readability Tester",
  "kind": "flagship",
  "status": "preview",
  "visible": true,
  "featured": true,
  "sortOrder": 10,
  "demoUrl": "/creative-lab/amazon-thumbnail-tester/demo",
  "liveUrl": null,
  "ctas": {
    "primaryLabel": "View Demo",
    "secondaryLabel": "Learn More",
    "primaryBehavior": "auto",
    "secondaryBehavior": "details",
    "target": "same_tab"
  }
}
```

**Future live activation example:** after the owner builds/deploys the tool, the owner edits `liveUrl` to a real validated HTTPS URL, selects `live` (or beta), previews and publishes. Existing tool pages automatically point to it. Do not prefill the URL with fake domains.

---

## 10. DATA, SECURITY AND TECHNICAL QUALITY

- Avoid public tool edit API without authentication and authorization. Existing admin session/auth must gate writes.
- Sanitize user-entered content. Protect stored HTML/Markdown, links, embeds and media from XSS and malicious redirects.
- Validate allowed URL protocols; prevent `javascript:`/`data:` abuse in link fields. For external destinations use safe `target` and `rel` handling.
- File uploads (once introduced): size/type constraints, EXIF/location privacy considerations, no public sharing by default for private client work, clear deletion policies.
- Admin tools seed should be idempotent: re-running seed must not wipe owner-edited live URLs or metadata. Support upsert-by-immutable-ID only for missing records or via explicitly opt-in migration.
- Prevent public cache from serving unpublished tool content; purge or revalidate when status changes.
- Never store or log sensitive form inputs in analytics events.
- Do not expose project client assets in sample/demo routes without permission.
- If no persistent database/CMS is available, provide an explicit editable settings approach supported by the deployment architecture; do not pretend a `localStorage` admin editor is durable across devices or deployments.
- Prefer minimal dependencies and consistent code style; use static generation/caching for public pages if compatible.

---

## 11. TEST MATRIX — MUST BE VERIFIED

| Test | Expected result |
|---|---|
| Catalog initial load | Exactly 12 active visible seeded tools unless owner changes visibility |
| Kind filters | Flagship = 6, Mini = 6 for untouched seed |
| Search | Relevant hits, empty state, reset |
| Tool detail routes | All 12 resolve |
| Demo routes | All 12 resolve, non-empty individualized content |
| Default CTA | Opens internal concept demo; no fake live URL |
| Admin edit live URL | Persisted; published link updates everywhere |
| Remove live URL | Public CTA falls back to demo safely |
| Button label edit | Public label changes after publish |
| Hide tool | Hidden from public catalog and related tools |
| Auth | Anonymous/unauthorized write requests rejected |
| URL validation | Unsafe scheme and malformed URL rejected |
| Slug change | Old deep link redirected or documented preserved |
| Refresh/redeploy | Published settings remain durable |
| Responsive | 360/768/1280 widths without overflow |
| Accessibility | Full keyboard navigation, labels, contrast, focus |
| Existing portfolio | Home, Work Archive, Journal, contact still work |
| Widget QA | Existing fixture not regressed |
| Contact submission | Real integration works, error states truthful |

Aim to automate registry, routing, CTA resolver, permission, and form-validation tests. For visual checks use whatever browser/testing tools the local repo already has. Never claim tests passed without running them.

---

## 12. DESIGN DETAILS AND EDITORIAL QUALITY

**Desired character:** Premium, restrained, purposeful, visual, confident. More akin to a high-end independent creative studio than a generic AI tool directory. Use the current site's design language as the foundation.

- Visual hero on tool catalog, featured tools in an editorial layout, structured grid for remaining tools.
- Human-written functional copy; no filler, no inflated marketing or invented stats.
- Consistent line icons/mockup imagery; optional restrained micro-interactions.
- Distinct landing pages for recruiter vs prospective client.
- High-quality imagery with legitimate licenses or original work; use sample visuals explicitly marked when necessary.
- Loading/error/empty states and meaningful validation copy.
- No motion-only interactions; respect `prefers-reduced-motion`.
- For sample project demos do not reproduce branded third-party product labels inaccurately; use neutral fictional sample products by default.

---

## 13. IMPLEMENTATION PRIORITY WHEN TIME IS LIMITED

If the whole scope cannot be finished in one session, **do not abandon the objective**. Execute the following vertical slice, report exactly what's completed, and leave a clear follow-up checklist:

1. Phase 0 repository audit.
2. Phase 1 navigation + reusable Creative Lab components.
3. Phase 2 **all 12 real pages and concept demos present**.
4. Phase 3 admin editor for link/button/status/visibility/order + persistence (the highest priority feature after catalog).
5. Phase 4 recruiter page / services / lead flow.
6. Defer true tool engines (Phases 5 and 6), advanced analytics, client portal authentication complexity until explicitly requested.

**Do not return only a large plan while leaving the first 12-tool catalog unimplemented, if you have the repository and can edit it.**

---

## 14. REQUIRED FINAL RESPONSE FROM CODEX

At the end of implementation, report:

1. Existing stack and CMS found, important assumptions.
2. Phases completed vs pending, with explicit boundaries between demo and functional tools.
3. Files/routes created or edited, database schema/migrations if any.
4. Exact admin workflow: how to edit a tool, CTA label, demo URL, live URL, status, icon, category, ordering, and publish.
5. Test commands actually run and their results; known remaining issues.
6. Screenshots or browser proof if tools permit, including mobile.
7. Deployment state (not deployed / successfully deployed), real verified URL if deployed.
8. Next recommended tasks prioritized by value.

### First action for Codex after reading this file

> Inspect the current repository and produce a short implementation map. Then execute Phases 0–3, making sure all twelve tool listings and individual demo routes exist, all relevant links and buttons are editable in the existing admin/Page Studio, and no existing portfolio functionality is broken. Continue to Phase 4 if feasible. Leave expensive/full-fledged tool engines for later. At the end, clearly distinguish implemented functionality from visual demos and provide verification evidence.

---

## 15. RECOMMENDED CONTENT / MANAGEMENT SCREEN MAP

```text
Admin / Page Studio
├── Website
│   ├── Homepage Sections
│   ├── Navigation + Footer
│   ├── Global Buttons & Links
│   └── Theme / Design Tokens (existing system if available)
├── Portfolio
│   ├── Published Projects
│   ├── Case Studies
│   └── Featured Projects
├── Services
│   ├── Service Landing Pages
│   └── Inquiry Settings
├── Creative Lab
│   ├── All Tools (12 seed entries)
│   ├── Flagship Tools (6)
│   ├── Mini Tools (6)
│   ├── Featured / Sorting
│   ├── Tool Detail Content
│   ├── Demo Content
│   ├── Links & CTA Editor
│   ├── Categories & Tags
│   └── Publishing / Visibility
├── Career Hub
│   ├── Hire Me Page
│   ├── CV Link
│   └── Recruiter CTA
├── Client Studio
│   ├── Studio Page
│   └── Inquiry Routing
└── QA / Revisions
    ├── Existing Widget QA
    ├── Draft/Published Preview
    └── Revision History
```

Keep this map conceptual: connect features to existing Page Studio menu rather than unnecessarily duplicating it.

---

## 16. PRACTICAL ACCEPTANCE SCENARIO FOR THE OWNER

**On day one:** The owner sees all 12 tool cards, can open all 12 attractive concept demos, and can edit every tool's labels, status, visibility, and links from one place. Every tool is presented as a preview, not a fake completed product.

**A month later:** The owner deploys the actual Thumbnail Tester at a legitimate domain. In admin, the owner finds F01, pastes its real HTTPS URL, sets status `live`, optionally changes button text to `Open Tool`, and publishes. The card, tool landing page and featured section all update automatically. No new code deployment is required for the link change if the existing deployment/CMS supports dynamic publishing.

**Another month later:** The owner can publish the Brief Builder, change another tool to beta, hide a tool, adjust order, or change categories without engineering support. The public site remains coherent, searchable, and professionally credible.

**Final success condition:** One website acts simultaneously as a trusted international portfolio, a client inquiry funnel, and a growing portfolio of practical creative software concepts, without unfinished features masquerading as production tools.


---

# PART II — CAREER, CREDIBILITY, ROI AND DIGITAL GROWTH EXTENSIONS (V2)

**How to use this Part II:** This addendum makes the broader career/portfolio plan implementation-ready. It does **not** change the early-release mandate in Part I: preserve the site, build and seed all 12 honest tool demos, then make tool/button/link/content editing durable in admin. Treat the additions as follows: **P0** means first-site-release alongside Phases 0–4 where relevant, **P1** means a near-term enhancement after the site and editable catalog work, **P2** means later/conditional. Do not build production-only features prematurely or invent proof, conversion metrics, client identities or employment history.

## 17. EXPLICIT PRIORITIZATION: HIRING VALUE × CLIENT VALUE × COMPLEXITY

Use this assessment for the backlog and for an optional *admin-only* feature roadmap (never present these subjective ratings as validated market data).

| Initiative | Hiring value | Client value | Relative implementation complexity | Priority | Phase placement |
|---|---|---|---|---|---|
| Excellent, evidence-based case studies | Very high | Very high | Medium | P0 | Phase 4, model from Phase 1 |
| Recruiter Mode `/hire` | Very high | Low | Low | P0 | Phase 4 |
| Dedicated service landing pages | Medium | Very high | Low | P0 | Phase 4 |
| Amazon Thumbnail Readability Tester | High | High | Low–Medium | P1 | Demo Phase 2; engine Phase 6 |
| Smart Creative Brief Builder | Medium | High | Medium | P1 | Demo Phase 2; engine Phase 6 |
| Amazon Listing + Premium A+ Planner | High | High | Medium–High | P1 | Demo Phase 2; engine Phase 6 |
| Page Studio technical case study | High for hybrid/creative-technology roles | Medium | Medium | P1 | Phase 4/7, when evidence ready |
| Creative Review & Approval Portal | Medium | High | High | P2 | Demo Phase 2; secure engine Phase 6 |
| Full AI Listing Visual Audit | Medium–High | High | Very high | P2 | Demo Phase 2; optional full engine Phase 6 |

**Decision rule:** Prioritize a project when it can yield *independently useful career or client evidence* without delaying completed case studies, professional contact flows and basic recruitment readiness. Reassess from real visitor/client/job-application feedback every four weeks. Do not promise that features increase salary, conversion or sponsorship likelihood.

### Explicit must-protect first five priorities
1. Turn best existing work into strong, accurate and maintainable case studies.
2. Build a recruiter-first `/hire` page with verified professional proof.
3. Provide Thumbnail Tester demo immediately and a real MVP only in the activation phase.
4. Provide Brief Builder and A+ Planner demos immediately; implement and test functionality later.
5. Stabilize Page Studio, preserve access-controlled editing, and publish a technical case study only after actual functionality has been verified.

## 18. INTERNATIONAL CAREER EVIDENCE: FOUR PILLARS

Make these four **evidence pillars visible** on `/hire` and/or in a short recruiter walkthrough, sourced only from real, published work. Each pillar should have editable title, short explanation, evidence cards, media, and related links, integrated with existing CMS rather than hardcoded:

1. **Commercial design quality:** Amazon listing sequences, Basic/Premium A+ modules, product retouching, real lifestyle compositions, brand identity and advertising creatives; show large readable visuals, project role, intended marketplace and deliverable types.
2. **Strategic thinking:** problem, audience, constraints, research references, visual hierarchy, rationale for the creative sequence and design decisions; separate intended impact from actual measured results.
3. **Creative problem-solving / tool building:** demonstrate the Thumbnail Tester, Brief Builder, A+ Planner and Page Studio/Widget QA with honest statuses; document the problem solved and what the designer actually contributed.
4. **International collaboration readiness:** English project summaries, well-defined scopes, review/revision steps, handoff practices, project documents, time-zone contact preferences and availability (only if the owner enters and confirms them).

**Implementation:** Introduce a configurable `careerEvidencePillars` collection or compatible Page Studio block with `pillarId`, `title`, `summary`, `evidenceProjectIds`, `toolIds`, `media`, `sortOrder`, `isPublished`. If empty, hide rather than seed invented evidence. Give each pillar a clear CTA to relevant real project detail. A four-card section is optional; information may be embedded into the recruiter case-study flow if better UX.

### Recruiter-facing profile requirements
- Support verified roles, employment dates, location/time-zone where owner chooses, relevant skills, and real external recommendations/testimonials with permission.
- Offer **two paths**: scan fast (overview/CV) or dive deep (case study). Maintain mobile-friendly quick scan.
- Include a configurable statement of international remote/on-site/relocation interest, not a claim of employment eligibility or guaranteed visa sponsorship.
- Download CV only if a **real, uploaded and authorized CV file** exists; else show "Request CV" or contact fallback.
- Keep the primary design identity clear; position more specialized engineering/technical work under a separate project category so it does not dilute e-commerce branding.
- Provide English-first public recruiter copy and semantic page structure; optional second language only if real translations exist.

## 19. THREE-MINUTE RECRUITER PRESENTATION MODE (P1)

This was previously optional. Specify an actual buildable feature for later activation, not a fake "present" button.

### User story
A recruiter opens `/hire/presentation` or a shareable presentation URL and gets a **3-minute guided selection** of the designer's best work. Timing is an editorial goal, not a mandatory timed lock; allow pause, skip, previous/next and reading longer sections.

### Slide/step flow
1. **Identity & position (10–15 s):** professional title, one clear value statement, current region/availability only if owner confirmed.
2. **Specialization (15–20 s):** marketplace creative, A+, brand visuals, ads and verified tools.
3. **Flagship case study A (30–40 s):** challenge → approach → deliverables → evidence.
4. **Flagship case study B (30–40 s):** a different category/design approach, showing breadth.
5. **How I think (20–25 s):** research, hierarchy, product fidelity, collaboration/iteration.
6. **Creative systems and tools (20–25 s):** carefully labeled concepts vs functional tools.
7. **Professional proof (15–20 s):** real experience, skills, real testimonials (if permitted).
8. **Next step (10–15 s):** downloadable CV (if available), contact, portfolio deep-dive.

### Editable admin content and settings
- Which published case studies appear, their order, hero images and short English summary.
- Presentation title, step labels, optional duration guidance, branded cover, primary/secondary CTAs.
- `mode = recruiter | client` using a shared presentation engine. Client mode should highlight relevant service proof and enquiry rather than CV.
- Preview before publish, enable/disable route, optional non-indexed share link. Do not leak draft/unpublished material.

### Functional criteria
- Keyboard operation, screen-reader labels, mobile layout, accessible progress state, reduced-motion support.
- No autoplay audio, no timers forcing navigation, no heavy asset loading at initial page load.
- Every linked project resolves; missing projects are gracefully excluded; no broken CV or meeting links.
- Basic analytics may record presentation_open, step_advance and contact_click **without personal data**.

## 20. PAGE STUDIO: PUBLIC TECHNICAL CASE STUDY (P1)

Only publish once the work is real and inspectable; don't portray unbuilt widgets, exports, revisions or QA capabilities as finished.

**Suggested title:** `Building a Modular Page Studio for a Personal Creative Portfolio`.

**Editable case-study sections:**
1. Motivation: content, portfolio and design-system problems the creator sought to solve.
2. Constraints: existing framework, CSS, storage, permissions, live site preservation.
3. Architecture: truthful diagrams of widgets, data flow, publishing workflow and routing.
4. Component library: actual widget inventory, examples, responsiveness and shared tokens.
5. Page creation workflow: editor screenshots from an authorized sandbox with dummy data.
6. QA and reliability: the genuine Widget QA environment, test coverage, visual diff or regression checks only if implemented.
7. Accessibility: keyboard, focus, semantics, contrast, reduced-motion tests and findings.
8. Security: authenticated publishing, safe embeds, data separation, draft permissions, with no secrets/config keys shown.
9. Lessons / trade-offs: what worked, what was hard, what remains incomplete.
10. Individual contribution: explicit work ownership, code/design/QA responsibilities; no exaggerated claims.

**Proof assets (optional):** original annotated screenshots, component inventory, responsive video, before/after layout, code snippets, source repository only if safe to share, performance numbers only from actual testing.

**Acceptance:** a published case-study page with truthful metadata and at least one demonstrable technical result; editable in CMS; no disclosure of private admin paths/credentials or sensitive user/client data.

## 21. CASE-STUDY AND SERVICE-PAGE CONTENT MODELS (P0)

### Case study data model (adapt to current stack)
- `id`, `slug`, `title`, `projectType`, `industry`, `yearOrDate`, `visibility`, `featured`, `rank`.
- `clientDisplayName` only with permission; otherwise truthful category/anonymous description.
- `role`, `teamCredits`, `projectBrief`, `challenge`, `constraints`, `audience`, `research`, `strategy`, `creativeRationale`.
- `deliverables`, `processSteps`, `listingSequence`, `aPlusModules`, `visualGallery`, `comparisonAssets`, `technologyOrSoftware`.
- `outcomes`: **verified**, optional; distinguish metrics, client testimonial and reflective lessons; allow no metrics.
- `recruiterFeatured`, `clientFeatured`, `presentationEligible`, related services, related tools, next-project CTA.
- SEO metadata, alt text, publish state, updated timestamps and previous-slug redirects where feasible.

### Minimum content for flagship published case studies
- Hero with product/campaign clearly visible, short overview and exact role.
- Audience/goal and creative challenge, at least one meaningful decision explained.
- Full final imagery with context and thoughtful mobile presentation.
- Process or a real-before/after comparison when permission permits.
- Scope/deliverables and accurate project credit; lessons or evidence-backed outcomes.
- Relevant CTA to enquiry or recruiter contact.
- No dummy lorem ipsum on public flagship pages, no fake conversions, no client material without permission.

### Dedicated service page model
- Clear audience and problem; actual service scope; what is included/excluded; steps; deliverables; relevant real published projects; realistic time-estimate policy or "Request timeline"; FAQ; editable CTA and inquiry pre-selection.
- Initial service categories: Amazon Listing Images, Basic/Premium A+ Content, Brand Story/Storefront, Product Retouching, Lifestyle Visuals, Brand Identity, Performance Ads; combine categories where necessary to avoid empty thin pages.
- Distinguish professional software used from **public tools** offered in Creative Lab.

## 22. DIGITAL BUSINESS OPERATIONS / INTERNATIONAL READINESS (P1)

### Inquiry and collaboration funnel
- Two intent labels: `recruiter` and `client`, without requiring a sign-in.
- Client fields may include name/contact, service, product category, SKU count, marketplace/site links, deadline, assets-ready status and optional budget range.
- Recruiter fields may include company/role, job location/remote policy, role/job link, interview enquiry and contact details; keep input minimal.
- Explicit privacy wording, consent when needed, spam protection, validation, successful submission handling, error/retry and storage retention rules.
- Do not promise a meeting has been booked unless booking integration actually confirms it.

### Internal operational tools (build only when useful)
1. **Lead tracker:** source, date, service, stage, assigned follow-up, contact details, next action. Admin-only.
2. **Portfolio/job application tracker:** country, role, company, posting source, apply date, status, recruiter response, follow-up date and portfolio link variant. Admin-only; no inferred status changes.
3. **Proposal template:** editable deliverables, exclusions, revisions, timeline, price/currency, client approval conditions; no fake generated contract/signature.
4. **Client feedback workflow:** when activated, version-comment-approval history with authenticated workspace and permission boundaries.
5. **Template emails:** client acknowledgement, proposal follow-up, recruiter outreach, application follow-up; templates only until a real send service is configured.
6. **Resource library:** legitimate self-created icons/checklists/mockups/tutorials, asset license and version metadata; avoid unauthorized redistribution.
7. **Portfolio PDF export:** allow selected **published** projects and real CV/intro; proper print layout, accurate descriptions, licensed assets.

### Analytics/SEO
- SEO: descriptive page titles, canonical tags, OG images, sitemap, legitimate structured data, internal links; avoid duplicate thin pages or indexing raw QA fixtures.
- Privacy-conscious events: portfolio_view, case_study_open, cv_download, recruiter_contact, client_inquiry, tool_demo_open, external_tool_open. Never store private uploaded imagery or lead PII in analytics payloads.
- Evaluate monthly: genuine search visibility, page speed, published case-study coverage, real qualified inquiries and actual employer responses. Do not project guaranteed traffic or sales.
- Use a professional custom domain and mailbox when owner supplies them; never invent or configure paid accounts without authorization.

## 23. PAGE STUDIO 2.0 / WIDGET QA IMPROVEMENTS (P1–P2)

These are **enhancement candidates**, not claims about current implementation. Inspect the actual widget system first and reuse existing primitives:

| Enhancement | Function / acceptance | Priority |
|---|---|---|
| Template kits | Reusable real case-study, service, product-launch page patterns, save/load reliably | P1 |
| Global design tokens | Editable type scale, palette, spacing; changes propagate predictably to eligible widgets | P1 |
| Accessibility audit | Keyboard/focus/labels/contrast tests with actionable failure reporting, not unsupported automatic "certified" claims | P1 |
| Responsive QA | Test widgets at defined breakpoints, detect overflow and broken controls | P1 |
| Visual regression | Controlled baseline screenshots and real before/after diff reporting | P2 |
| Clean export | Reusable component/page export with documented limitations, sanitize content | P2 |
| Widget QA dashboard | Real registered-widget count, pass/fail summary, last executed test, viewport coverage; no fabricated test status | P1 |

**Security guard:** Keep test data, unpublished content and editor write controls authorized. Public QA pages must not expose sensitive project assets or administrative operations. If making `widget-qa.html` publicly accessible is unsafe, gate it or provide a read-only/redacted demonstration while preserving development workflows.

## 24. CONCRETE 90-DAY AND SIX-MONTH EXECUTION VIEW

**This calendar is a planning proposal, not a delivery promise. Codex must report actual completed changes and cannot claim future work is already done.** Adjust scope based on findings and available time, preserving Part I's initial-release requirements.

### Days 1–30 — The website must earn trust
- Audit and safely stabilize existing site/editor (Part I Phase 0).
- Make homepage navigation and relevant buttons editable, preserving design language.
- Publish/improve 4 strong **real** case studies if owner assets and facts are available; otherwise provide admin templates with truthful drafts, not fake showcases.
- Create the recruiter `/hire` and service/client `/studio` journeys, CV/contact safeguards.
- Implement Creative Lab catalog and **all 12 individualized concept demos** with correct status.
- Implement admin editing for all 12 tools, live URLs, demo links, CTA labels, visibility and ordering.
- Set up basic SEO, media optimization, form verification and analytics only where configured.

### Days 31–60 — Reusable creative system
- Activate a low-risk mini tool first, such as Design Handoff Checklist or Image Size Checker, with tests.
- Build and verify Thumbnail Tester MVP if the initial demo and core site are stable.
- Launch genuine Creative Brief Builder MVP or structured downloadable sample, if feasible.
- Publish Page Studio technical case study once verified evidence exists.
- Improve recruiter/client presentation experiences, add original legitimate resources.

### Days 61–90 — Proof and conversion
- Add A+ Planner MVP with structured modules and duplicate-content checks if feasible.
- Add recruiter 3-minute presentation mode, actual case-study selection from CMS.
- Add internal lead/application trackers only if a real operational need is established.
- Review applicant/client feedback, tool use and mobile issues; improve weakest user journeys.
- Avoid building full AI Visual Audit and full multi-user Client Portal ahead of validated demand.

### Month 4 — Recruiter and client outreach system
- Refine English case studies and interview-friendly project summaries.
- Deploy genuine job-application tracker / qualified-lead tracker only if needed.
- Strengthen services and creative process documentation, relevant published testimonials with permission.

### Month 5 — Collaboration evidence
- Publish measured process case studies showing genuine project revision/handoff.
- Expand tested tooling only if it demonstrably speeds up work or brings qualified contacts.
- Keep recruiter outreach, interview practice and remote client outreach outside core site development unless owner explicitly requests automations.

### Month 6 — Iterate from real outcomes
- Audit most-viewed projects and usage of real tools; refine content and UX.
- Improve responsive performance, accessibility and operational reliability.
- Decide whether to validate higher-complexity Visual Audit or Approval Portal based on real client needs, resource/security costs and existing traction.

## 25. ADDED ACCEPTANCE TESTS FOR V2

- [ ] Four career evidence pillars can render from *real, published* project/tool references, without invented proof.
- [ ] Recruiter page has clear quick-scan path, credible experience, relevant case studies, working CV/contact fallback.
- [ ] Client page has relevant services, proof, and functional inquiry entry point.
- [ ] Flagship case-study data supports challenge, rationale, role, actual deliverables, privacy/credit and verified outcomes or no metrics.
- [ ] Service page CTAs are editable and can preselect the service in a legitimate inquiry form.
- [ ] A separate Page Studio technical case-study template and evidence checklist exist; it isn't auto-published without real evidence.
- [ ] Presentation Mode, if activated, reads selected *published* projects only, works on mobile/keyboard, and never exposes unpublished content.
- [ ] Page Studio token/QA/test improvements are described as implemented only after actual test evidence.
- [ ] Any CRM, job tracker, proposals or PDF export feature has real persistence/functionality before labeled `live`.
- [ ] Development results distinguish completed public pages, honest previews, real mini tools, and full-featured production systems.
- [ ] Every CTA, including recruiter/client actions, has an editable destination or safe internal fallback.

### Revised instruction for Codex — first run

> Read Parts I and II. First inspect the repository and actual CMS. Complete or verify Part I Phases 0–3 (all 12 individualized concept demos and durable admin editing) without harming existing features. Then implement the highest-value Page Studio-compatible career/studio improvements in Part II: accurate case-study templates, recruiter `/hire`, client `/studio`, and clear public trust signals. Treat presentation mode, advanced widgets, the tools' actual engines and AI/client portals as separately staged deliverables. For every phase, provide exact file changes, tested routes, screenshots if available, limitations, and what remains planned. Never claim a feature is operational based only on its mockup or editable demo link.
