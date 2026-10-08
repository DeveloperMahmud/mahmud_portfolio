# Operations and recovery runbook

## Backup scope

Use **System Health & Recovery → Backup**. The versioned JSON export contains projects, project metrics and blocks, articles, homepage modules, brands, testimonials, site/SEO/entity settings, redirects, media records and a media manifest. It includes a SHA-256 integrity checksum and record counts. Inquiry data is excluded unless the administrator enables it and confirms the sensitive-data warning.

The export never contains passwords, JWTs, OAuth refresh tokens, provider credentials or environment secrets. `mediaFilesIncluded: false` is intentional: the manifest describes Blob/S3/GitHub/local objects but does not contain their binary files. Back up the configured media provider separately. Application exports do not replace Neon/provider snapshots or point-in-time recovery.

## Validation and restore

1. Upload the JSON to the validation control. No writes happen during validation.
2. Confirm the format version and checksum, then review counts and conflicts.
3. Prefer `SKIP_EXISTING`. `MERGE` and `UPDATE_MATCHING` update matching portable records; none truncate tables.
4. Confirm the restore explicitly. The application stores a protected, checksummed pre-restore recovery payload first; it can be downloaded from backup history until its configured expiry.
5. Review the activity log and public pages afterwards.

The legacy `/api/admin/maintenance/restore` route is retained for compatibility but only accepts merge behavior; destructive replace-all is disabled. Complex database recovery should use a provider snapshot/PITR or a reviewed forward-fix.

## Revisions and local recovery

Saving existing projects, articles, homepage structure, global/site configuration, SEO settings or the Entity Profile captures a redacted revision before the write. Publication-related changes are labeled. Retention defaults to 50 revisions per resource and is controlled by `REVISION_RETENTION_COUNT`. Restoring first records the current state as another revision, so history is not erased.

Project and article editors maintain a debounced device-local recovery copy. It never publishes and never replaces the last successful server save. The editor shows unsaved/saving/saved/failure states, warns before closing with unsaved work and offers recovery after a crash. Recovery copies are device/browser-specific and are not backups.

## Monitoring and health

Set `ERROR_MONITORING_ENABLED=true` and a valid `SENTRY_DSN` to forward redacted server/public/admin failures through the provider-neutral adapter. Stored incident context removes tokens, authorization headers, cookies, names, email/message fields and secrets. Without a provider, health reports **Not configured** rather than fake metrics.

Detailed health requires authentication and distinguishes `HEALTHY`, `DEGRADED`, `UNAVAILABLE`, `NOT CONFIGURED` and `UNKNOWN`. The public health endpoint intentionally reveals only service availability and time.

## Media safety

The maintenance scan checks project blocks, galleries, articles, brands, testimonials, site settings and SEO records. Unused results are review candidates only. Remote assets are not fetched from arbitrary hosts. Replace-everywhere requires a fully uploaded replacement, displays known usages, updates structured references transactionally, keeps the previous object in trash and records the operation. Permanent media deletion is allowed only from trash, after a fresh usage check and an exact confirmation.

## Inquiries and email

CRM records support priority, tags, follow-up date, estimated value/currency, proposal state/date and outcome reason while preserving existing statuses. Notes remain private. CSV export is authenticated and activity-logged. Anonymization removes personal fields and notes.

Inquiry creation commits before notification delivery. Each provider attempt records `NOT_REQUESTED`, `QUEUED`, `SENT`, `FAILED_TEMPORARY` or `FAILED_PERMANENT`; `DELIVERED` is never claimed without provider evidence. Transient retries are bounded by `EMAIL_RETRY_MAX_ATTEMPTS`. Test-email actions are rate-limited and logged.

## Preview and publishing

Secure preview links use random hashed tokens, expire within 1–168 hours, can be revoked, render current draft data and return `noindex,nofollow,noarchive` with private no-store caching. They are not present in sitemap or analytics. Existing `DRAFT`, `PUBLISHED` and `ARCHIVED` meanings remain unchanged. Automated review/scheduling stages were not enabled because the current solo-admin/runtime workflow cannot guarantee a background scheduler.

## Release and rollback

Before production:

```bash
npm ci
npx prisma generate
npm run typecheck
npm run build
npx prisma migrate deploy
SMOKE_BASE_URL=https://your-domain.example npm run test:smoke
```

Review `0019_operations_reliability/migration.sql` before applying it. Never use `prisma migrate reset` in production. Apply the additive migration before deploying code that queries its columns.

Identify the last known-good Vercel deployment/commit, roll application code back through Vercel or GitHub, then rerun read-only smoke checks. A code rollback does not reverse database changes. If data was destructively changed, use a verified provider snapshot/PITR or a reviewed forward-fix; do not assume application rollback is enough.

## Privacy, retention and optional capabilities

Analytics retention remains controlled by `ANALYTICS_RETENTION_DAYS`; inquiry retention is an owner policy and should be reviewed periodically. Backups containing inquiries must be stored as sensitive data. Activity logs intentionally omit inquiry messages and secrets.

Accessibility auditing is bounded guidance, not proof of WCAG conformance. Complete keyboard-only, focus, 200% zoom, screen-reader, touch-target, reduced-motion, status-announcement and color-independent-state review before launch.

Multilingual publishing, global search, consent UI and PWA/offline caching remain disabled. No untranslated URLs, meaningless cookie banner or private-response service-worker caching was introduced.
