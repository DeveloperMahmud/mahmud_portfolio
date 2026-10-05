# Mahmudul Portfolio V8.2 — Slider Control

V8.2 adds a CMS-controlled Top Work slider settings panel under Admin → Maintenance → Slider Control.

## New controls
- Manual / Auto / Auto + Manual playback
- Auto-play interval, pause-on-hover, tab inactive pause, loop
- Arrows, counter, progress bar, dots
- Keyboard, mouse wheel, touch/swipe, drag
- Random / Fixed / Project transition mode
- Transition style, duration, easing
- Preload, random start, max slides, click-to-open
- Mobile auto-play, interval, arrows and swipe
- Reduced-motion, off-screen pause, lazy loading

## Setup after replacing the V8.1 locked folder
Keep your existing `.env`. From `locked/` run:

```powershell
npx prisma generate
npx prisma migrate deploy
npm run dev
```

No `npm install` is required for this V8.2 change when dependencies are already installed.

## Files changed
- `prisma/schema.prisma` — adds `SiteSettings.sliderConfig`
- `prisma/migrations/0008_slider_control/migration.sql` — database migration
- `api/src/routes/maintenance.ts` — saves slider settings
- `portfolio/admin.html` — Maintenance → Slider Control UI
- `portfolio/admin.js` — slider settings load/save/reset
- `portfolio/app.js` — public slider consumes CMS settings
- `portfolio/styles.css` — slider control UI and dots/progress styling


## V8.3 Skills & Tools
Maintenance now includes a Skills & Tools CMS tab. Skills are stored in SiteSettings.skillsConfig and rendered on the public Tools section. No new npm dependency is required.
