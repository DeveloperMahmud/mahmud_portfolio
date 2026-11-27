# Portfolio ↔ standalone app integration contract

## Current CMS flow

The same flow applies to all twelve canonical records and owner-created custom records:

1. Deploy the standalone app to a public HTTPS URL.
2. Open Admin → Creative Lab → edit the matching tool.
3. Paste the URL into **External App URL (HTTPS)**.
4. Choose **Use as Primary App**.
5. Save Draft.
6. Run **Verify Saved App URL**.
7. Publish.

Before step 7, public visitors continue to receive the previously published action. If no verified live action has been published, the internal concept demo remains the safe fallback.

## Publication rules

- External URLs must use HTTPS.
- Verification is a separate server-side action; saving a draft never silently probes a destination.
- Verification must complete before a live URL is publishable.
- Published snapshots, not later draft edits, control public cards and buttons.
- Open external apps in a new tab with `noopener` behavior.
- Changing a slug must preserve existing detail and demo route continuity.
- Removing or failing an external app must allow the record to return to the internal demo without deleting catalog content.

## Standalone app manifest

Every app should publish an `app.manifest.json` in its repository and optionally at `/.well-known/creative-lab-app.json`. The first release does not require the portfolio to fetch this file; it is a stable handoff and future automation boundary.

Required fields:

- `schemaVersion`, `appId`, `canonicalId`, `name`, `slug`, `version`
- `status`, `publicUrl`, `privacyMode`
- `capabilities`, `inputTypes`, `exportTypes`
- `portfolioReturnUrl`, `supportUrl`, `limitationsUrl`

## Optional query parameters

Standalone apps may support these non-sensitive parameters:

- `source=portfolio`
- `theme=midnight-lime`
- `locale=en`

Never pass admin tokens, user email, unpublished record IDs or private asset URLs in the query string.

## Custom apps

For an app not among F01–F06/M01–M06:

1. Create Custom App in the Creative Tools manager.
2. Add truthful catalog copy, cover image, status and internal fallback/detail content.
3. Follow the same external URL workflow above.
4. Publish only when visibility, SEO and limitation copy are correct.

Custom apps are content records, not uploaded executable modules. The CMS must never accept arbitrary JavaScript bundles from an editor.

## Failure behavior

- Verification failure: keep the URL in draft, show the reason, do not activate it publicly.
- Live app outage after publication: owner switches primary behavior back to Demo and publishes; the portfolio stays usable.
- App removed permanently: archive the catalog record or retain the detail page with an honest unavailable status.
- Unsafe redirect or non-public network destination: reject verification.
