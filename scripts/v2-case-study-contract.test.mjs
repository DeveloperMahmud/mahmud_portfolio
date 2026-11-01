import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Project remains the additive case-study source of truth', async () => {
  const [schema, contract] = await Promise.all([
    read('prisma/schema.prisma'),
    read('docs/v2-case-study-contract.md')
  ]);
  for (const field of ['role', 'challenge', 'approach', 'process', 'results', 'deliverables', 'projectBlocks', 'resultMetrics']) {
    assert.match(schema, new RegExp(`\\b${field}\\b`), `Project contract needs ${field}`);
  }
  assert.match(schema, /model ProjectMetric[\s\S]*sourceNote\s+String\?/);
  assert.match(schema, /model ProjectMetric[\s\S]*verified\s+Boolean/);
  assert.match(contract, /`Project` remains the only canonical case-study record/);
  assert.match(contract, /No database migration is required/);
});

test('public project delivery fails closed for private case studies', async () => {
  const [publicRoutes, pageStudio, app] = await Promise.all([
    read('src/routes/public.ts'),
    read('src/routes/page-studio-public.ts'),
    read('src/app.ts')
  ]);
  for (const source of [publicRoutes, pageStudio, app]) {
    assert.match(source, /status:\s*'PUBLISHED'/);
    assert.match(source, /visibility:\s*'PUBLIC'/);
    assert.match(source, /clientOnly:\s*false/);
  }
});

test('public metrics are verified and private source notes are not selected', async () => {
  const sources = await Promise.all([
    read('src/routes/public.ts'),
    read('src/routes/page-studio.ts'),
    read('src/routes/page-studio-public.ts')
  ]);
  for (const source of sources) {
    assert.match(source, /verified:\s*true/);
    assert.match(source, /visible:\s*true/);
    assert.doesNotMatch(source, /select:\s*\{[^}]*sourceNote\s*:\s*true/s);
  }
});

test('writer workflow cannot publish case studies', async () => {
  const rbac = await read('src/lib/rbac.ts');
  assert.match(rbac, /Writer accounts can edit project and journal drafts only/);
  assert.match(rbac, /req\.body\.status\s*=\s*'DRAFT'/);
  assert.match(rbac, /cannot delete, bulk-publish or share records/);
});
