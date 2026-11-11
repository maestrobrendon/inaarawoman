#!/usr/bin/env node
/**
 * Push the build-time env vars from .env to the Vercel project (Production,
 * Preview and Development) using the token in .env.vercel.local.
 *
 *   npm run vercel:env
 *
 * Only the keys listed in KEYS are sent — server secrets (service-role keys,
 * Postgres credentials, API secrets) stay local. Existing values are overwritten.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadVercelEnv } from './vercel.mjs';

const KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET',
  'VITE_INSTAGRAM_FEED_URL',
];
const TARGETS = ['production', 'preview', 'development'];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const v = loadVercelEnv();

const local = {};
for (const line of readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !(m[1] in local)) local[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const url = `https://api.vercel.com/v10/projects/${v.VERCEL_PROJECT_ID}/env?upsert=true&teamId=${v.VERCEL_ORG_ID}`;
let failed = 0;
for (const key of KEYS) {
  const value = local[key];
  if (!value) {
    console.log(`skip  ${key} (empty or missing in .env)`);
    continue;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${v.VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, type: 'encrypted', target: TARGETS }),
  });
  if (res.ok) console.log(`ok    ${key}`);
  else {
    failed++;
    const body = await res.json().catch(() => ({}));
    console.log(`FAIL  ${key}: ${body.error?.message ?? res.status}`);
  }
}
process.exit(failed ? 1 : 0);
