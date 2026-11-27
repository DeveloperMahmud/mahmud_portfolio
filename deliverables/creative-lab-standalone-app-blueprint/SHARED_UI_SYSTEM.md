# Shared UI system

## Visual direction

The access hub follows the supplied Creative Lab reference: dark editorial workspace, restrained lime signal color, fine technical borders, large purposeful typography and compact metadata. It should feel like a creative workstation, not a generic SaaS dashboard.

Core tokens:

```css
--bg: #090a09;
--panel: #111311;
--panel-raised: #151815;
--text: #f3f3ee;
--muted: #92978f;
--accent: #c7ff3d;
--line: #303630;
--danger: #ff7c7c;
--radius: 10px;
--content: 1440px;
```

## Central access hub

The portfolio Creative Lab is the one place users browse all tools. It needs:

- flagship/mini/custom filters;
- search by title, category and tag;
- status label: Preview, Beta or Live;
- a clear distinction between internal concept demo and external live app;
- featured cards for priority tools and compact cards for the remaining tools;
- one primary action, resolved from the published CMS snapshot;
- optional secondary Details action;
- no embedded executable third-party app code in the CMS.

## Standalone application shell

Desktop uses three functional zones:

1. Left: tool identity, step navigation, presets and help.
2. Center: main working canvas/form and direct manipulation.
3. Right: results, guidance, export and history for the current session.

The top bar contains the app name, status, privacy indicator, reset action and a link back to the Creative Lab. Avoid putting essential actions only inside icons.

Tablet may collapse the result panel into a drawer. Mobile stacks controls → workspace → results, with a sticky but non-obstructive action row. No fixed panel may cover form fields or save/export controls.

## Component inventory

- AppShell, AppHeader, ToolNav
- StatusBadge, PrivacyBadge, LimitationNotice
- FileDropzone, FileSummary, ImageCanvas
- FormSection, FieldGroup, PresetPicker
- ResultPanel, FindingCard, Checklist
- CompareSlider, ZoomControl, SafeZoneOverlay
- ExportMenu, ResetDialog, ErrorBoundary
- EmptyState, LoadingState, InlineError, Toast

Each component must own one responsibility. Tool-specific logic belongs in `features/<feature-name>` rather than shared UI components.

## Interaction rules

- Green indicates available/selected/success, not decorative text everywhere.
- Show a visible state change after every upload, calculation, save or export.
- Preserve user work when a non-fatal validation error occurs.
- Destructive reset requires confirmation when meaningful work exists.
- Motion explains state changes; it must respect reduced-motion preferences.
- A sample dataset must be visibly labeled `SAMPLE` and never resemble a real client claim.

## Responsive acceptance

- 1440×900 and 1280×720: all three zones usable without page-level horizontal overflow.
- 768×1024: workspace remains primary; secondary panels collapse predictably.
- 390×844 and 360×800: one-column reading order, 44px touch targets, no clipped labels or sticky overlays.
- Keyboard order follows the visual flow; drawers return focus to their trigger.

The included PNG is a visual target, not a pixel-perfect requirement. Build with semantic HTML and the actual content density of each app.
