# Typography system

Use semantic text roles instead of choosing a new size inside each component.

| Role | Default | Use |
| --- | ---: | --- |
| Caption | 10px | Kicker, metadata and compact status text |
| Label | 11px public / 10px admin | Form labels and field names |
| Helper | 12px | Instructions, validation and secondary form copy |
| Body | 14px | Standard interface and supporting copy |
| Control | 15px public / 14px admin | Input, select and textarea values |
| Button | 10px | Uppercase navigation and action labels |

Rules:

- Display and section headings remain fluid through their existing `clamp()` rules.
- Do not introduce interface text below 10px. Decorative counters may be smaller only when they are not required to understand or operate the interface.
- Keep body/helper copy at a minimum 1.5 line-height; labels and compact actions use at least 1.2.
- Mobile form controls render at 16px to remain readable and avoid browser zoom on focus.
- New admin and public forms inherit these roles from `typography-system.css`; component CSS should change spacing or emphasis, not invent another base size.
