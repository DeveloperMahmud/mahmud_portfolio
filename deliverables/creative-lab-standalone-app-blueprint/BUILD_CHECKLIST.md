# Per-app build checklist

## Product

- [ ] Scope and non-goals approved.
- [ ] Sample/preview/live state is truthful.
- [ ] Empty, error, loading and success states exist.
- [ ] Limitations and privacy behavior are visible.

## Engineering

- [ ] Separate repository, deployment and secrets.
- [ ] Tool logic isolated by feature module.
- [ ] Inputs validated at every trust boundary.
- [ ] Uploads remain local unless consent and retention are explicit.
- [ ] No portfolio database or admin credential dependency.

## Quality

- [ ] Unit and integration tests pass.
- [ ] End-to-end primary journey passes.
- [ ] Keyboard and automated accessibility smoke pass.
- [ ] Desktop/tablet/mobile visual review complete.
- [ ] Performance and security checks complete.

## Release and connection

- [ ] Production HTTPS URL is stable.
- [ ] Manifest and release notes updated.
- [ ] External URL pasted into the correct canonical/custom CMS record.
- [ ] Primary action selected, draft saved and URL verified.
- [ ] Record published and public action checked.
- [ ] Internal demo fallback remains usable.
