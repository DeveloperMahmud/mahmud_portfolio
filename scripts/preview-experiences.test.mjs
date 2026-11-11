import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { presentationProjectSlugs, previewPresentationConfig, publishedTechnicalCaseStudy, technicalCaseStudy } from './preview-experiences.mjs';

test('Preview presentation modes use the four published Behance case studies', () => {
  assert.equal(presentationProjectSlugs.length, 4);
  assert.equal(new Set(presentationProjectSlugs).size, 4);
  for (const mode of ['recruiter', 'client']) {
    assert.equal(previewPresentationConfig[mode].enabled, true);
    assert.equal(previewPresentationConfig[mode].noIndex, true);
    assert.deepEqual(previewPresentationConfig[mode].projectSlugs, presentationProjectSlugs);
    assert.equal(previewPresentationConfig[mode].stepLabels.length, 8);
  }
});

test('technical case study replaces every evidence prompt with repository-backed copy', () => {
  const required = ['motivation', 'constraints', 'architecture', 'component-library', 'creation-workflow', 'qa-reliability', 'accessibility', 'security', 'lessons-tradeoffs', 'individual-contribution'];
  assert.deepEqual(technicalCaseStudy.blocks.filter(block => block.data.evidenceKey).map(block => block.data.evidenceKey), required);
  assert.doesNotMatch(JSON.stringify(technicalCaseStudy), /evidence required|replace this|conversion increased|revenue increased/i);
  assert.match(JSON.stringify(technicalCaseStudy), /AI-assisted engineering/);
});

test('technical case study publishes a stable public snapshot without fabricated media', () => {
  const snapshot = publishedTechnicalCaseStudy(new Date('2026-11-11T00:00:00.000Z'));
  assert.equal(snapshot.status, 'PUBLISHED');
  assert.equal(snapshot.visibility, 'PUBLIC');
  assert.equal(snapshot.publishedPath, '/pages/modular-page-studio-technical-case-study');
  assert.equal(snapshot.noIndex, false);
  assert.equal(snapshot.includeSitemap, true);
  assert.equal(snapshot.blocks.some(block => ['IMAGE', 'GALLERY', 'MEDIA_MOSAIC', 'VIDEO'].includes(block.type)), false);
});

test('deployment seed is Preview-only and preserves an existing CMS record', async () => {
  const source = await readFile(new URL('./seed-preview-experiences.mjs', import.meta.url), 'utf8');
  assert.match(source, /VERCEL_ENV === 'preview'/);
  assert.match(source, /only Vercel Preview deployments are authorized/);
  assert.match(source, /findUnique\(\{ where: \{ slug: technicalCaseStudy\.slug \} \}\)/);
  assert.match(source, /preserve .*an existing CMS record was found/);
  assert.doesNotMatch(source, /VERCEL_ENV === 'production'.*create/s);
});
