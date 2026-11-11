#!/usr/bin/env node
// Applies db/migrations/*.sql to Neon (DATABASE_URL_UNPOOLED from .env), in
// filename order, each once. Applied files are recorded in public.schema_migrations.
//   npm run db:migrate            apply pending migrations
//   npm run db:migrate -- --dry   list pending migrations only
import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const l of readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const url = process.env.DATABASE_URL_UNPOOLED || env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error('DATABASE_URL_UNPOOLED missing from .env');

const dir = path.join(root, 'db', 'migrations');
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const c = new pg.Client({ connectionString: url.replace(/sslmode=require/, 'sslmode=verify-full') });
await c.connect();
await c.query(`create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz default now())`);
const done = new Set((await c.query('select name from public.schema_migrations')).rows.map((r) => r.name));
const pending = files.filter((f) => !done.has(f));
console.log(pending.length ? `Pending: ${pending.join(', ')}` : 'Database is up to date.');

if (!process.argv.includes('--dry')) {
  for (const f of pending) {
    await c.query('begin');
    try {
      await c.query(readFileSync(path.join(dir, f), 'utf8'));
      await c.query('insert into public.schema_migrations (name) values ($1)', [f]);
      await c.query('commit');
      console.log(`Applied ${f}`);
    } catch (e) {
      await c.query('rollback');
      console.error(`Failed ${f}: ${e.message} (rolled back, nothing changed)`);
      process.exitCode = 1;
      break;
    }
  }
}
await c.end();
