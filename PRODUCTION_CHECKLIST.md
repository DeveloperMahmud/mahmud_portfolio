# Production Deployment Checklist

## Release gate

- [ ] Exact project is committed to Git; `git status` is clean.
- [ ] GitHub remote and existing production branch are confirmed.
- [ ] No `.env`, `.vercel`, local uploads, database dumps, OAuth files, tokens, or secrets are tracked.
- [ ] `npm ci`, `npx prisma generate`, `npm run typecheck`, `npm run build`, `npm run test:operations`, and `npm run test:slider` pass.
- [ ] All migrations are reviewed; no pending production migration is destructive.
- [ ] A current checksum-bearing content backup was downloaded and PostgreSQL provider backup/PITR was verified.
- [ ] Production `DATABASE_URL`, `JWT_SECRET`, and `BLOB_READ_WRITE_TOKEN` exist as server-only Vercel variables.
- [ ] `ENABLE_DEMO_CONTENT=false`, `MEDIA_STORAGE_QUOTA_BYTES=1073741824`, and `STRICT_STORAGE_QUOTA=true` are set.
- [ ] Admin account exists and does not use a default or temporary password.
- [ ] Preview deployment passed the checks below using isolated/non-production integrations.

## Preview deployment QA

- [ ] `/api/health`, homepage, primary navigation, archive, journal, 404 and published project routes load.
- [ ] Editorial slider works at desktop/tablet/mobile widths; all configured primary transitions remain available; reflection is one-shot and reduced-motion-safe.
- [ ] Project Builder blocks, gallery/video content, metadata, canonical, Open Graph, JSON-LD, sitemap and robots are correct.
- [ ] Admin login/logout, secure cookie, project save/publish, homepage and slider settings work.
- [ ] Media Library uploads an image under 4 MB to the preview Blob store; progress, quota, metadata, selection, reference scan, replace and trash behavior work.
- [ ] Inquiry is stored. Email state accurately reports sent/pending/unconfigured and uses only a safe preview recipient.
- [ ] Analytics view/change/open events are bounded; admin/share/preview traffic is excluded.
- [ ] Secure preview tokens expire/revoke and return noindex/private-cache headers.
- [ ] Backup export, validation/dry-run, revisions, trash, System Health and error incident views work.
- [ ] Layout is usable at 320×568, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×800, 1440×900 and 1920×1080; keyboard and 200% zoom remain usable.

## Migration and production deployment

- [ ] `npx prisma migrate status` targets the intended production database.
- [ ] `npx prisma migrate deploy` succeeds; never run reset.
- [ ] Production branch is pushed/merged and Vercel deployment succeeds.
- [ ] Actual `.vercel.app` URL is recorded; `APP_ORIGIN` is updated to it and the site redeployed.
- [ ] `SMOKE_BASE_URL` is set to the real URL and `npm run test:smoke` passes without the data-unavailable override.

## Post-deployment QA

- [ ] `/api/health` is healthy and authenticated System Health accurately reports database, Blob, email, analytics, SEO, monitoring and backups.
- [ ] Homepage, navigation, featured slider, archive, projects, journal, images and videos work over HTTPS.
- [ ] Only published/public/non-client projects appear publicly.
- [ ] Canonicals, Open Graph URLs, structured data, sitemap and robots use the real production origin.
- [ ] Inquiry storage works; email provider state is honest; rate limiting and Turnstile (if configured) are active.
- [ ] Admin cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, path `/`; protected API calls reject unauthenticated/cross-origin requests.
- [ ] Blob upload/select/replace/trash/delete works with a disposable image below 4 MB; no durable write targets the Vercel filesystem.
- [ ] Analytics collects public events and excludes admin/share/preview traffic.
- [ ] Search Console verification and optional IndexNow status are correct.
- [ ] Error pages/responses expose no stack traces or secrets; monitoring receives a redacted test incident when enabled.
- [ ] Backup export checksum validates; restore controls are visible but no production restore is performed for routine QA.

## Ongoing monitoring

- [ ] Monitor Vercel function usage, duration, errors and the 4.5 MB request/response ceiling.
- [ ] Monitor Blob provider storage, transfer and operation usage separately from the 1 GiB application quota.
- [ ] Monitor PostgreSQL storage, compute, connection usage, backups and PITR retention.
- [ ] Review failed email deliveries, unresolved incidents, analytics retention and revision/backup expiry.
- [ ] Rotate JWT, analytics salt, OAuth credentials, Blob token and email keys after suspected exposure.
