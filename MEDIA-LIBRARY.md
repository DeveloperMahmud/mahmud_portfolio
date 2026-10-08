# Media Library

Added a CMS Media Library under **CONTENT → MEDIA LIBRARY**.

Features:
- Grid browsing with search and type filters
- Bulk image upload
- Sync existing local uploads into the media index
- Media metadata: alt text, title, description, tags
- Usage tracking across project covers/galleries, journal covers/galleries/body, brand logos, testimonial photos, hero image and OG image
- Single download and bulk download
- Single delete and bulk delete with usage warnings
- Browser-side WebP optimization as a new optimized copy (original is preserved)
- Bulk optimization for selected image assets
- Local/S3/GitHub storage deletion support through the existing storage abstraction

## Database

Migration: `prisma/migrations/0015_media_library/migration.sql`

After replacing the project files:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

No database reset is required.

## Notes

The first time the Media Library is opened, use **SYNC EXISTING MEDIA** to index files already present in the local uploads directory. Newly uploaded images are registered automatically.

Optimization creates a separate WebP copy rather than silently replacing the original, so existing references remain safe.
