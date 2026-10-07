# Admin Final QA / Production Polish

Included in this build:
- Premium admin dashboard and responsive navigation.
- Mobile admin layout polish.
- Working project/content search with result counts.
- Hero lead text control in Maintenance → Site / Email.
- Hero typewriter phrase control in the same panel.
- Hero image upload and existing typewriter timing controls preserved.
- Existing projects, content, slider, skills, testimonials, inquiries, reviews, backup/restore and exports preserved.
- Migration `0014_hero_copy_control` adds `heroLeadText` and `heroTypewriterPhrases` without resetting existing data.

## Install

Keep the existing `.env` and do not replace `node_modules` from this ZIP.

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Do not run `prisma migrate reset`.

## Final content work still requires the owner's real portfolio data

Real client names, project images, results/metrics, testimonials, contact details and social URLs are intentionally not invented in this build. Enter them through the CMS before production launch.

## Verification note

Frontend JavaScript syntax was checked successfully with Node. Full backend typecheck/generation could not be completed in this build environment because the packaged dependency tree's Prisma binary requires an external Prisma engine download; run the commands above in the local project environment after replacement.
