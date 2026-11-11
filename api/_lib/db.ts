// Shared Neon (Postgres) connection for the Vercel functions in /api.
// DATABASE_URL is injected by the Neon ↔ Vercel integration.
import pg from 'pg';

// Return values the way the old Supabase REST API did, so the frontend
// keeps working unchanged: numerics/bigints as JS numbers, dates as strings.
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v))); // numeric
pg.types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10))); // int8
pg.types.setTypeParser(1082, (v) => v); // date -> 'YYYY-MM-DD'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool: pg.Pool | undefined;
export function db(): pg.Pool {
  if (!connectionString) throw new Error('DATABASE_URL is not configured');
  pool ??= new pg.Pool({ connectionString, max: 3, ssl: { rejectUnauthorized: false } });
  return pool;
}

export type ColumnInfo = { type: string; udt: string };
export type Relation = { table: string; column: string; refTable: string; refColumn: string };
export type SchemaInfo = { tables: Map<string, Map<string, ColumnInfo>>; pk: Map<string, string[]>; fks: Relation[] };

let schemaCache: Promise<SchemaInfo> | undefined;

/** Live table/column/foreign-key catalogue, used to validate every identifier. */
export function schema(): Promise<SchemaInfo> {
  schemaCache ??= (async () => {
    const c = db();
    const cols = await c.query(
      `select table_name, column_name, data_type, udt_name from information_schema.columns
       where table_schema='public' order by table_name, ordinal_position`
    );
    const tables = new Map<string, Map<string, ColumnInfo>>();
    for (const r of cols.rows) {
      if (!tables.has(r.table_name)) tables.set(r.table_name, new Map());
      tables.get(r.table_name)!.set(r.column_name, { type: r.data_type, udt: r.udt_name });
    }
    const pks = await c.query(
      `select tc.table_name, kcu.column_name from information_schema.table_constraints tc
       join information_schema.key_column_usage kcu on kcu.constraint_name=tc.constraint_name and kcu.table_schema=tc.table_schema
       where tc.table_schema='public' and tc.constraint_type='PRIMARY KEY' order by kcu.ordinal_position`
    );
    const pk = new Map<string, string[]>();
    for (const r of pks.rows) pk.set(r.table_name, [...(pk.get(r.table_name) ?? []), r.column_name]);
    const fk = await c.query(
      `select cl.relname t, a.attname c, rcl.relname rt, ra.attname rc
       from pg_constraint k
       join pg_class cl on cl.oid=k.conrelid join pg_namespace n on n.oid=cl.relnamespace
       join pg_class rcl on rcl.oid=k.confrelid
       join pg_attribute a on a.attrelid=k.conrelid and a.attnum=k.conkey[1]
       join pg_attribute ra on ra.attrelid=k.confrelid and ra.attnum=k.confkey[1]
       where k.contype='f' and n.nspname='public' and array_length(k.conkey,1)=1`
    );
    const fks = fk.rows.map((r) => ({ table: r.t, column: r.c, refTable: r.rt, refColumn: r.rc }));
    return { tables, pk, fks };
  })().catch((e) => {
    schemaCache = undefined;
    throw e;
  });
  return schemaCache;
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  });
}
