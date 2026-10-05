# Natural Image Update

This build keeps uploaded visual work natural/original.

- Homepage hero image: no grayscale, no dark filter, no image grain.
- Project cards: no desaturation filter.
- Featured work images: no desaturation/blur filter during normal display or transition.
- Gallery images: original artwork remains natural.
- Blog images: no image filter.
- Site grain is now behind page content, so it does not overlay client artwork.
- Existing Hero Image Upload and Typewriter CMS controls are preserved.

Keep your existing `.env` file.

After replacing the source files, run:

    npx prisma generate
    npx prisma migrate deploy

Then restart:

    npm run dev
