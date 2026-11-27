# Mahmud Creative Lab — Standalone App Blueprint

This package is the build-ready handoff for developing the Creative Lab tools as separate applications while keeping one access hub inside the portfolio.

## The decision

- The portfolio remains the discovery, presentation and publishing hub.
- Every real tool is deployed independently and owns its own runtime, data and release cycle.
- The existing six flagship and six mini records stay in the portfolio CMS.
- Each canonical record, plus every future custom app record, can point to a verified external HTTPS URL.
- Until a URL is saved, verified and published, the public button keeps using the honest internal concept demo.

## Start here

1. Read `MASTER_IMPLEMENTATION_PLAN.md`.
2. Review `SHARED_UI_SYSTEM.md` and `assets/creative-lab-access-hub-mockup.png`.
3. Choose the first tool from `12_APP_ROADMAP.md`.
4. Copy the object in `APP_STARTER_MANIFEST.json` into the new app repository and replace its placeholders.
5. Deploy the app, then follow `APP_INTEGRATION_CONTRACT.md` to connect it to the portfolio.

## Suggested first build order

1. M06 Design Handoff Checklist — small, useful and low-risk.
2. M01 Image Dimension & Safe-Zone Checker — validates local image-processing patterns.
3. F04 Smart Creative Brief Builder — establishes the shared form/export shell.
4. F01 Amazon Thumbnail Readability Tester — establishes image comparison and export.
5. Continue in the dependency order documented in the roadmap.

The supplied HTML reference is a visual direction, not production code. The static `access-hub-ui-reference.html` in this package is likewise a presentation reference, not a live app engine. The generated PNG is a mood/layout mockup; use the roadmap and manifest—not incidental labels inside the image—as the factual application registry.
