import crypto from 'node:crypto';

export function newShareToken() { return crypto.randomBytes(32).toString('base64url'); }
export function hashShareToken(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }
