import test from 'node:test';
import assert from 'node:assert/strict';
import { CREATIVE_TOOLS } from './creative-tools-catalog.mjs';
import { createData, publishedSnapshot, updateData, validateCreativeToolCatalog } from './seed-creative-tools.mjs';

test('canonical catalog has exactly six flagship and six mini tools', () => {
  const items = validateCreativeToolCatalog();
  assert.equal(items.length, 12);
  assert.equal(items.filter(item => item.kind === 'FLAGSHIP').length, 6);
  assert.equal(items.filter(item => item.kind === 'MINI').length, 6);
  assert.deepEqual(items.map(item => item.canonicalId).sort(), ['F01','F02','F03','F04','F05','F06','M01','M02','M03','M04','M05','M06']);
});

test('all initial tools are honest previews with working internal demo routes', () => {
  for (const item of CREATIVE_TOOLS) {
    assert.equal(item.productStatus, 'PREVIEW');
    assert.equal(item.status, 'PUBLISHED');
    assert.equal(item.visibility, 'PUBLIC');
    assert.equal(item.liveUrl, null);
    assert.equal(item.demoUrl, `/creative-lab/${item.slug}/demo`);
    assert.ok(item.demoNotice.includes('Concept preview'));
    assert.ok(item.problemStatement && item.proposedInputs.length && item.proposedOutputs.length && item.limitations.length && item.featureBullets.length);
  }
  assert.deepEqual(CREATIVE_TOOLS.filter(item => item.featured).map(item => item.canonicalId), ['F01','F03','F04']);
});

test('published snapshot excludes seed and verification metadata', () => {
  const item = CREATIVE_TOOLS[0];
  const snapshot = publishedSnapshot(item, new Date('2026-01-01T00:00:00.000Z'));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.publishedSlug, item.slug);
  assert.equal(snapshot.actions.primary.url, item.demoUrl);
  for (const privateField of ['systemSeeded','seedVersion','slug','liveUrlVerifiedAt','deletedBy']) assert.equal(snapshot[privateField], undefined);
});

test('upsert update branch preserves all owner-editable fields', () => {
  assert.deepEqual(updateData(), {systemSeeded:true, seedVersion:1});
  const created = createData(CREATIVE_TOOLS[0], new Date('2026-01-01T00:00:00.000Z'));
  assert.equal(created.publishedSnapshot.title, CREATIVE_TOOLS[0].title);
  assert.equal(created.publishedAt.toISOString(), '2026-01-01T00:00:00.000Z');
});

