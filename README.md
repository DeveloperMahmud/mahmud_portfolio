# Mahmudul Hassan Portfolio V2

A dark editorial portfolio and production CMS for Mahmudul Hassan, positioned as a Visual Designer, E-commerce Designer, and Art Director. The existing vanilla frontend, Express 5 API, Prisma, and PostgreSQL architecture is preserved.

For versioned implementation notes, compatibility details, verification results, and rollback references, see [CHANGELOG.md](CHANGELOG.md).

## Editorial featured slider

The existing featured slider now uses an editorial left/media/right composition while retaining CMS ordering, project URLs, autoplay, swipe, keyboard controls, and every primary transition (`AUTO`, `MASK`, `DIAGONAL`, `SPLIT`, `CURTAIN`, `ZOOM`, `SLIDE`). Its progress line represents the active slide index across enabled slides.

Reflection is a secondary one-shot image effect. Defaults are subtle, left-to-right, 22% width, -14°, 1100 ms duration, and 320 ms delay. It is off on mobile by default and always disabled for reduced-motion users. Global settings and per-project inheritance/on/off controls live in the existing Featured Slider CMS screen; old records use safe defaults.

Before release, apply additive migration `0020_editorial_featured_slider`, then run `npm run test:slider`, `npm run typecheck`, and `npm run build`.

## Local setup

For the complete GitHub → Vercel production procedure, environment-variable inventory, Blob/PostgreSQL provisioning, rollback, and troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md) and [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md).

1. Install Node.js 20 or newer and PostgreSQL.
2. Copy `.env.example` to `.env` and provide a local `DATABASE_URL` and long random `JWT_SECRET`.
3. Run `npm install`.
4. Run `npx prisma generate`.
5. Apply migrations with `npm run prisma:migrate` for local development.
6. Create the first administrator with `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then run `npm run db:seed`.
7. Start the app with `npm run dev` and open `http://localhost:8787`.

Before releasing, run:

```bash
npm run typecheck
npm run build
```

## CMS overview

The CMS at `/admin.html` controls projects, independent homepage and featured-slider placement, modular project blocks, verified project result metrics, privacy-focused first-party analytics, journal content, brands, testimonials, the media library, homepage section order, structured hero/capability/navigation/footer/About content, inquiries, SEO, skills, slider behavior, and site settings.

Project blocks remain backward compatible: projects without blocks use the original challenge/approach/process/gallery layout. New blocks support text, image layouts, galleries, video, before/after, design decisions, design systems, quotes, results, metrics, deliverables, credits, spacers, dividers, and allowlisted embeds.

Demo projects appear only when `ENABLE_DEMO_CONTENT=true` and no published CMS projects exist. Keep this false in production.

## Media providers and quota

Production storage preference is:

1. Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured.
2. Existing S3-compatible storage when its variables are configured.
3. Existing GitHub media storage when its variables are configured.
4. The local uploads folder during development.

`MEDIA_STORAGE_QUOTA_BYTES` defaults to 1 GB. It is an application display/management threshold, not provider capacity. At 70%, 85%, and 95%, the CMS reports notice, warning, and critical states. Uploads continue over the threshold unless `STRICT_STORAGE_QUOTA=true`. Duplicate files are detected by SHA-256 checksum, and referenced assets are protected from normal deletion.

## Environment variables

Required in production:

- `DATABASE_URL`: serverless-compatible PostgreSQL connection string.
- `JWT_SECRET`: long random secret; production refuses insecure fallback behavior.
- `APP_ORIGIN`: optional explicit public origin. If omitted on Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is used automatically.

Recommended:

- `BLOB_READ_WRITE_TOKEN`
- `MEDIA_STORAGE_QUOTA_BYTES=1073741824`
- `STRICT_STORAGE_QUOTA=false`
- `ENABLE_DEMO_CONTENT=false`
- `MAX_UPLOAD_BYTES=25000000`

Optional inquiry delivery and abuse protection:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `INQUIRY_NOTIFICATION_EMAIL`
- `TURNSTILE_SECRET_KEY`

The legacy S3-compatible and GitHub provider variables remain supported as documented in `.env.example`.

