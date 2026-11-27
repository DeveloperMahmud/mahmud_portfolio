# Master implementation plan

## 1. Target architecture

Use a hub-and-spoke model.

```text
Portfolio Creative Lab / CMS
  ├─ catalog, search, filters, detail pages
  ├─ 12 canonical records + owner-created custom records
  ├─ internal concept demos as safe fallback
  └─ verified external URL published per record
       ├─ standalone app F01
       ├─ standalone app F02
       ├─ ...
       └─ standalone app or custom owner tool
```

Each standalone app must be a separate repository/deployment. A failure or release in one tool must not change another tool or the portfolio. Shared visual tokens may be copied from a versioned package or template, but runtime code and databases must remain isolated.

## 2. Repository boundaries

Every app repository should contain:

```text
app-name/
  src/
    app/                 route and page composition
    features/            one folder per bounded feature
    components/          local reusable UI
    lib/                 validation, storage and export adapters
    styles/              tokens and app shell
  public/
  tests/
    unit/
    integration/
    e2e/
  docs/
    PRIVACY.md
    LIMITATIONS.md
    RELEASE_CHECKLIST.md
  app.manifest.json
  README.md
```

Do not import portfolio server code into an app. Do not create a shared database across all tools. If authentication is later required, add it through a versioned identity contract rather than direct portfolio database access.

## 3. Shared product contract

Every app must provide:

- a clear name, status and honest limitation notice;
- keyboard-accessible controls and visible focus;
- responsive desktop, tablet and mobile layouts;
- a local-first path where practical for uploaded images or drafts;
- explicit consent before server upload;
- safe file type, size and URL validation;
- predictable empty, loading, error and success states;
- a “Back to Creative Lab” link;
- an About/Privacy/Limitations surface;
- semantic version and build date in a non-prominent footer or diagnostics panel;
- no claims of compliance, sales uplift or automated intelligence without real evidence.

## 4. Delivery phases

### Phase 0 — common template

Build one standalone starter repository with the shared shell, tokens, accessibility primitives, validation helpers, error boundary, analytics consent boundary, test setup and deployment checklist. Do not put tool-specific logic in the template.

Acceptance:

- desktop three-panel shell and mobile stacked shell;
- loading/error/empty states;
- manifest schema validation;
- unit, accessibility smoke and end-to-end navigation checks;
- no production API key in client code.

### Phase 1 — low-risk mini tools

Build M06, M01 and M03. These establish checklist state, browser image metadata/safe-zone rendering and document export. Keep files in-browser unless export is explicitly requested.

### Phase 2 — structured workflow tools

Build F04, M04 and M05. Reuse only the copied/versioned shell patterns; each app keeps independent domain logic and persistence.

### Phase 3 — image QA tools

Build F01, F02 and M02. Introduce a shared specification document for canvas/image handling, but avoid a runtime dependency that can break every deployment simultaneously.

### Phase 4 — larger flagship workflows

Build F03, F05 and F06 after their data models, privacy boundaries and real user journeys are validated. F06 requires the highest security review because it may later involve accounts, files, comments and approvals.

### Phase 5 — portfolio connection

For each deployed app: paste the HTTPS URL into the corresponding CMS record, make it the primary app action, save the draft, verify the saved destination and publish. Confirm card, detail page and Page Studio CTA all resolve from the published snapshot.

## 5. Environment and deployment

Recommended per app:

- independent hosting project and domain/subdomain;
- separate environment variables and least-privilege credentials;
- preview deployments for pull requests;
- production deploy only after the release checklist passes;
- health endpoint only when the app has a server component;
- error reporting scrubbed of uploaded assets and personal content;
- retention rules documented before server-side storage is enabled.

Suggested URL convention: `https://<tool-slug>.apps.your-domain.example`. The portfolio accepts any legitimate public HTTPS destination; the convention is organizational, not a hard dependency.

## 6. Verification ladder

For every app release:

1. Unit tests for domain calculations and validation.
2. Integration tests for upload/export/persistence boundaries.
3. End-to-end happy path plus empty/error paths.
4. Accessibility keyboard and automated smoke.
5. Desktop and mobile visual review.
6. Security review for URL/file handling and sensitive data.
7. Performance budget on initial load and largest interaction.
8. Deploy preview, verify production URL, then connect it through the portfolio CMS.

## 7. Credit-efficient execution plan

When development resumes, work one vertical slice at a time. First finish the common template and one small app; only then copy the proven shell into the next standalone repository. This avoids spending credits on twelve simultaneous partial builds and gives an immediately reusable baseline.

## 8. Definition of done

An app is not “built” because a demo screen exists. It is done only when its scoped engine works, limitations are truthful, tests pass, desktop/mobile are visually checked, deployment is stable, and the portfolio record points to a verified published URL. Concept previews remain labeled previews until that point.
