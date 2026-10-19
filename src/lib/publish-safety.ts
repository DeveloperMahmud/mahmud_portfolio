import fs from 'node:fs/promises';
import path from 'node:path';

export type PublishIssue = { field: string; code: string; message: string; severity: 'ERROR' | 'WARNING' };

const placeholder = /(^|\b)(test|untitled|lorem ipsum|placeholder|demo project)(\b|$)/i;
const text = (value: unknown) => String(value ?? '').trim();
const asArray = (value: unknown) => Array.isArray(value) ? value : [];

async function localAssetExists(raw: string) {
  const value = text(raw);
  if (!value || /^https?:\/\//i.test(value) || value.startsWith('data:')) return true;
  const relative = value.replace(/^\/+/, '');
  if (!/^(assets|uploads)\//.test(relative)) return true;
  const root = path.resolve(process.cwd(), 'portfolio');
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) return false;
  try { await fs.access(target); return true; } catch { return false; }
}

async function mediaIssues(value: unknown, field: string, requireAlt = false): Promise<PublishIssue[]> {
  const issues: PublishIssue[] = [];
  const url = typeof value === 'object' && value ? text((value as any).url) : text(value);
  if (!url) return issues;
  if (!(await localAssetExists(url))) {
    issues.push({ field, code: 'MISSING_LOCAL_MEDIA', severity: 'ERROR', message: `${field} points to a local file that is not present in this deployment.` });
  }
  if (requireAlt && !text((value as any)?.alt)) {
    issues.push({ field, code: 'MISSING_ALT', severity: 'ERROR', message: `${field} needs descriptive alt text before publishing.` });
  }
  return issues;
}

export async function projectPublishIssues(input: Record<string, any>): Promise<PublishIssue[]> {
  const issues: PublishIssue[] = [];
  const title = text(input.title);
  if (!title || placeholder.test(title)) issues.push({ field: 'title', code: 'PLACEHOLDER_TITLE', severity: 'ERROR', message: 'Replace the placeholder project title before publishing.' });
  if (!text(input.category)) issues.push({ field: 'category', code: 'MISSING_CATEGORY', severity: 'ERROR', message: 'Choose a project category before publishing.' });
  if (!text(input.coverImage)) issues.push({ field: 'coverImage', code: 'MISSING_COVER', severity: 'WARNING', message: 'Add a cover image for a stronger archive and social preview.' });
  issues.push(...await mediaIssues(input.coverImage, 'coverImage'));
  issues.push(...await mediaIssues(input.homepageImage, 'homepageImage'));
  issues.push(...await mediaIssues(input.sliderImage, 'sliderImage'));
  issues.push(...await mediaIssues(input.ogImage, 'ogImage'));
  for (const [index, item] of asArray(input.gallery).entries()) issues.push(...await mediaIssues(item, `gallery[${index}]`, true));
  const body = [input.description, input.challenge, input.approach, input.process, input.results].map(text).join(' ');
  if (body.length < 120) issues.push({ field: 'caseStudy', code: 'THIN_CASE_STUDY', severity: 'WARNING', message: 'Add more project context: the challenge, approach, process or result.' });
  return issues;
}

export async function contentPublishIssues(input: Record<string, any>): Promise<PublishIssue[]> {
  const issues: PublishIssue[] = [];
  const title = text(input.title);
  if (!title || placeholder.test(title)) issues.push({ field: 'title', code: 'PLACEHOLDER_TITLE', severity: 'ERROR', message: 'Replace the placeholder article title before publishing.' });
  if (text(input.body).length < 180) issues.push({ field: 'body', code: 'THIN_CONTENT', severity: 'ERROR', message: 'Add at least a useful short article before publishing.' });
  if (!text(input.excerpt)) issues.push({ field: 'excerpt', code: 'MISSING_EXCERPT', severity: 'WARNING', message: 'Add an excerpt for archive cards and search previews.' });
  issues.push(...await mediaIssues(input.coverImage, 'coverImage'));
  issues.push(...await mediaIssues(input.ogImage, 'ogImage'));
  for (const [index, item] of asArray(input.gallery).entries()) issues.push(...await mediaIssues(item, `gallery[${index}]`, true));
  return issues;
}

export function publishBlocked(issues: PublishIssue[]) { return issues.filter(issue => issue.severity === 'ERROR'); }
