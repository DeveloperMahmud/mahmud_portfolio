# Hero Copy Control

Maintenance → Site Settings → Hero Copy now controls:
- HERO LEAD TEXT: the large first line (default: I DESIGN)
- TYPEWRITER PHRASES: one phrase per line; the homepage cycles them sequentially.

After updating this build run `npx prisma generate` and `npx prisma migrate deploy`, then restart the server.
