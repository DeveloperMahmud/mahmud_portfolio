# Mahmudul Hassan Portfolio — V7 Production CMS

V7 turns the V6 visual portfolio into a production-oriented full-stack foundation.

## Stack
- Node.js + TypeScript + Express API
- PostgreSQL + Prisma
- Secure cookie session authentication
- S3-compatible object storage with presigned uploads
- Public / Unlisted / Private project visibility
- Hashed client share tokens
- Projects CRUD
- Brands CRUD
- Vercel-compatible deployment shape

## Local setup
1. Install Node 20+ and PostgreSQL 15+.
2. Copy `.env.example` to `.env` and fill the values.
3. Run `npm install`.
4. Run `npx prisma generate`.
5. Run `npx prisma migrate dev --name init`.
6. Run `npm run db:seed`.
7. Run `npm run dev`.

The site/API runs at `http://localhost:8787`.

## Production storage
Use an S3-compatible provider such as Cloudflare R2, AWS S3, or another object store. The API creates short-lived presigned upload URLs so large image files do not pass through the Node API.

## Access model
- **PUBLIC:** included in public API and portfolio.
- **UNLISTED:** omitted from public listings; accessible only with a valid share token.
- **PRIVATE:** never exposed by public listing routes; a valid server-side share token is required for the current client-link workflow.

Only the SHA-256 hash of a client token is stored in PostgreSQL. Tokens can be revoked and can optionally expire.

## Important deployment note
The backend is production-oriented but still needs real infrastructure credentials before it is a live production system: PostgreSQL URL, JWT secret, object-storage credentials, and Vercel environment variables. Do not commit `.env` or credentials.

## CMS routes
- `POST /api/auth/login` / `POST /api/auth/logout` / `GET /api/auth/me`
- `GET /api/public/projects`
- `GET /api/public/projects/:slug`
- `GET /api/public/brands`
- `GET /api/public/share/:token`
- Admin CRUD under `/api/admin/projects` and `/api/admin/brands`
- `POST /api/admin/projects/:id/share-link`
- `POST /api/admin/media/presign`

The visual frontend is now production-data driven: published public projects and active brands come from PostgreSQL through the public API. If the database is empty, the work/brand sections intentionally show empty states instead of silently using demo content.


## Login troubleshooting
Run `npm run db:seed` after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then `npm run dev` and open `/admin.html`. The login flow verifies the HTTP-only session immediately after sign-in and displays actionable errors. Health is available at `/api/health` and `/health`.

## Media upload modes
The CMS now supports direct image uploads from the admin panel.
- If S3-compatible credentials are configured, uploads go to S3/R2.
- If GitHub media variables are configured, uploads are committed to the configured repository and served from the repository's raw public path. This is useful for a portfolio deployment on Vercel when you do not want a paid object-storage account.
- With neither configured, local development stores files under `portfolio/uploads/`. Local filesystem storage is not persistent on Vercel, so configure GitHub or S3 before deploying.

GitHub media requires a token with permission to write repository contents. Never commit the token; set it as a Vercel environment variable.
