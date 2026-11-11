import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('CreativeTool schema contains the canonical durable catalog contract', async () => {
  const schema = await read('prisma/schema.prisma');
  const block = schema.match(/model CreativeTool \{[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(block, 'CreativeTool model is required');
  for (const field of [
    'canonicalId', 'systemSeeded', 'seedVersion', 'publishedSlug', 'kind', 'tags',
    'featureBullets', 'proposedInputs', 'proposedOutputs', 'limitations', 'galleryImages',
    'pageBlocks', 'productStatus', 'demoMode', 'demoNotice', 'visible', 'featured',
    'demoUrl', 'liveUrl', 'liveUrlVerifiedAt', 'primaryBehavior', 'secondaryBehavior',
    'status', 'publishedSnapshot', 'scheduledAt', 'includeSitemap', 'deletedAt'
  ]) assert.match(block, new RegExp(`\\b${field}\\b`), `CreativeTool needs ${field}`);
  assert.match(schema, /enum CreativeToolKind \{\s*FLAGSHIP\s*MINI\s*\}/);
  assert.match(schema, /enum CreativeToolProductStatus \{\s*PLANNED\s*PREVIEW\s*BETA\s*LIVE\s*ARCHIVED\s*\}/);
  assert.match(schema, /enum CreativeToolDemoMode \{\s*CONCEPT\s*SAMPLE_INTERACTIVE\s*ACTUAL\s*\}/);
  assert.match(block, /canonicalId\s+String\?\s+@unique/);
  assert.match(block, /publishedSnapshot\s+Json\?/);
});

test('0024 migration is additive and creates only Creative Lab structures', async () => {
  const sql = await read('prisma/migrations/0024_creative_lab_catalog/migration.sql');
  assert.match(sql, /CREATE TABLE "CreativeTool"/);
  assert.match(sql, /CREATE TYPE "CreativeToolKind"/);
  assert.match(sql, /CREATE UNIQUE INDEX "CreativeTool_canonicalId_key"/);
  assert.doesNotMatch(sql, /\b(?:DROP|TRUNCATE|DELETE|UPDATE|INSERT)\b/i);
  assert.doesNotMatch(sql, /ALTER TABLE\s+"(?!CreativeTool")/i);
  for (const existing of ['Project', 'Content', 'CustomPage', 'SiteSettings', 'User']) {
    assert.doesNotMatch(sql, new RegExp(`(?:ALTER|DROP|TRUNCATE) TABLE "${existing}"`, 'i'));
  }
});

test('draft and published state are independently represented', async () => {
  const schema = await read('prisma/schema.prisma');
  const block = schema.match(/model CreativeTool \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(block, /slug\s+String\s+@unique/);
  assert.match(block, /publishedSlug\s+String\?\s+@unique/);
  assert.match(block, /status\s+ProjectStatus\s+@default\(DRAFT\)/);
  assert.match(block, /publishedSnapshot\s+Json\?/);
});
