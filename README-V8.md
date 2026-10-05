# Mahmudul Hassan Portfolio — V8 Feature Complete (Local Test Build)

## One-time setup after replacing the old build

1. Put your existing `.env` into `locked/` (do not share it).
2. From `locked/` run:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed-demo
npm run dev
```

`db:seed-demo` adds the 8 demo projects and 4 demo content records to PostgreSQL. The demo images are bundled in `portfolio/assets/`, so the records use local `/assets/demo-*.svg` URLs and do not depend on external placeholder images.

## New V8 features

- Project/content bulk selection and Publish/Draft/Archive/Delete.
- XLSX export for projects, content and brands.
- Full CMS JSON backup with database records + media manifest.
- Backup restore: MERGE or REPLACE.
- Maintenance tab with database/storage/status counts.
- Site Settings CMS (identity, contact, social, availability, SEO fields).
- Testimonials CMS + public testimonial section.
- Project inquiry form + admin inquiry list/status + configurable email delivery.
- Admin-configurable inquiry recipient + subject; email delivery uses Resend REST API with reply-to set to the visitor.
- Activity log for important CMS operations.
- Scheduled publishing fields for projects and content.
- Homepage slider CMS controls remain: Featured, Slider Enabled, Transition, Sort Order.
- Existing auth, project CRUD, content CRUD, brand CRUD, media upload, share links and batch imports preserved.
- Existing frontend motion system, typewriter, animated background, project/gallery sliders and demo assets preserved.

## Important backup note

The CMS backup contains database records and a media manifest. If media is stored in external S3/GitHub storage, the backup references those URLs/keys rather than copying remote binaries into the JSON file. Keep the media storage itself available for a complete media restore.

## No deployment yet

This build is intended for local QA first. Do not deploy until the full local workflow has been tested.


## Inquiry email setup

The contact form always saves submissions into the CMS. To also receive each inquiry by email, add these to your local `.env` (and later your production environment):

```text
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_sender@example.com
RESEND_FROM_NAME=Mahmudul Hassan
```

Then open Admin → Maintenance → Site Settings and set **INQUIRY RECIPIENT EMAIL**. The visitor's email is used as Reply-To, so you can reply directly from your mail client. The subject supports `{name}` and `{service}`.

After this schema change, run `npx prisma generate` and `npx prisma migrate deploy` once. No `npm install` is required for this email feature.
