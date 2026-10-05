# Mahmudul Hassan — Portfolio V2

Premium CMS-ready portfolio prototype with demo SVG project visuals.

## What changed from V1
- Real demo visuals instead of blank project placeholders
- Filterable project grid
- Clickable project detail modal/case-study preview
- CMS-oriented project data model
- Responsive mobile layout
- Contact placeholder intentionally left generic until the owner's real contact is supplied

## Replace demo images
Replace the SVG files in `assets/` or, later, map `img` fields to CMS image URLs.

## CMS integration
The `projects` array in `app.js` is the temporary data source. The next implementation phase should replace it with API data from a managed headless CMS.

Suggested fields:
id, title, slug, category, type, client, year, role, description, coverImage, gallery, challenge, approach, process, deliverables, tools, featured, sortOrder, status, seoTitle, seoDescription, liveUrl.

## Deploy
Push the folder to GitHub and import the repository into Vercel. This V2 is plain HTML/CSS/JS and needs no build command.


## V3 Amazon service taxonomy

Amazon projects now support:
- A+ Content: Basic A+, Premium A+, EBC
- Brand Story
- Amazon Storefront
- Listing Images
- Product Visuals

The `service` field is the CMS field that should power these filters after the CMS integration.


## V3.1 visual refinement
Amazon service rows use a fixed number column, consistent content column, spacing, line-height, and mobile breakpoint behavior to keep all five services aligned.


## V3.2 alignment fix
Amazon service rows now use a dedicated content wrapper so each number aligns with its complete service block (heading, description, and CTA), rather than CSS grid auto-placement putting the description back under the number.

## V3.3 mobile refinement

The portfolio now has dedicated mobile behavior for:
- responsive hero typography
- compact header/navigation
- single-column project grids
- horizontally scrollable portfolio filters
- mobile Amazon service rows
- responsive services/about/contact sections
- scrollable project case-study modal
- small-phone breakpoint at 480px

## V4 premium visual layer

V4 adds the planned visual experience:
- Black/white editorial hero direction
- Grain/noise treatment
- Portrait-ready hero frame
- Custom desktop cursor
- Scroll progress indicator
- Reveal-on-scroll motion
- Magnetic CTA interaction
- Image hover zoom
- Auto-hiding desktop header on scroll
- Reduced-motion accessibility support
- Mobile-safe fallbacks

### Portrait
The hero currently contains a black/white editorial placeholder because a real portrait has not been supplied yet. Replace that placeholder with Mahmudul's own portrait once uploaded.

## V4.1 portrait integration

The supplied black-and-white editorial portrait is now integrated into the hero at `assets/hero-portrait.png`.
The hero keeps a subtle grain/contrast treatment and adds a restrained desktop pointer-parallax effect. Mobile disables pointer parallax automatically.

## V5 complete build

V5 consolidates the visual direction into one homepage and adds:
- editorial black/white hero using the supplied portrait
- grain, cursor, parallax, scroll reveal and magnetic interactions
- premium responsive mobile navigation
- complete Amazon service hub
- filterable portfolio
- detailed project case-study modal
- services, approach, about and contact sections
- browser-based CMS prototype at `admin.html`
- JSON seed content
- PostgreSQL production schema in `cms/schema.sql`

The admin prototype is intentionally local-first. Production persistence/authentication/storage should be connected to the PostgreSQL/API architecture described in `cms/README.md`.

## V6 additions
- Always-on brand/client marquee
- Featured/Special Work spotlight + shuffle
- Public / unlisted / private content model
- Client-only link architecture
- CMS/backend plan for Brands and Special Work
