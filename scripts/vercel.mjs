#!/usr/bin/env node
/**
 * Token-scoped Vercel CLI wrapper for this project.
 *
 * Reads credentials from .env.vercel.local (gitignored) and runs the Vercel
 * CLI with --token/--scope plus VERCEL_ORG_ID/VERCEL_PROJECT_ID, so this repo
 * always talks to the Inaara Woman account — regardless of which account the
 * global `vercel login` is signed in to.
 *
 *   npm run vc -- <any vercel args>     e.g. npm run vc -- ls
 *   npm run deploy:preview              preview deployment
 *   npm run deploy                      production deployment
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadVercelEnv() {
  const file = path.join(root, '.env.vercel.local');
  if (!existsSync(file)) {
    console.error(
      'Missing .env.vercel.local. Create it with VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID (and optionally VERCEL_SCOPE).'
    );
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  for (const k of ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID']) {
    if (!env[k]) {
      console.error(`.env.vercel.local is missing ${k}`);
      process.exit(1);
    }
  }
  return env;
}

// Run as CLI (not when imported by another script).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const v = loadVercelEnv();
  const args = [...process.argv.slice(2), '--token', v.VERCEL_TOKEN];
  if (v.VERCEL_SCOPE) args.push('--scope', v.VERCEL_SCOPE);

  // Prefer a globally installed CLI; fall back to npx.
  const hasGlobal = spawnSync('vercel', ['--version'], { shell: true, stdio: 'ignore' }).status === 0;
  const [cmd, cmdArgs] = hasGlobal ? ['vercel', args] : ['npx', ['--yes', 'vercel@latest', ...args]];

  const res = spawnSync(cmd, cmdArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VERCEL_ORG_ID: v.VERCEL_ORG_ID,
      VERCEL_PROJECT_ID: v.VERCEL_PROJECT_ID,
    },
  });
  process.exit(res.status ?? 1);
}