## Analytics and verified project metrics

Analytics is disabled by default. To enable it, set `ANALYTICS_ENABLED=true` and provide a separate random `ANALYTICS_SALT` of at least 16 characters. `ANALYTICS_TRACK_LOCAL=false` keeps localhost activity out of reports; temporarily set it to `true` only when testing collection. `ANALYTICS_RETENTION_DAYS=365` controls the cutoff used by the confirmed cleanup action. Reports currently use UTC boundaries.

Tracked event types are page and project views, useful CTA/contact/form interactions, successful inquiry submissions, external project links, slider/next-project actions, social/CV clicks, and bounded engagement time. Event properties are allowlisted. The system does not store raw IP addresses, full referrer URLs, query strings, form contents, cookies, or arbitrary client JSON. Anonymous browser and session identifiers are generated first-party, expire or end with the browser session, and are stored only as salted hashes on the server. Do Not Track and Global Privacy Control are respected. Admin, preview/share, health, local-by-default, and obvious bot traffic are excluded.

The Analytics screen supports 7, 30, 90, and custom date ranges up to 366 days, previous-period comparisons, traffic tables/charts, projects, pages, sources, devices, countries, and the inquiry funnel. Conversion rate is successful saved inquiries divided by unique anonymous visitors for the selected range. Counts are directional first-party measurements, not audited business results; blockers, disabled JavaScript, privacy signals, deleted data, and bot filtering can reduce counts. The report endpoint caps a response at 100,001 events and clearly marks a partial result so an administrator can narrow the range. Daily aggregates can be rebuilt manually.

Project result metrics are a separate editorial system. Add them under **Results & Metrics**, include a private source/reference, and mark both **Verified** and **Publicly visible** before they can appear in a public METRICS block. Public APIs return at most six and never return the private source/reference. Analytics never infers or creates business outcomes.

To disable collection safely, set `ANALYTICS_ENABLED=false`; existing reports remain inaccessible until re-enabled. Use the confirmed cleanup action to remove records older than the retention period. If an external analytics provider is added later, keep its consent/privacy configuration and data model separate from verified project outcomes.

## Free Vercel Deployment

Vercel plan limits and commercial-use terms can change; verify the current plan, Blob, bandwidth, and function allowances before launch.

1. Push this repository to GitHub. Use `main` as production unless the repository already uses another branch.
2. Sign in to Vercel and import the GitHub repository.
3. Confirm the production branch and keep the existing `vercel.json` configuration.
4. Add `DATABASE_URL`, `JWT_SECRET`, and any optional variables in Vercel project settings.
5. Provision or connect an external PostgreSQL database. Do not use Vercel's filesystem for database storage.
6. Create or connect a Vercel Blob store and expose its `BLOB_READ_WRITE_TOKEN` to the project when production media uploads are required.
7. Configure Resend only if inquiry emails are wanted. Saved inquiries work without it.
8. Apply migrations safely with `npm run prisma:deploy` against the production database. Never run a destructive reset.
9. Deploy. Vercel assigns a free `https://<project-name>.vercel.app` URL.
10. Set `APP_ORIGIN` only when an explicit override is needed. Otherwise the app derives the assigned production URL from `VERCEL_PROJECT_PRODUCTION_URL` for canonicals, Open Graph URLs, sitemap entries, share links, and CORS.

A later custom domain requires configuration only. Project, media, and CMS records do not contain a hardcoded Vercel domain.

## SEO, GEO and indexing workflow

The protected **SEO & Visibility** area manages global defaults, page SEO guidance, the factual Entity Profile, generated structured-data previews, sitemap status, redirects, crawler policy, bounded health audits, Search Console state, and first-party AI referral reports. Project and journal editors include title/description fallbacks, Open Graph overrides, canonical controls, index/follow directives, sitemap inclusion, and an editorial focus topic. These controls improve technical clarity and discovery; they do not guarantee rankings, rich results, inclusion, or AI citations.

