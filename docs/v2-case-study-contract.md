# V2 Case-study Content Contract

Status: verified architecture contract for P1-005  
Scope: commercial portfolio case studies, technical case studies, recruiter/client experiences, and Page Studio consumers

## 1. Source of truth

`Project` remains the only canonical case-study record. V2 must not add a parallel `CaseStudy` table or copy project narratives into Page Studio.

- The public detail route remains `/work/:slug`.
- The Project CMS remains the authoring surface for project facts, media, outcomes, SEO, visibility, and publication state.
- Page Studio may select or present projects by stable project ID/slug, but it must resolve current published Project data at render time.
- Homepage, `/hire`, `/studio`, service pages, tool detail pages, and reusable Page Studio widgets are consumers of Project data, not additional stores.
- Existing project records and URLs must remain valid throughout V2.

## 2. Existing field map

No database migration is required for the initial case-study upgrade. The existing model already covers the required contract.

| Case-study concern | Canonical fields | Notes |
| --- | --- | --- |
| Identity and routing | `id`, `title`, `slug`, `category`, `service`, `type` | `slug` stays unique and published slug changes create redirects. |
| Context | `client`, `industry`, `year`, `projectSubtitle`, `description` | NDA-safe client labels such as “Confidential consumer brand” are allowed. |
| Contribution | `role`, `credits`, `tools` | State personal contribution clearly; credits distinguish collaborators. |
| Narrative | `challenge`, `approach`, `process`, `results` | Preserve the current fields as a readable fallback when modular blocks are absent. |
| Deliverables | `deliverables`, `liveUrl` | A case study must identify what was actually delivered. |
| Evidence media | `coverImage`, `gallery`, `projectBlocks` | Gallery items carry alt text; modular blocks support long-form evidence. |
| Outcomes | `results`, `resultMetrics` | Quantitative claims use ProjectMetric verification and private source notes. |
| Modular storytelling | `projectBlocks` | Existing block types cover text, media, decisions, systems, results, metrics, deliverables and embeds. |
| Homepage/editorial use | `featured`, `showOnHomepage`, `homepage*`, `slider*`, `sortOrder` | Presentation overrides do not replace the canonical narrative. |
| Publication | `status`, `scheduledAt`, `publicModifiedAt`, `deletedAt` | Draft/published/archive and soft-delete behavior are preserved. |
| Privacy | `visibility`, `clientOnly`, `clientExpiresAt`, `accessTokenHash` | Public routes exclude private/client-only records; expiring share links remain separate. |
| SEO | `seoTitle`, `seoDescription`, `og*`, `canonicalUrl`, `noIndex`, `noFollow`, `includeSitemap`, `focusTopic` | Existing `/work/:slug` metadata and sitemap behavior remain canonical. |
| Discovery | `relatedProjectIds`, `relatedContentIds`, `nextProjectId` | Future related-work navigation uses existing IDs, not copied records. |

Implementation anchors:

- Data model: `prisma/schema.prisma` (`Project`, `ProjectMetric`).
- Validation and persistence: `src/routes/admin.ts` (`projectV2Schema`, project create/update routes).
- Publish safety: `src/lib/publish-safety.ts`.
- Public APIs and privacy filters: `src/routes/public.ts`.
- SEO route: `src/app.ts` (`/work/:slug`).
- Public renderer: `portfolio/project.js`.
- Page Studio dynamic data: `src/routes/page-studio.ts` and `src/routes/page-studio-public.ts`.
- CMS authoring: `portfolio/admin.html`, `portfolio/admin.js`, `portfolio/admin-addendum.js`.

## 3. Case-study profiles

### 3.1 Commercial flagship

A commercial flagship is suitable for client and recruiter journeys when it has:

1. a non-placeholder title, category, slug, and concise overview;
2. an explicit role and, when relevant, collaborator credits;
3. business or communication context (`client`/NDA-safe label, industry, service, or audience);
4. a real challenge and an approach or process;
5. at least one concrete deliverable;
6. at least one useful visual with descriptive alternative text when it conveys content;
7. an honest outcome. Qualitative outcomes are valid; a numeric claim is never required;
8. no lorem ipsum, fabricated client, fabricated testimonial, or fabricated performance claim.

Recommended long-form order: overview → context/challenge → role → process/decisions → evidence → deliverables → outcome → credits/related work.

### 3.2 Technical case study

A technical case study (including Page Studio) uses the same Project source of truth and should add modular blocks for:

1. problem and constraints;
2. architecture or system boundary;
3. personal contribution and responsibilities;
4. implementation workflow and important decisions;
5. QA, accessibility, performance, security, or release evidence;
6. limitations, trade-offs, and next steps;
7. outcome without overstating business impact.

Technical work stays in an appropriate category/service so it does not dilute the primary Amazon/e-commerce and brand positioning.

