# Operations and release guide

## Environment

Required runtime values include `DATABASE_URL`, a strong `JWT_SECRET`, and `APP_ORIGIN`. Use `DIRECT_URL` for migrations when the PostgreSQL provider recommends a non-pooling connection. Optional storage, email and monitoring variables must remain unset until their provider is configured.

Preview and production must use separate databases and storage credentials. Never copy production secrets into committed files or local screenshots.

## Validation

```powershell
npx.cmd prisma validate
npx.cmd prisma generate
npm.cmd run build
npm.cmd run test:v2-quality
npm.cmd run test:performance-budget
npm.cmd run test:frontend
npm.cmd run test:page-studio
```

Run `npm.cmd run test:v2-visual` when Playwright Chromium is installed. A passing build/static suite is not visual verification.

## Database and rollback

1. Download a CMS backup and verify its checksum/manifest.
2. Review additive migrations and apply them to a production-like copy first.
3. Deploy one preview branch and complete route, authentication, CMS role and responsive checks.
4. Release only an explicitly approved commit.
5. If application behavior regresses, redeploy the last known-good commit. Do not reverse a database migration by deleting production data; use an additive corrective migration and restore only from a verified backup when necessary.

## Ownership

- Content owners verify claims, case-study evidence, client permissions and public URLs.
- Administrators own users, roles, feature controls, backups, review tokens and releases.
- Developers own migrations, security boundaries, validation, performance budgets and rollback instructions.
