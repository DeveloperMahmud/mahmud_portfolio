# Creative Lab administration

## Tool lifecycle

1. Open **Creative Lab Tools** in the authenticated CMS.
2. Edit the draft title, copy, category, status, actions, media and display order.
3. Reuse Media Library assets; do not paste private object URLs into public fields.
4. Save draft, inspect the detail/demo routes, then publish explicitly. Draft saves never update the public snapshot.
5. Use **UNLISTED** for direct-link discovery and **PUBLIC** for catalog discovery. A live URL must pass server-side HTTPS verification.

The twelve canonical IDs are stable references. Change copy and URLs through the CMS rather than changing those IDs.

## Review workspaces

Review Workspace access is separate from legacy project share links. Tokens are shown once, stored as hashes, scoped, expiring and revocable. Use only public-safe Media Library assets. Confidential client files remain unsupported until private storage and signed authenticated delivery are configured.

## Operational checks

- Run the quality, performance and regression commands documented in `operations-release-guide.md`.
- Treat automated accessibility output as a bounded audit, not certification.
- Keep demo tools labelled as demos until a production engine and its data/privacy boundary are verified.
- Never apply a migration to production from a preview build without a reviewed backup and rollback plan.
