# Page Studio — Safe rollout guide

Page Studio is an additive visual page builder. It does not replace the current homepage, project, journal, brand, lead, media, SEO, analytics, backup, or admin systems. Existing routes keep working unless an administrator explicitly publishes a custom page and enables public delivery.

## What is included

- Visual drag-and-drop page canvas with desktop, tablet, and mobile previews.
- Draft autosave, explicit publish, private preview, revisions, duplicate, trash, and recovery.
- Layout, content, media, conversion, dynamic-data, motion, and trusted-embed widgets.
- Starter templates, reusable copy blocks, synchronized global blocks, taxonomies, and page-level navigation presets.
- Existing Media Library picker plus direct HTTPS/CDN URL support.
- Dynamic project, journal, brand, social-link, CV, and contact widgets that reuse current CMS data.
- SEO metadata, canonical URL, robots controls, sitemap integration, and first-party analytics.
- Full backup/restore, media-reference scanning/replacement, and revision-retention integration.

## Free-tier behavior

Saving, previewing, duplicating, publishing, and rendering a page perform no Vercel Blob write. Page definitions, templates, navigation, and taxonomies are small PostgreSQL JSON records. Blob usage grows only when a file is explicitly uploaded through the existing Media Library. Choosing an existing asset or using an external CDN URL performs zero storage writes.

The builder deliberately has no paid third-party runtime dependency. Trusted external embeds can still consume the external provider's quota or bandwidth, so add only sources you control or understand.

## First production rollout

1. Download a full CMS backup from **Admin → Operations → Backup**.
2. Confirm the deployment has `DATABASE_URL` and `JWT_SECRET`. Do not change their current values.
3. Apply the additive migration against the production database:

   ```powershell
   npx prisma migrate deploy
   ```

4. No environment variable is required to enable Page Studio normally. Use the CMS **Free-tier & Activation** controls for routine access and public delivery. `PAGE_STUDIO_EMERGENCY_DISABLED=true` is an emergency lock only; leave it unset or `false` during normal operation.
5. Redeploy the same commit. Sign in to the existing CMS and open **Page Studio** from the sidebar.
6. Keep **PUBLIC CUSTOM PAGES** off while building and testing. Private Preview works while public delivery is off.
7. Create a test page at `/pages/test-page`, verify all three device previews, save, and publish it.
8. Turn on **Manage → Free-tier & activation → PUBLIC CUSTOM PAGES** only after the test is approved.

Two CMS switches protect production: **CMS ENABLED** controls editing and **PUBLIC CUSTOM PAGES** controls delivery. The optional `PAGE_STUDIO_EMERGENCY_DISABLED=true` environment variable is a final incident lock. Turning any of these controls off leaves stored builder data intact.

## Studio Foundation v3

- The server now owns the canonical widget registry used by the editor library. This prevents labels, categories and supported widget versions drifting between the API and browser UI.
- Every Page Studio block has a `widgetVersion`. Older blocks are normalized automatically when read or saved, without rewriting the live published snapshot until the page is explicitly published again.
- Global design tokens live inside the existing `themeConfig` JSON, so no destructive database migration is required. Admins can control heading/body fonts, content width, section spacing, base radius and motion scale alongside the existing colors and grain settings.
- Columns support explicit tablet and mobile column counts. Existing layouts keep safe inherited defaults.
- Publish preflight also checks multiple H1 widgets, incomplete comparisons, untitled embeds, large pages and custom-code review requirements.

The upgrade is backward compatible: published snapshots, legacy homepage sections, templates and reusable blocks continue to parse through the migration layer.

## Rollback

For an immediate no-data-loss rollback, turn off **PUBLIC CUSTOM PAGES** in the CMS. If the protected builder itself must be locked during an incident, set `PAGE_STUDIO_EMERGENCY_DISABLED=true` and redeploy. Existing portfolio routes remain active. Do not reverse or delete migration tables during an incident; use a forward fix after service is stable.

## Local verification

```powershell
npm ci
npx prisma generate
npm run typecheck
npm run build
npm run test:page-studio
npm run test:operations
npm run test:slider
```

Set local `DATABASE_URL` and `JWT_SECRET`, then run `npm run dev`. Sign in at `/admin.html` and open `/page-studio.html`. Make sure `PAGE_STUDIO_EMERGENCY_DISABLED` is unset or `false`.
