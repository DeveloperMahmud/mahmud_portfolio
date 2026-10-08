# Production Deployment — GitHub, Vercel, PostgreSQL and Vercel Blob

This guide deploys the existing Portfolio V2 architecture without replacing its Express API, Prisma/PostgreSQL data, CMS, analytics, SEO, operations, or editorial slider.

## Deployment architecture

```text
GitHub main branch
  -> Vercel Node.js Function (api/index.ts)
  -> bundled portfolio static assets
  -> serverless-compatible PostgreSQL through DATABASE_URL
  -> public Vercel Blob media through BLOB_READ_WRITE_TOKEN
```

The application does not depend on durable Vercel filesystem writes in production. Database content stays in PostgreSQL, media stays in Blob, and backup exports are streamed/downloaded or stored as protected database records. Local filesystem media remains a development-only fallback. S3 and GitHub media adapters remain available for backward compatibility but are not part of this target deployment.

## Exact Vercel project settings

- Import the GitHub repository into Vercel.
- Production branch: `main` (or the repository's already-established production branch).
- Root Directory: repository root—the directory containing `package.json` and `vercel.json`.
- Framework Preset: Other.
- Install Command: `npm ci`.
- Build Command: `npm run vercel-build`.
- Output Directory: leave empty; the Node function serves the bundled `portfolio/` assets.
- Node.js: 20.x or 22.x. The package accepts supported Node versions from 20 through 24.
- Function entry: `api/index.ts` through Vercel's built-in Node.js runtime.
- Function duration: 60 seconds. Normal public/API requests should finish far sooner.

`vercel.json` is the source of truth for these settings. Do not add a static output directory or start a permanently running Express process.

## Environment-variable inventory

No variable below is safe for client-side exposure unless explicitly noted. This project uses no `VITE_`, `NEXT_PUBLIC_`, or other public-secret prefix.

### Core application

| Variable | Requirement and scope | Source | Missing behavior |
|---|---|---|---|
| `NODE_ENV` | Platform-managed; local/preview/production | Vercel/runtime | Vercel supplies it; local defaults to development behavior |
| `PORT` | Optional, local only | Local choice | Uses `8787` |
| `APP_ORIGIN` | Recommended for production; optional when Vercel production URL is available | Actual `https://…vercel.app` URL after first production assignment | Canonicals fall back to `VERCEL_PROJECT_PRODUCTION_URL`, then localhost outside Vercel |
| `ENABLE_DEMO_CONTENT` | Required policy setting; set `false` in preview/production | Owner | Demo records can appear only when explicitly `true` and no projects are returned |

Vercel automatically supplies `VERCEL`, `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_BRANCH_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_GIT_COMMIT_SHA`. Do not add them manually.

### Database

| Variable | Requirement and scope | Source | Missing behavior |
|---|---|---|---|
| `DATABASE_URL` | Required, server-only, all environments | Vercel Marketplace PostgreSQL integration or provider dashboard | Application startup fails safely |

Use a serverless-compatible pooled PostgreSQL connection string with SSL, such as a Marketplace Neon, Supabase, Prisma Postgres, or compatible provider URL. Vercel's legacy first-party Postgres product is no longer provisioned for new projects. Keep preview and production databases or schemas separate when preview QA can write data.

### Authentication

| Variable | Requirement and scope | Source | Missing behavior |
|---|---|---|---|
| `JWT_SECRET` | Required, sensitive, server-only, preview and production; at least 32 random characters | Secure password/secret generator | Production startup fails safely |
| `ADMIN_EMAIL` | Bootstrap/seed only; server-only | Owner-selected admin email | Seed command refuses to run |
| `ADMIN_PASSWORD` | Bootstrap/seed only; sensitive | Owner-selected unique password | Seed command refuses to run |

Generate the JWT value locally without displaying it in shell history where practical, then save it in Vercel → Project Settings → Environment Variables as a Sensitive value for Production and a different value for Preview. Never commit it. Admin bootstrap is an explicit one-time `npm run db:seed`; the deployment does not auto-create or overwrite an administrator.

### Storage and media

| Variable | Requirement and scope | Source | Missing behavior |
|---|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Required for this Vercel production target; sensitive, server-only | Vercel Blob store connected to the project | Production startup fails safely |
| `MAX_UPLOAD_BYTES` | Optional; local/server upload policy | Owner, default `25000000` | Defaults to 25 MB; Vercel runtime is capped by code at 4,000,000 bytes |
| `MEDIA_STORAGE_QUOTA_BYTES` | Required policy setting; recommended `1073741824` initially | Owner | Defaults to 1 GiB application-accounted usage |
| `STRICT_STORAGE_QUOTA` | Required policy setting; `true` recommended for production | Owner | Over-quota uploads warn but are not blocked |

Blob media is public because portfolio images must be directly readable. The write token never reaches browser code. Upload, delete, and replace endpoints require the signed admin cookie. File type, maximum size, duplicate checksum, quota, references, and safe replacement are checked server-side. Vercel Functions have a 4.5 MB request limit, so this deployment accepts server-uploaded originals up to 4,000,000 bytes. Compress larger source assets before upload. The application quota is independent from the provider plan's current storage, transfer, and operation limits.

Legacy optional adapters actually used by the code are `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `GITHUB_MEDIA_DIR`, and `GITHUB_PUBLIC_BASE_URL`. Leave them empty for the Vercel Blob deployment.

### Email and inquiry protection

| Variable | Requirement and scope | Source | Missing behavior |
|---|---|---|---|
| `RESEND_API_KEY` | Optional, sensitive, server-only | Resend | Inquiry is stored; notification is marked not configured/pending |
| `RESEND_FROM_EMAIL` | Required when Resend is enabled | Verified Resend sender/domain | Email integration remains unavailable |
| `RESEND_FROM_NAME` | Optional | Owner | Uses site/portfolio name |
| `INQUIRY_NOTIFICATION_EMAIL` | Optional override | Owner | CMS inquiry recipient/public contact setting is used |
| `EMAIL_RETRY_MAX_ATTEMPTS` | Optional, 1–5 | Owner | Defaults to 3 |
| `TURNSTILE_SECRET_KEY` | Strongly recommended, sensitive | Cloudflare Turnstile | Honeypot, link limit, and rate limiting remain; Turnstile is skipped |

### Analytics

| Variable | Requirement and scope | Source | Missing behavior |
|---|---|---|---|
| `ANALYTICS_ENABLED` | Optional; set `true` to enable | Owner | Collection is disabled |
| `ANALYTICS_SALT` | Required when analytics is enabled; sensitive, 16+ random characters and different from JWT | Secret generator | Analytics stays disabled |
| `ANALYTICS_RETENTION_DAYS` | Optional | Owner/privacy policy | Defaults to 365 |
| `ANALYTICS_TRACK_LOCAL` | Optional, local only | Owner | Local traffic is excluded |

### SEO and indexing

| Variable | Requirement and scope | Source | Missing behavior |
|---|---|---|---|
| `GOOGLE_SITE_VERIFICATION` | Optional, server-only configuration | Google Search Console | Can instead be stored in CMS SEO settings |
| `BING_SITE_VERIFICATION` | Optional | Bing Webmaster Tools | Can instead be stored in CMS SEO settings |
| `INDEXNOW_KEY` | Optional, sensitive-ish server configuration | Generate a random key and register through IndexNow-compatible tooling | Publishing does not notify IndexNow; sitemap remains available |
| `SEO_AUDIT_ENABLED` | Optional | Owner | Audit is enabled unless set `false` |
| `LLMS_TXT_ENABLED` | Optional experimental endpoint | Owner | `/llms.txt` returns 404 |

### Search Console

All four are optional, sensitive, server-only, and needed together: `GOOGLE_SEARCH_CONSOLE_CLIENT_ID`, `GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET`, `GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN`, and `GOOGLE_SEARCH_CONSOLE_PROPERTY`. Obtain them from a Google Cloud OAuth client and Search Console property. Without the complete set, the CMS reports Search Console as unconfigured while sitemap, metadata, and structured data continue working.

### Error monitoring

| Variable | Requirement and scope | Source | Missing behavior |
|---|---|---|---|
| `ERROR_MONITORING_ENABLED` | Optional | Owner | External forwarding and incident persistence are disabled |
| `SENTRY_DSN` | Required only when monitoring is enabled; server-only | Sentry project | Incidents are not forwarded |
| `SENTRY_ENVIRONMENT` | Optional | Deployment name | Uses Vercel/runtime environment |
| `SENTRY_RELEASE` | Optional | Release identifier | Uses Vercel Git commit SHA where available |

The monitoring adapter redacts credential and personal-data fields before persistence/forwarding. It is provider-neutral and does not claim delivery when forwarding fails.

### Backup and retention

`BACKUP_EXPORT_ENABLED` (default true), `BACKUP_RETENTION_DAYS` (default 30), and `REVISION_RETENTION_COUNT` (default 50) are optional server policies. Backups include database content and a media manifest, not Blob binary files. Provider-level PostgreSQL backups/PITR and Blob retention remain separate responsibilities.

### Test-only variables

`SMOKE_BASE_URL` selects the deployed URL for `npm run test:smoke`. `SMOKE_ALLOW_DATA_UNAVAILABLE=true` is only for intentional pre-migration/local diagnostics and must not be used to approve production.

## Provision PostgreSQL

1. In Vercel Marketplace, install a serverless-compatible PostgreSQL provider and connect it to the project, or create the database with an external provider.
2. Select a region near the Vercel function region.
3. Ensure the injected/entered `DATABASE_URL` is the pooled runtime URL and requires SSL as prescribed by the provider.
4. Use a separate non-production database for Preview if preview editing, inquiry, upload, or migration tests will run.
5. From a trusted workstation with the production environment loaded, review status and apply only committed migrations:

   ```powershell
   npx.cmd prisma migrate status
   npx.cmd prisma migrate deploy
   ```

Never use `prisma migrate reset`, `db push --force-reset`, or automatic seeding in production.

## Provision Vercel Blob

1. Open the Vercel project → Storage → Create Database → Blob.
2. Choose public access for portfolio media and connect the store to the project.
3. Confirm Vercel injected `BLOB_READ_WRITE_TOKEN` into Preview/Production as intended.
4. Set `MEDIA_STORAGE_QUOTA_BYTES=1073741824` and `STRICT_STORAGE_QUOTA=true`.
5. Monitor both the CMS application quota and Vercel's current Blob storage, transfer, and operation usage. They are different limits.

## GitHub and preview flow

1. Place this exact prepared project at the root of a Git repository. Confirm `.env`, `.env.*`, `.vercel/`, generated build output, local uploads, and secrets are ignored.
2. Commit to a non-production branch and push to GitHub.
3. Import the repository in Vercel and configure Preview environment variables, using a preview database and non-production email recipient where possible.
4. Push the branch or open a pull request to generate a Vercel Preview deployment.
5. Apply preview-database migrations manually, then run the preview QA checklist in `PRODUCTION_CHECKLIST.md`.
6. Merge to the established production branch only after preview QA passes.

## First production deployment

1. Configure all required Production variables: `DATABASE_URL`, `JWT_SECRET`, `BLOB_READ_WRITE_TOKEN`, `ENABLE_DEMO_CONTENT=false`, `MEDIA_STORAGE_QUOTA_BYTES`, and `STRICT_STORAGE_QUOTA=true`. `APP_ORIGIN` may be omitted for the first deployment.
2. Apply `npx prisma migrate deploy` to the production database from a trusted environment before releasing code that depends on the new schema.
3. Deploy the production branch.
4. Copy the actual assigned `https://<available-name>.vercel.app` URL. Set it as `APP_ORIGIN` in Production, then redeploy. This keeps canonical URLs, sitemap, redirects, emails, and previews explicit and custom-domain-ready.
5. Run `SMOKE_BASE_URL=https://actual-url.vercel.app npm run test:smoke` using platform-appropriate environment syntax.
6. If no administrator exists, set temporary `ADMIN_EMAIL` and `ADMIN_PASSWORD` in a trusted local environment connected to production and run `npm run db:seed` once. Remove those bootstrap variables from Vercel afterward. If an administrator exists, do not reseed; sign in and change any default/temporary password immediately.

## Preview and post-deployment QA

Use `PRODUCTION_CHECKLIST.md`. Preview tests must avoid production recipients and unsafe production mutations. Post-production checks should create only clearly identified test data and remove it through normal CMS/trash workflows.

## Rollback and recovery

- Application: redeploy the last known-good Vercel deployment or revert the Git commit and push the production branch.
- Database: Prisma migrations are forward-only. Prefer a forward-fix. For a destructive incident, use the PostgreSQL provider's verified backup/PITR—not `migrate reset`.
- Content: download a checksum-bearing operations backup before migrations and releases. Restore using validate/dry-run and `SKIP_EXISTING`, `MERGE`, or `UPDATE_MATCHING`; a pre-restore recovery record is created automatically.
- Media: operations backups contain only a manifest. Blob objects require provider retention/backups or separately retained originals.

## Common deployment errors

- `Required production configuration is missing or unsafe`: add `DATABASE_URL`, a 32+ character `JWT_SECRET`, and `BLOB_READ_WRITE_TOKEN` to the correct Vercel environment.
- Prisma connection or timeout errors: use the provider's pooled/serverless URL, SSL parameters, nearby region, and provider connection limits.
- `P2021`/missing column: run `npx prisma migrate deploy` against the same database used by the deployment.
- `FUNCTION_PAYLOAD_TOO_LARGE`: compress the image below 4,000,000 bytes before upload. Vercel Functions reject payloads above 4.5 MB.
- Media upload reports unavailable: confirm the Blob store is connected and its token is in the deployment environment; redeploy after variable changes.
- CORS rejection on preview: confirm the request is coming from Vercel's current `VERCEL_URL`/`VERCEL_BRANCH_URL`; custom origins require `APP_ORIGIN` and a redeploy.
- Canonical points to localhost/old host: set `APP_ORIGIN` to the exact HTTPS production URL and redeploy.
- Inquiry saved but email pending: configure verified Resend sender values and inspect Email Delivery/System Health.
- Function cannot find HTML/assets: ensure deployment uses the committed `vercel.json` with `portfolio/**` included.

## Future custom domain

Add the domain in Vercel, complete DNS verification, update `APP_ORIGIN` to the canonical HTTPS custom domain, update the Search Console property and email/OAuth allowlists where relevant, then redeploy. No route or database redesign is required.
