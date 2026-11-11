// Usage (from repo root): npm run neon:copy  then  npm run neon:verify
// Needs SUPABASE_DB_URL and DATABASE_URL_UNPOOLED in .env.
// Copy Supabase (public schema) -> Neon, then verify row counts + checksums.
//   NEON_URL=... node copy.mjs            full (re)build of Neon public schema
// Rebuilding is only safe BEFORE cutover (it wipes Neon's public schema).
import pg from 'pg'; import fs from 'fs';
import { supa } from './db.mjs';
// Read values as Postgres text so nothing is reformatted in JS (keeps microseconds, exact JSON).
for (const oid of [1114, 1184, 1082, 1083, 1266, 1186, 114, 3802, 1700, 20]) pg.types.setTypeParser(oid, v => v);

import { env } from './db.mjs';
process.env.NEON_URL ??= env.DATABASE_URL_UNPOOLED;
if (!process.env.NEON_URL) throw new Error('NEON_URL / DATABASE_URL_UNPOOLED missing');
const src = await supa();
const dst = new pg.Client({ connectionString: process.env.NEON_URL.replace(/sslmode=require/, 'sslmode=verify-full') });
await dst.connect();
for (const c of [src, dst]) await c.query(`set timezone='UTC'`);

// 0. Guard: refuse to wipe a Neon DB that has been live (orders newer than Supabase's newest).
const exists = (await dst.query(`select to_regclass('public.orders') r`)).rows[0].r;
if (exists && !process.env.FORCE) {
  const [a] = (await src.query(`select max(created_at) m from public.orders`)).rows;
  const [b] = (await dst.query(`select max(created_at) m from public.orders`)).rows;
  if (b.m && (!a.m || b.m > a.m)) throw new Error('Neon has orders newer than Supabase - it looks live. Refusing to rebuild (set FORCE=1 to override).');
}

// 1. Fresh schema
await dst.query(`drop schema if exists public cascade; create schema public; grant all on schema public to public;`);
await dst.query(fs.readFileSync(new URL('./1_tables.sql', import.meta.url), 'utf8'));

// 2. Data, in one transaction
const tables = (await src.query(`select table_name t from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1`)).rows.map(r => r.t);
await dst.query('begin');
for (const t of tables) {
  const cols = (await src.query(`select column_name c, data_type d from information_schema.columns where table_schema='public' and table_name=$1 and is_generated='NEVER' order by ordinal_position`, [t])).rows;
  const rows = (await src.query(`select * from public."${t}"`)).rows;
  for (const r of rows) {
    const vals = cols.map(({ c, d }) => r[c]);
    await dst.query(`insert into public."${t}" (${cols.map(x => `"${x.c}"`).join(',')}) overriding system value values (${cols.map((_, i) => '$' + (i + 1)).join(',')})`, vals);
  }
}
await dst.query('commit');

// 3. FKs, indexes, functions, triggers, views
await dst.query(fs.readFileSync(new URL('./2_after.sql', import.meta.url), 'utf8'));

// 4. Admin login: carry Supabase Auth bcrypt hashes into admin_users.password_hash
await dst.query(`alter table public.admin_users add column if not exists password_hash text`);
const admins = (await src.query(`select id, encrypted_password from auth.users`)).rows;
for (const a of admins) await dst.query(`update public.admin_users set password_hash=$2 where id=$1`, [a.id, a.encrypted_password]);

// 5. Verify
const checksum = async (c, t) => (await c.query(
  `select count(*)::int n, md5(coalesce(string_agg(x::text, '|' order by x::text), '')) h from public."${t}" x`)).rows[0];
let bad = 0;
for (const t of tables) {
  const a = await checksum(src, t);
  let b = await checksum(dst, t);
  if (t === 'admin_users') b = (await dst.query(`select count(*)::int n, md5(coalesce(string_agg(x::text,'|' order by x::text),'')) h from (select ${(await src.query(`select string_agg('"'||column_name||'"', ',' order by ordinal_position) s from information_schema.columns where table_schema='public' and table_name='admin_users'`)).rows[0].s} from public.admin_users) x`)).rows[0];
  const ok = a.n === b.n && a.h === b.h;
  if (!ok) bad++;
  console.log(`${ok ? 'OK  ' : 'DIFF'} ${t.padEnd(24)} supabase=${a.n} neon=${b.n}${a.h === b.h ? '' : ' (checksum differs)'}`);
}
const withPw = (await dst.query(`select count(*)::int n from public.admin_users where password_hash like '$2%'`)).rows[0].n;
console.log(`admin logins carried over: ${withPw}/${admins.length}`);
await src.end(); await dst.end();
process.exit(bad ? 1 : 0);
