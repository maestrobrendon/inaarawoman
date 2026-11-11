// Turns a query description from the browser (see src/lib/supabase.ts) into
// parameterised SQL. Every table/column name is checked against the live
// schema and values are always bound as parameters, so nothing from the
// client is ever spliced into SQL text.
import { db, schema, type SchemaInfo } from './db.js';

export type Filter = { column: string; op: string; value: unknown } | { or: string };
export type QueryRequest = {
  table: string;
  action: 'select' | 'insert' | 'update' | 'upsert' | 'delete';
  columns?: string; // select string, e.g. "*, images:product_images(*)"
  returning?: string | null; // select string for insert/update/upsert/delete, null = no rows back
  filters?: Filter[];
  order?: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
  limit?: number;
  offset?: number;
  single?: 'single' | 'maybeSingle' | null;
  count?: 'exact' | null;
  head?: boolean;
  values?: Record<string, unknown> | Record<string, unknown>[];
  onConflict?: string;
};

export class QueryError extends Error {
  constructor(message: string, public code = 'PGRST100', public status = 400, public details: string | null = null) {
    super(message);
  }
}

// Columns that never leave the server.
const HIDDEN: Record<string, string[]> = { admin_users: ['password_hash'] };

const q = (id: string) => `"${id.replace(/"/g, '""')}"`;

type Ctx = { s: SchemaInfo; params: unknown[] };
const param = (ctx: Ctx, v: unknown) => {
  ctx.params.push(v);
  return `$${ctx.params.length}`;
};

function cols(s: SchemaInfo, table: string) {
  const t = s.tables.get(table);
  if (!t) throw new QueryError(`Unknown table "${table}"`, '42P01', 404);
  return t;
}

function column(s: SchemaInfo, table: string, name: string) {
  const c = cols(s, table).get(name);
  if (!c || HIDDEN[table]?.includes(name)) throw new QueryError(`Unknown column "${name}" on "${table}"`, '42703');
  return c;
}

/** Split on commas that are not inside parentheses. */
function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

export type SelectItem = { kind: 'star' } | { kind: 'col'; name: string; alias: string } | { kind: 'embed'; table: string; alias: string; inner: SelectItem[] };

export function parseSelect(sel: string | undefined): SelectItem[] {
  const items: SelectItem[] = [];
  for (const raw of splitTop((sel ?? '*').replace(/\s+/g, ' '))) {
    if (raw === '*') { items.push({ kind: 'star' }); continue; }
    const m = raw.match(/^(?:([a-zA-Z_][\w]*)\s*:\s*)?([a-zA-Z_][\w]*)(?:![\w]+)?\s*(?:\((.*)\))?$/s);
    if (!m) throw new QueryError(`Cannot parse select "${raw}"`);
    const [, alias, name, inner] = m;
    if (inner !== undefined) items.push({ kind: 'embed', table: name, alias: alias ?? name, inner: parseSelect(inner) });
    else items.push({ kind: 'col', name, alias: alias ?? name });
  }
  return items;
}

/** SQL select-list for `table` aliased as `t` (embeds become json sub-selects). */
function selectList(ctx: Ctx, table: string, items: SelectItem[], t: string, depth = 0): string {
  const s = ctx.s;
  const parts: string[] = [];
  for (const it of items) {
    if (it.kind === 'star') {
      for (const name of cols(s, table).keys()) if (!HIDDEN[table]?.includes(name)) parts.push(`${t}.${q(name)}`);
    } else if (it.kind === 'col') {
      column(s, table, it.name);
      parts.push(`${t}.${q(it.name)}${it.alias !== it.name ? ' as ' + q(it.alias) : ''}`);
    } else {
      if (depth > 1) throw new QueryError('Embedding is limited to two levels');
      cols(s, it.table);
      const e = `e${depth}`;
      const inner = selectList(ctx, it.table, it.inner, e, depth + 1);
      const toMany = s.fks.find((f) => f.table === it.table && f.refTable === table);
      const toOne = s.fks.find((f) => f.table === table && f.refTable === it.table);
      if (toMany) {
        parts.push(`coalesce((select json_agg(x) from (select ${inner} from ${q(it.table)} ${e} where ${e}.${q(toMany.column)} = ${t}.${q(toMany.refColumn)}) x), '[]'::json) as ${q(it.alias)}`);
      } else if (toOne) {
        parts.push(`(select row_to_json(x) from (select ${inner} from ${q(it.table)} ${e} where ${e}.${q(toOne.refColumn)} = ${t}.${q(toOne.column)}) x) as ${q(it.alias)}`);
      } else throw new QueryError(`No relationship between "${table}" and "${it.table}"`, 'PGRST200');
    }
  }
  return parts.join(', ') || `${t}.*`;
}

const OPS: Record<string, string> = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', like: 'like', ilike: 'ilike' };

