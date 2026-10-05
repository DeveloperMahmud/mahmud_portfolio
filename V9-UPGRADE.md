# Mahmudul Portfolio V9 — Full Polish Upgrade

## Included
- Premium case-study viewer with structured Overview / Challenge / Approach / Process / Result / Deliverables sections.
- Fullscreen project image viewer.
- Direct `/work/<slug>` case-study routing preserved.
- Natural/original project, gallery, blog and hero images. No grayscale or image filter.
- Hero image remains CMS-uploadable.
- Typewriter CMS control retained and schema-aligned.
- Homepage conversion section: Why Work With Me.
- Stronger testimonial presentation.
- Dynamic site SEO metadata from CMS settings plus Open Graph defaults and JSON-LD.
- Mobile layout polish.
- Hero preload + high-priority image decoding.
- Project Result / Outcome field in CMS and case studies.
- Secure client share page at `/share/<token>`.
- Client approval / change-request form with admin review log.
- Maintenance > Reviews panel.
- Backup/restore support for client reviews.
- Safe migrations for hero image and project results; existing heroImage columns are protected with IF NOT EXISTS.

## Update
From the `locked` folder:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Do not run `prisma migrate reset`.
No `npm install` is required if dependencies have not changed.
