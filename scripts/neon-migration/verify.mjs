import pg from 'pg'; import { supa, env } from './db.mjs';
process.env.NEON_URL ??= env.DATABASE_URL_UNPOOLED;
const src = await supa();
const dst = new pg.Client({ connectionString: process.env.NEON_URL.replace(/sslmode=require/, 'sslmode=verify-full') }); await dst.connect();
for (const c of [src, dst]) await c.query(`set timezone='UTC'; set extra_float_digits=1; set datestyle='ISO, YMD'; set intervalstyle='postgres'`);
const tables = (await src.query(`select table_name t from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1`)).rows.map(r => r.t);
let bad = 0;
for (const t of tables) {
  const cols = (await src.query(`select string_agg(quote_ident(column_name), ',' order by ordinal_position) s from information_schema.columns where table_schema='public' and table_name=$1`, [t])).rows[0].s;
  const rows = async c => new Map((await c.query(`select md5(x::text) h, x::text r from (select ${cols} from public."${t}") x`)).rows.map(r => [r.h, r.r]));
  const a = await rows(src), b = await rows(dst);
  const missing = [...a.keys()].filter(h => !b.has(h)), extra = [...b.keys()].filter(h => !a.has(h));
  if (missing.length || extra.length) { bad++; console.log(`DIFF ${t}: ${missing.length} rows differ`); console.log('   supabase:', a.get(missing[0])?.slice(0, 300)); console.log('   neon    :', b.get(extra[0])?.slice(0, 300)); }
  else console.log(`OK   ${t.padEnd(24)} ${a.size} rows identical`);
}
await src.end(); await dst.end(); process.exit(bad ? 1 : 0);
