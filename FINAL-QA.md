# Final QA — Locked baseline

This patch is based on the supplied `locked` build.

## Fixes in this final pass
- Fixed content bulk status mapping: PUBLISH/DRAFT/ARCHIVE now map to the Prisma enum values PUBLISHED/DRAFT/ARCHIVED.
- Fixed Express 5 route-param typing in content routes.
- Fixed Zod 4 `z.record()` typing in maintenance settings validation.
- Fixed Site Settings JSON typing for TypeScript.
- Added compatibility handling for extended SiteSettings fields (`heroImage`, `heroLeadText`, `heroTypewriterPhrases`, `typewriterConfig`) so a stale generated Prisma client does not make the settings save endpoint fail; the values are read/written through parameterized SQL while legacy fields continue through Prisma.
- Public settings also merge the extended fields so Hero image/copy/typewriter configuration remains available to the frontend.

## Verification
- Portfolio JavaScript syntax: PASS
- TypeScript `tsc -p tsconfig.json --noEmit`: PASS
- No new database migration added.

## Run
Keep the existing `.env` and database. Replace the project files, then run:

    npm run dev

If you later want to refresh the generated Prisma client, `npx prisma generate` is safe, but it is not required for the compatibility fix above.
