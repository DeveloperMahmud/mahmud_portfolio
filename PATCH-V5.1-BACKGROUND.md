# V5.1 Background / Cursor Patch

- Adds CMS-controlled particle background configuration under Maintenance → Background.
- Stores particle configuration inside the existing SiteSettings.sliderConfig JSON; no Prisma migration.
- Built-in styles: Neural Network — 3D, Constellation — Clean, Orbital — Futuristic, Minimal Dust.
- Controls: enable, speed, density, link distance, node size, depth, mouse reaction, pulse, line opacity.
- Default speed is intentionally slow (0.22) and the particle count is moderate.
- Public pages read the configuration from `/api/public/settings`.
- Fixes the custom cursor on project detail pages.
- Adds the ambient background to Journal and client-share pages.
