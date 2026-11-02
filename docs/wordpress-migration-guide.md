# WordPress migration handoff

Page Studio's **WORDPRESS EXPORT** creates a portable JSON handoff. It does not publish, install WordPress, copy credentials, or modify this portfolio.

## Export contents

- Page identity and SEO fields.
- Enabled blocks in document order.
- Clean content attributes and a bounded set of visual design tokens.
- A media manifest for download/import/remapping.
- Suggested WordPress core-block mappings and explicit manual-review flags.

Editor-only selection state, drag/drop metadata, undo history, responsive editor state, animations, and custom JavaScript are not exported. Dynamic CMS widgets are marked for manual mapping because their query/data behavior cannot be safely converted into static WordPress content.

## Migration sequence

1. Export from Page Studio and retain the JSON with the matching media backup.
2. Import media into the WordPress Media Library and map every `sourceUrl` to its new attachment URL/ID.
3. Convert `core/*` mappings to Gutenberg blocks.
4. Implement each `portfolio/custom-widget` as an audited block, Query Loop, pattern, or theme template.
5. Rebuild forms, analytics, consent, redirects, canonical URLs and structured data in the destination environment.
6. Review custom HTML/CSS manually. Rebuild required JavaScript in a trusted plugin or theme; do not paste unknown scripts into a public page.
7. Compare desktop, tablet and mobile output before changing DNS.

The current Express/Prisma website remains the source of truth until a separate migration has been reviewed and approved.
