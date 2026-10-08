import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { safeSnapshot } from '../api/dist/lib/revisions.js';
import { redact } from '../api/dist/lib/monitoring.js';

test('backup/revision snapshots remove secret-bearing fields',()=>{
  const snapshot=safeSnapshot({title:'Safe',password:'hidden',jwtToken:'hidden',nested:{apiKey:'hidden',body:'kept'},createdAt:new Date('2026-01-02T03:04:05Z')});
  assert.equal(snapshot.title,'Safe');assert.equal(snapshot.password,undefined);assert.equal(snapshot.jwtToken,undefined);assert.equal(snapshot.nested.apiKey,undefined);assert.equal(snapshot.nested.body,'kept');assert.equal(snapshot.createdAt,'2026-01-02T03:04:05.000Z');
});

test('monitoring context redacts private and credential fields',()=>{
  const value=redact({authorization:'Bearer abc',cookie:'session=abc',email:'person@example.com',message:'private inquiry',path:'/api/example',nested:{secret:'x'}});
  assert.equal(value.authorization,'[redacted]');assert.equal(value.cookie,'[redacted]');assert.equal(value.email,'[redacted]');assert.equal(value.message,'[redacted]');assert.equal(value.path,'/api/example');assert.equal(value.nested.secret,'[redacted]');
});

test('operations migration is additive',async()=>{
  const sql=await fs.readFile(new URL('../prisma/migrations/0019_operations_reliability/migration.sql',import.meta.url),'utf8');
  assert.match(sql,/CREATE TABLE "ContentRevision"/);assert.match(sql,/ALTER TABLE "Project" ADD COLUMN/);assert.doesNotMatch(sql,/\b(DROP TABLE|TRUNCATE|DELETE FROM)\b/i);
});

test('secure preview carries crawler and cache protections',async()=>{
  const app=await fs.readFile(new URL('../api/src/app.ts',import.meta.url),'utf8');const html=await fs.readFile(new URL('../portfolio/preview.html',import.meta.url),'utf8');
  assert.match(app,/noindex,nofollow,noarchive/);assert.match(app,/private, no-store/);assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
});
