export const PREVIEW_EXPERIENCE_SEED_VERSION = 1;

export const presentationProjectSlugs = [
  'tmnt-face-body-glitter-jelly-amazon-listing',
  'round-powder-brush-amazon-premium-a-plus',
  'divine-face-perfecting-kit-amazon-premium-a-plus',
  'color-changing-lip-cheek-tint-amazon-premium-a-plus',
];

export const previewPresentationConfig = {
  recruiter: {
    enabled: true,
    noIndex: true,
    title: 'Three-minute recruiter view',
    subtitle: 'A concise walkthrough of verified commercial work, creative systems, and professional evidence.',
    durationLabel: 'ABOUT 3 MINUTES · PAUSE OR EXPLORE FREELY',
    projectSlugs: presentationProjectSlugs,
    stepLabels: ['IDENTITY & POSITION', 'SPECIALIZATION', 'FLAGSHIP CASE STUDY', 'SECOND CASE STUDY', 'HOW I THINK', 'CREATIVE SYSTEMS', 'PROFESSIONAL PROOF', 'NEXT STEP'],
    primaryAction: { label: 'EXPLORE FULL PORTFOLIO', url: '/work.html' },
    secondaryAction: { label: 'RECRUITER INQUIRY', url: '/?intent=RECRUITER&sourcePath=/hire/presentation#contact' },
  },
  client: {
    enabled: true,
    noIndex: true,
    title: 'Creative studio introduction',
    subtitle: 'A focused view of services, published work, and the collaboration process.',
    durationLabel: 'SHORT STUDIO WALKTHROUGH · PAUSE OR EXPLORE FREELY',
    projectSlugs: presentationProjectSlugs,
    stepLabels: ['STUDIO POSITION', 'SERVICES', 'RELEVANT CASE STUDY', 'SECOND CASE STUDY', 'PROCESS', 'CREATIVE SYSTEMS', 'CLIENT PROOF', 'START A PROJECT'],
    primaryAction: { label: 'EXPLORE SERVICES', url: '/studio' },
    secondaryAction: { label: 'START A PROJECT', url: '/?intent=CLIENT&sourcePath=/studio/presentation#contact' },
  },
};

const baseBlock = (id, type, data) => ({
  id,
  type,
  widgetVersion: 1,
  enabled: true,
  data,
  style: { theme: 'DEFAULT', align: 'LEFT', padding: 'MEDIUM', marginTop: 0, marginBottom: 0, paddingX: 0, paddingY: 0, borderWidth: 0, borderRadius: 0, borderColor: '', backgroundColor: '', textColor: '', customClass: '', customCss: '' },
  responsive: { hideDesktop: false, hideTablet: false, hideMobile: false },
  motion: { enabled: false },
  children: [],
});

const evidence = (id, evidenceKey, heading, text) => baseBlock(id, 'RICH_TEXT', {
  evidenceKey,
  text: `${heading}\n\n${text}`,
});

