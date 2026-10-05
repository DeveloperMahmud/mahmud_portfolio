# CMS handoff

The V5 site is data-driven. `data/projects.json` is the seed content and `admin.html` is a local CMS prototype using browser localStorage.

Production backend target:
- Node.js + TypeScript API
- PostgreSQL
- Object/image storage
- Admin authentication
- CRUD endpoints for projects
- image upload + optimization
- draft/published states
- ordering and featured projects

The SQL schema is included in `schema.sql`. The frontend's project shape already maps to this model.