## 4. Outcome and metric integrity

`ProjectMetric` is the only structured quantitative-outcome source.

- A metric can appear publicly only when both `verified` and `visible` are true.
- `sourceNote` is CMS-only evidence/context and must never be returned by public APIs.
- `publicNote` may explain methodology or scope without revealing private evidence.
- Before/after values must describe the same measure and comparable scope.
- Estimates, concept scores, and demonstration values must be labeled as such; they are not client results.
- A qualitative result in `results` is preferred over an unsupported number.
- Public widgets may select metric IDs, but they resolve current verified/visible metrics from the Project record.

## 5. Privacy and publishing

- Public discovery requires `status=PUBLISHED`, `visibility=PUBLIC`, `clientOnly=false`, no soft deletion, and a satisfied schedule.
- `UNLISTED`, `PRIVATE`, and `clientOnly` records must not appear in public archives, Page Studio dynamic lists, sitemap, recruiter/client collections, or `llms.txt`.
- Token previews and client shares remain `noindex`, private/no-store experiences.
- NDA-safe copy must omit confidential names, unreleased media, private data, and unsupported claims.
- Placeholder/demo projects may exist only when clearly labeled `DEMO`/concept and must not masquerade as client work.
- Published slug changes retain the existing automatic redirect behavior.

## 6. Roles and workflow

The existing RBAC policy remains authoritative:

- `ADMIN`: full project, publication, security, and system control.
- `EDITOR`: project editing and publication within existing allowed CMS scopes.
- `WRITER`: may create/edit drafts only; the middleware forces draft status and blocks delete, bulk publish, and share links.
- `MODERATOR`: does not author/publish projects; it manages leads, testimonials, and review workflows.
- `VIEWER`: read-only where explicitly allowed.

All material Project updates continue to create revisions. Publishing must run the existing publish-safety checks; later implementation may strengthen those checks additively to match this contract.

## 7. Page Studio integration rules

1. Project-backed widgets store only selection/presentation settings (for example `projectIds`, limit, order, layout, CTA label).
2. They must not persist copied title, client, narrative, metric, or image data as a second source of truth.
3. At render time, only public, published, non-client-only projects are resolved.
4. Missing, private, archived, or deleted selections fail closed and render an honest empty state in the editor.
5. Editor previews may show draft data only through authenticated preview endpoints; production snapshots cannot bypass Project publication/privacy rules.
6. Reusable blocks may compose Project-backed widgets but cannot publish a private project by embedding copied JSON.
7. Project content edits happen in the Project CMS; Page Studio controls placement and presentation.

## 8. Verified gaps and implementation sequence

The architecture is sufficient, but later phases must close these product gaps:

1. Strengthen `projectPublishIssues` so flagship publication can require role, challenge/context, deliverable, evidence media/alt, and an honest outcome profile without breaking ordinary drafts.
2. Replace the raw Project block JSON editor with guided field controls while preserving the stored block shape.
3. Add project selectors to relevant Page Studio widgets so they store stable IDs instead of copied project content.
4. Build curated recruiter/client project collections from the canonical Project records.
5. Upgrade four to six real selected projects; demo content is not a substitute for this editorial work.
6. Add automated contract tests for public privacy filters, metric redaction, and Page Studio project resolution as those implementations land.
7. Unify a dedicated public Project DTO and add the missing schedule gate to the direct `/work/:slug` HTML route and authenticated Page Studio preview query.
8. Tighten `/llms.txt` eligibility so deleted, future-scheduled, excluded, private, or client-only work cannot be indexed.
9. Define `clientExpiresAt` consistently as share/preview expiry rather than general public eligibility.
10. If recruiter/client curation and client-name governance require database filtering, use one narrow additive migration for audience and disclosure/permission fields; do not duplicate narrative content.

These are additive implementation tasks. They do not justify a new case-study table or destructive migration.

## 9. P1-005 acceptance matrix

| Acceptance criterion | Evidence | Result |
| --- | --- | --- |
| Supports role, challenge, process, deliverables and outcomes | Existing `Project` fields and CMS/API mappings | PASS |
| Supports structured, evidence-led long-form cases | `projectBlocks`, gallery, ProjectMetric, public renderer | PASS |
| Preserves existing project data and URLs | One Project source; `/work/:slug`; no migration required | PASS |
| Prevents Page Studio duplication | Reference-and-resolve rules in section 7 | PASS |
| Defines honest quantitative evidence | verified/visible metric policy; private `sourceNote` | PASS |
| Covers privacy and NDA-safe publishing | existing visibility/client-only/share mechanisms plus section 5 | PASS |
| Covers commercial and technical case studies | profiles in section 3 | PASS |
| Identifies verified gaps without claiming implementation | section 8 | PASS |