function condition(ctx: Ctx, table: string, f: Filter): string {
  if ('or' in f) {
    const parts = splitTop(f.or).map((p) => {
      const m = p.match(/^([a-zA-Z_]\w*)\.(\w+)\.(.*)$/s);
      if (!m) throw new QueryError(`Cannot parse or-filter "${p}"`);
      const [, col, op, val] = m;
      // A value naming another column of the same table compares the two columns.
      if (OPS[op] && cols(ctx.s, table).has(val) && !HIDDEN[table]?.includes(val)) {
        column(ctx.s, table, col);
        return `t.${q(col)} ${OPS[op]} t.${q(val)}`;
      }
      const v = op === 'is' ? (val === 'null' ? null : val === 'true') : val;
      return condition(ctx, table, { column: col, op, value: v });
    });
    return `(${parts.join(' or ')})`;
  }
  const c = column(ctx.s, table, f.column);
  const col = `t.${q(f.column)}`;
  if (OPS[f.op]) return `${col} ${OPS[f.op]} ${param(ctx, encode(c.type, f.value))}`;
  if (f.op === 'in') {
    if (!Array.isArray(f.value)) throw new QueryError('in() needs an array');
    return `${col} = any(${param(ctx, f.value)})`;
  }
  if (f.op === 'is') {
    if (f.value === null) return `${col} is null`;
    if (f.value === true) return `${col} is true`;
    if (f.value === false) return `${col} is false`;
    throw new QueryError('is() accepts null, true or false');
  }
  if (f.op === 'not_is_null') return `${col} is not null`;
  if (f.op === 'contains') {
    if (c.type === 'jsonb' || c.type === 'json') return `${col}::jsonb @> ${param(ctx, JSON.stringify(f.value))}::jsonb`;
    return `${col} @> ${param(ctx, f.value)}`;
  }
  throw new QueryError(`Unsupported filter "${f.op}"`);
}

function where(ctx: Ctx, table: string, filters: Filter[] = []) {
  return filters.length ? ' where ' + filters.map((f) => condition(ctx, table, f)).join(' and ') : '';
}

/** Objects/arrays headed for json columns are sent as JSON text. */
function encode(type: string, v: unknown) {
  if (v === undefined) return null;
  if ((type === 'json' || type === 'jsonb') && v !== null) return JSON.stringify(v);
  return v;
}

const asNumber = (n: unknown, name: string) => {
  if (n === undefined || n === null) return undefined;
  if (!Number.isInteger(n) || (n as number) < 0) throw new QueryError(`${name} must be a non-negative integer`);
  return n as number;
};

export async function run(r: QueryRequest): Promise<{ data: unknown; count: number | null }> {
  const s = await schema();
  const ctx: Ctx = { s, params: [] };
  const table = r.table;
  const tcols = cols(s, table);
  let sql: string;
  const returning = r.action === 'select' ? r.columns ?? '*' : r.returning;
  const retList = returning != null ? selectList(ctx, table, parseSelect(returning), 't') : null;

  if (r.action === 'select') {
    const order = (r.order ?? []).map((o) => {
      column(s, table, o.column);
      const nulls = o.nullsFirst === undefined ? '' : o.nullsFirst ? ' nulls first' : ' nulls last';
      return `t.${q(o.column)} ${o.ascending === false ? 'desc' : 'asc'}${nulls}`;
    });
    const w = where(ctx, table, r.filters);
    const limit = asNumber(r.limit, 'limit');
    const offset = asNumber(r.offset, 'offset');
    sql = `select ${retList} from ${q(table)} t${w}${order.length ? ' order by ' + order.join(', ') : ''}${limit !== undefined ? ' limit ' + limit : ''}${offset ? ' offset ' + offset : ''}`;
    let count: number | null = null;
    if (r.count === 'exact') {
      const cctx: Ctx = { s, params: [] };
      const cw = where(cctx, table, r.filters);
      count = (await db().query(`select count(*)::int n from ${q(table)} t${cw}`, cctx.params)).rows[0].n;
      if (r.head) return { data: null, count };
    }
    return { data: (await db().query(sql, ctx.params)).rows, count };
  }

  if (r.action === 'insert' || r.action === 'upsert') {
    const rows = Array.isArray(r.values) ? r.values : r.values ? [r.values] : [];
    if (!rows.length) throw new QueryError('Nothing to insert');
    const keys = [...new Set(rows.flatMap((x) => Object.keys(x)))];
    keys.forEach((k) => column(s, table, k));
    // Placeholders are built after the returning list so parameter numbers line up.
    const vals = rows.map((row) => `(${keys.map((k) => (k in row ? param(ctx, encode(tcols.get(k)!.type, row[k])) : 'default')).join(', ')})`);
    sql = `insert into ${q(table)} as t (${keys.map(q).join(', ')}) values ${vals.join(', ')}`;
    if (r.action === 'upsert') {
      const conflict = (r.onConflict ?? (s.pk.get(table) ?? []).join(',')).split(',').map((x) => x.trim()).filter(Boolean);
      if (!conflict.length) throw new QueryError('upsert needs onConflict');
      conflict.forEach((k) => column(s, table, k));
      const upd = keys.filter((k) => !conflict.includes(k));
      sql += ` on conflict (${conflict.map(q).join(', ')}) ` + (upd.length ? `do update set ${upd.map((k) => `${q(k)} = excluded.${q(k)}`).join(', ')}` : 'do nothing');
    }
  } else if (r.action === 'update') {
    const vals = r.values && !Array.isArray(r.values) ? r.values : null;
    if (!vals || !Object.keys(vals).length) throw new QueryError('Nothing to update');
    if (!r.filters?.length) throw new QueryError('update() requires a filter', 'PGRST106');
    const set = Object.entries(vals).map(([k, v]) => `${q(k)} = ${param(ctx, encode(column(s, table, k).type, v))}`);
    sql = `update ${q(table)} as t set ${set.join(', ')}${where(ctx, table, r.filters)}`;
  } else if (r.action === 'delete') {
    if (!r.filters?.length) throw new QueryError('delete() requires a filter', 'PGRST106');
    sql = `delete from ${q(table)} as t${where(ctx, table, r.filters)}`;
  } else throw new QueryError(`Unknown action "${r.action}"`);

  if (retList) sql += ` returning ${retList}`;
  const res = await db().query(sql, ctx.params);
  return { data: retList ? res.rows : null, count: r.count === 'exact' ? res.rowCount : null };
}
