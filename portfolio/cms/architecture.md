# Production CMS architecture

- Frontend: current HTML/CSS/JS; optional Next.js migration later.
- Backend: Node.js + TypeScript.
- Database: PostgreSQL.
- Storage: object storage + CDN, optimized WebP/AVIF.
- Auth: secure session/cookie authentication.
- Hosting: GitHub + Vercel + managed PostgreSQL.

## CMS content
Projects, Brands, Featured/Special items, Services, Profile, Site settings.

## Visibility
`public` = normal portfolio. `unlisted` = hidden from navigation/search, accessible by strong random share link. `private` = backend authorization required.

A frontend-only hidden page is not secure. Production must enforce privacy server-side.

## Client links
Use `/view/client/<random-token>`, store only a token hash, optionally support expiry, password, revoke and access logs.

## Brand marquee
Brands are CMS records with logo asset, order and active flag. Frontend loops them continuously.

## Special work
Admin can feature/pin projects, shuffle featured work, and later schedule a feature window.