export const technicalCaseStudy = {
  title: 'Building a Modular Page Studio for a Personal Creative Portfolio',
  slug: 'modular-page-studio-technical-case-study',
  path: '/pages/modular-page-studio-technical-case-study',
  templateKey: 'page-studio-technical-case-study',
  seoTitle: 'Modular Page Studio Technical Case Study — Mahmudul Hassan',
  seoDescription: 'An evidence-led technical case study covering the architecture, publishing workflow, accessibility, security, and QA behind this portfolio’s modular Page Studio.',
  blocks: [
    baseBlock('page-studio-case-hero', 'HERO', {
      eyebrow: 'TECHNICAL CASE STUDY',
      heading: 'Building a Modular Page Studio for a Personal Creative Portfolio',
      text: 'A repository-backed account of how reusable page composition, guarded publishing, and public rendering were added without replacing the portfolio’s existing content system.',
      ctaLabel: 'VIEW SELECTED WORK',
      ctaUrl: '/work.html',
      image: '',
      imageAlt: '',
    }),
    evidence('page-studio-case-motivation', 'motivation', '01 / Motivation', 'The portfolio needed a way to assemble landing pages, service pages, and long-form stories without shipping a new hard-coded route for every idea. The goal was a CMS-managed editor that could reuse live portfolio data while keeping drafts separate from public content.'),
    evidence('page-studio-case-constraints', 'constraints', '02 / Constraints', 'The implementation had to fit the existing Express, Prisma, and static-frontend stack; preserve current routes; work within hosted Preview infrastructure; avoid copying media on page duplication; keep private and draft records out of public responses; and remain maintainable through the existing admin CMS.'),
    evidence('page-studio-case-architecture', 'architecture', '03 / Architecture', 'Page definitions are stored as versioned JSON block trees in Prisma. Authenticated admin routes validate edits, paths, embeds, and publish readiness. Publishing writes an immutable public snapshot, while the public renderer resolves only published snapshots and approved dynamic collections. Draft edits therefore cannot silently change the live page.'),
    evidence('page-studio-case-components', 'component-library', '04 / Component library', 'A typed widget registry covers layout, copy, media, conversion, dynamic collections, motion, embeds, and isolated custom code. Every block shares style, responsive, motion, nesting, and version metadata. Templates, reusable blocks, navigation presets, and taxonomy build on the same validated block contract.'),
    evidence('page-studio-case-workflow', 'creation-workflow', '05 / Creation workflow', 'An editor can start from a template, compose and reorder widgets, save a draft with optimistic conflict protection, preview the result, inspect publish issues, and publish explicitly. Revision snapshots are created around publishing and restoration so a previous state can be recovered without mutating the current live snapshot until republished.'),
    evidence('page-studio-case-qa', 'qa-reliability', '06 / QA and reliability', 'Automated contract tests cover widget schemas, nesting limits, template evidence requirements, placeholder blocking, public snapshot boundaries, Creative Lab references, and regression-sensitive frontend behavior. TypeScript compilation and production builds are part of the release gate. Preview browser checks are used for routes and responsive rendering; unverified workflows remain labelled as such.'),
    evidence('page-studio-case-accessibility', 'accessibility', '07 / Accessibility', 'The system uses semantic heading controls, required alternative text for meaningful media, titled embeds, keyboard-operable native controls, responsive visibility settings, and reduced-motion-aware public presentation behavior. Publish preflight reports missing headings and blocks images or galleries that omit required alternative text.'),
    evidence('page-studio-case-security', 'security', '08 / Security', 'CMS routes require authentication, global controls require an administrator role, and public queries read published snapshots rather than drafts. External embeds are restricted to HTTPS origins on an allow-list. Custom code is size-bounded and rendered in an isolated sandbox, while reserved paths prevent a page from replacing core application routes.'),
    evidence('page-studio-case-lessons', 'lessons-tradeoffs', '09 / Lessons and trade-offs', 'A JSON block model makes the editor extensible, but it requires strict migration and validation rules. Snapshot publishing adds storage, yet creates a clearer safety boundary than rendering mutable drafts. Dynamic widgets reduce duplicated copy, while also making runtime data availability part of page QA. Visual evidence is intentionally left for the portfolio owner to add when an authorized image is available.'),
    evidence('page-studio-case-contribution', 'individual-contribution', '10 / Individual contribution', 'Mahmudul Hassan defined the portfolio goals, supplied the commercial source material, and reviewed the Preview direction. The Page Studio implementation, validation, tests, and release evidence were developed in this repository with AI-assisted engineering. No client performance result or team contribution is claimed without a supplied source.'),
    baseBlock('page-studio-case-projects', 'PROJECT_GRID', { heading: 'Published work used to verify the system', category: '', limit: 4 }),
    baseBlock('page-studio-case-cta', 'AVAILABILITY_CTA', {
      status: 'REPOSITORY-BACKED CASE STUDY',
      heading: 'Explore the published portfolio',
      text: 'The public case studies and focused presentation modes use the same guarded CMS evidence.',
      label: 'VIEW SELECTED WORK',
      url: '/work.html',
    }),
  ],
};

export function publishedTechnicalCaseStudy(now = new Date()) {
  return {
    ...technicalCaseStudy,
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    navbarPresetId: null,
    ogImage: null,
    canonicalUrl: null,
    noIndex: false,
    noFollow: false,
    includeSitemap: true,
    scheduledAt: null,
    publishedPath: technicalCaseStudy.path,
    publishedAt: now.toISOString(),
    publicModifiedAt: now.toISOString(),
  };
}
