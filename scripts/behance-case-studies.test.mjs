import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { behanceCaseStudies } from './behance-case-studies.mjs';

const repoUrl = path => new URL(`../${path.replace(/^\//, 'portfolio/')}`, import.meta.url);

test('Behance drafts keep owner-published provenance and unique slugs', () => {
  assert.equal(behanceCaseStudies.length, 4);
  const slugs = new Set();

  for (const entry of behanceCaseStudies) {
    assert.equal(entry.source.platform, 'Behance');
    assert.equal(entry.source.owner, 'Mahmudul Hassan');
    assert.match(entry.source.projectUrl, /^https:\/\/www\.behance\.net\/gallery\/\d+\//);
    assert.equal(entry.project.status, 'DRAFT');
    assert.equal(entry.project.visibility, 'PUBLIC');
    assert.ok(entry.project.role);
    assert.ok(entry.project.challenge);
    assert.ok(entry.project.process);
    assert.ok(entry.project.deliverables.length >= 5);
    assert.deepEqual(entry.project.resultMetrics, []);
    assert.ok(!slugs.has(entry.project.slug), `duplicate slug: ${entry.project.slug}`);
    slugs.add(entry.project.slug);
  }
});

test('powder-brush draft preserves the verified responsive evidence boundary', () => {
  const { source, project } = behanceCaseStudies[1];
  assert.equal(source.publishedAt, '2025-06-03');
  assert.deepEqual(project.tools, ['Adobe Photoshop', 'Adobe Illustrator']);
  assert.equal(project.gallery.length, 3);
  assert.equal(project.liveUrl, null);
  assert.match(project.results, /No sales, conversion-rate, ranking, revenue, or client-approval result is claimed/);
  assert.match(project.process, /observable presentation structure/);
});

test('face-kit draft preserves responsive boards and Photoshop-only attribution', () => {
  const { source, project } = behanceCaseStudies[2];
  assert.equal(source.publishedAt, '2025-08-06');
  assert.deepEqual(project.tools, ['Adobe Photoshop']);
  assert.equal(project.gallery.length, 3);
  assert.equal(project.liveUrl, null);
  assert.match(project.results, /No sales, conversion-rate, ranking, revenue, client-approval, or marketplace-performance result is claimed/);
});

test('lip-tint draft avoids unsupported commercial and formula claims', () => {
  const { source, project } = behanceCaseStudies[3];
  assert.equal(source.publishedAt, '2025-08-07');
  assert.deepEqual(project.tools, ['Adobe Photoshop']);
  assert.equal(project.gallery.length, 2);
  assert.equal(project.liveUrl, null);
  assert.match(project.results, /formula-validation/);
  assert.match(project.process, /evidence-bounded reading/);
});

test('flagship draft has complete evidence-led case-study fields without invented metrics', () => {
  const { project } = behanceCaseStudies[0];
  assert.ok(project.role);
  assert.ok(project.challenge);
  assert.ok(project.approach);
  assert.ok(project.process);
  assert.ok(project.deliverables.length >= 5);
  assert.ok(project.gallery.length >= 2);
  assert.deepEqual(project.tools, ['Adobe Photoshop']);
  assert.deepEqual(project.resultMetrics, []);
  assert.match(project.results, /No sales, conversion-rate, ranking, or revenue uplift is claimed/);
  assert.match(project.liveUrl, /^https:\/\/www\.amazon\.com\/dp\//);
});

test('every local case-study asset exists and has accessible alt text', async () => {
  for (const { project } of behanceCaseStudies) {
    for (const item of project.gallery) {
      assert.ok(item.alt.trim());
      await access(repoUrl(item.url));
    }
  }
});

test('seed is draft-first and preserves CMS-edited records', async () => {
  const source = await readFile(new URL('./seed-behance-case-studies.mjs', import.meta.url), 'utf8');
  assert.match(source, /PUBLISH_BEHANCE_CASE_STUDIES === 'true'/);
  assert.match(source, /VERCEL_ENV === 'preview'/);
  assert.match(source, /VERCEL_ENV === 'production'/);
  assert.match(source, /production deployments require a separate owner-approved release/);
  assert.match(source, /findUnique\(\{ where: \{ slug: project\.slug \} \}\)/);
  assert.match(source, /an existing CMS record was preserved/);
  assert.doesNotMatch(source, /\.update\(|\.upsert\(/);
});

test('Vercel build seeds the preview-visible case studies after migrations', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts['vercel-build'], /vercel-migrate\.mjs.*seed-creative-tools\.mjs.*seed-behance-case-studies\.mjs.*npm run build/);
});
