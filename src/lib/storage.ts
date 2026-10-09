import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'node:fs/promises';
import path from 'node:path';
import { put as putBlob, del as deleteBlob } from '@vercel/blob';

const frontendRoot = path.resolve(process.cwd(), 'portfolio');

function s3Client() {
  return new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: process.env.S3_ACCESS_KEY_ID
      ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' }
      : undefined,
  });
}

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY));
}

function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);
}

function safePath(key: string) {
  return key.replace(/^\/+/, '').split('/').map(part => part.replace(/[^a-zA-Z0-9._-]/g, '-')).join('/');
}

export async function createUploadUrl(key: string, contentType: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Use the authenticated media upload endpoint for Vercel Blob uploads');
  if (!storageConfigured()) throw new Error('Object storage is not configured');
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
    CacheControl: 'public,max-age=31536000,immutable',
  });
  const url = await getSignedUrl(s3Client(), command, { expiresIn: 900 });
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '');
  return { url, publicUrl: base ? `${base}/${key}` : undefined, key };
}

export async function uploadBuffer(key: string, body: Buffer, contentType: string) {
  const cleanKey = safePath(key);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await putBlob(cleanKey, body, { access: 'public', contentType, addRandomSuffix: false, token: process.env.BLOB_READ_WRITE_TOKEN });
    return { key: blob.pathname, publicUrl: blob.url, provider: 'vercel-blob' as const };
  }

  if (storageConfigured()) {
    await s3Client().send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: cleanKey,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public,max-age=31536000,immutable',
    }));
    const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '');
    if (!base) throw new Error('S3_PUBLIC_BASE_URL is required for direct uploads');
    return { key: cleanKey, publicUrl: `${base}/${cleanKey}`, provider: 's3' as const };
  }

  if (githubConfigured()) {
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const mediaDir = (process.env.GITHUB_MEDIA_DIR || 'portfolio/uploads').replace(/\/+$/, '');
    const repoPath = `${mediaDir}/${cleanKey.split('/').pop()}`;
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${repoPath.split('/').map(encodeURIComponent).join('/')}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'mahmudul-portfolio-cms',
      },
      body: JSON.stringify({
        message: `portfolio: add ${path.basename(cleanKey)}`,
        content: body.toString('base64'),
        branch,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.message || `GitHub upload failed (${response.status})`);
    const publicBase = process.env.GITHUB_PUBLIC_BASE_URL?.replace(/\/$/, '') || `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
    return { key: cleanKey, publicUrl: `${publicBase}/${repoPath}`, provider: 'github' as const };
  }

  const relative = `uploads/${cleanKey}`;
  const target = path.resolve(frontendRoot, relative);
  const root = path.resolve(frontendRoot, 'uploads');
  if (!target.startsWith(root + path.sep)) throw new Error('Invalid upload path');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, body);
  return { key: cleanKey, publicUrl: `/${relative.replace(/\\/g, '/')}`, provider: 'local' as const };
}

export async function deleteStoredObject(key: string, provider?: string) {
  const cleanKey=safePath(key);
  if ((provider==='vercel-blob' || (!provider && process.env.BLOB_READ_WRITE_TOKEN)) && process.env.BLOB_READ_WRITE_TOKEN) { await deleteBlob(cleanKey,{token:process.env.BLOB_READ_WRITE_TOKEN}); return {ok:true}; }
  if ((provider==='s3' || (!provider && storageConfigured())) && storageConfigured()) { await s3Client().send(new DeleteObjectCommand({Bucket:process.env.S3_BUCKET!,Key:cleanKey})); return {ok:true}; }
  if ((provider==='github' || (!provider && githubConfigured())) && githubConfigured()) {
    const owner=process.env.GITHUB_OWNER!,repo=process.env.GITHUB_REPO!,branch=process.env.GITHUB_BRANCH||'main',mediaDir=(process.env.GITHUB_MEDIA_DIR||'portfolio/uploads').replace(/\/+$/,'');
    const repoPath=`${mediaDir}/${cleanKey.split('/').pop()}`; const endpoint=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${repoPath.split('/').map(encodeURIComponent).join('/')}`;
    const h={Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'mahmudul-portfolio-cms'}; const get=await fetch(endpoint+`?ref=${encodeURIComponent(branch)}`,{headers:h}); if(get.status===404)return {ok:true}; const meta=await get.json(); const del=await fetch(endpoint,{method:'DELETE',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({message:`portfolio: delete ${path.basename(cleanKey)}`,sha:meta.sha,branch})}); if(!del.ok)throw new Error(`GitHub delete failed (${del.status})`); return {ok:true};
  }
  const target=path.resolve(frontendRoot,`uploads/${cleanKey}`); const base=path.resolve(frontendRoot,'uploads'); if(!target.startsWith(base+path.sep))throw new Error('Invalid upload path'); await fs.rm(target,{force:true}); return {ok:true};
}