Public HTML responses contain server-visible title, description, canonical, robots, Open Graph, X/Twitter, and JSON-LD metadata. Homepage structured data uses one `WebSite` and one stable Entity Profile `Person` ID; projects reference it from `CreativeWork`, and articles reference it from `BlogPosting`. Structured data must match visible content. `/sitemap.xml` includes only published, public, indexable canonical pages and meaningful modification dates. `/robots.txt` references the sitemap and keeps admin, API, and private-share paths out of crawl directives; authentication—not robots.txt—protects private data.

Published project/article slug changes create a 301 redirect from the previous clean path. The Redirect Manager rejects protected source paths, self-redirects, unsafe protocols, and direct two-rule loops. When `INDEXNOW_KEY` is set, publishing or significantly updating an indexable project/article submits a deduplicated, bounded, non-blocking IndexNow notification and exposes the required root key file. Submission failure never blocks saving or publishing.

Search Console is optional. Configure all four `GOOGLE_SEARCH_CONSOLE_*` variables to enable official Search Analytics requests; otherwise the CMS shows an unconfigured state while metadata, redirects, sitemap, structured data, and audits continue working. Disconnect by removing those variables—no portfolio or analytics records are deleted. Search Console reporting is delayed and is not expected to equal first-party sessions.

Crawler controls distinguish Googlebot, Bingbot, `OAI-SearchBot` for search discovery, and `GPTBot` for model-training preference. Allowing a crawler does not guarantee inclusion or citation. AI Referrals classifies known referral hosts from the privacy-protected analytics event store; hidden/direct referrers cannot be attributed, and referral traffic is not citation tracking. Optional `/llms.txt` is available only with `LLMS_TXT_ENABLED=true`; it lists public canonical content and is not a ranking mechanism.

Run a bounded SEO audit from **SEO & Visibility → Health**. It checks missing/duplicate metadata, sitemap/noindex conflicts, missing social images and alt text, and thin published content. External launch QA should still use Search Console URL Inspection and structured-data validation against the deployed URL.

## Responsive and accessibility system

The public site and entire CMS use content-driven breakpoints around 374, 767, 1023, and 1440 pixels, with fluid sizing above and between them. The supported QA matrix is 320×568, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900, and 1920×1080, plus landscape mobile and 200% zoom. Public navigation includes focus containment/restoration, skip links, 44px touch targets, safe-area spacing, reduced-motion behavior, responsive media and bounded editorial headings. Admin navigation becomes a touch-scrollable compact bar; editors, analytics, SEO tools, media, tables, dialogs, forms, and action groups reflow without hiding important actions. Wide tables intentionally scroll inside labeled containers instead of forcing page-level horizontal overflow.

## Admin bootstrap and security

Use temporary `ADMIN_EMAIL` and `ADMIN_PASSWORD` values only for the first seed, then remove them from the deployed environment and change the password in the CMS. Sessions use secure, HTTP-only cookies in production. Login and inquiry endpoints are rate-limited, cookie-authenticated mutations enforce same-origin requests, uploads validate image MIME/size, and production requires `JWT_SECRET`.

## Database changes

Migration `0016_portfolio_v2` is additive. It adds homepage section configuration, independent homepage/slider project presentation, modular project blocks, richer brand/site/inquiry fields, inquiry activity, and media checksum/quota metadata without deleting existing records. Migration `0017_analytics_metrics` introduces anonymous analytics events, daily aggregates, and verified project result metrics. Migration `0018_seo_geo_responsive` adds typed SEO settings, Entity Profile, redirects, audit findings, IndexNow status, page SEO controls, relationships, and media credits. Migration `0019_operations_reliability` adds revisions, backup records, health checks, redacted error incidents, email delivery attempts, secure previews, recoverable deletion, media organization and nullable CRM fields. All preserve existing records and require `npm run prisma:deploy` in production.

## Operations, reliability and recovery

The protected **System Health & Recovery** workspace now contains honest service health, checksummed portable exports, validation and non-destructive restore, revision history, trash/recovery, secure draft preview, media maintenance, lead/email delivery states, content-quality checks, accessibility guidance and release readiness. Project and journal editors also include device-local crash recovery with explicit save state; recovery never auto-publishes.

See [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md) for backup boundaries, provider-level recovery, monitoring redaction, media replacement, inquiry privacy, release/migration commands, rollback limitations and optional features intentionally left disabled.
