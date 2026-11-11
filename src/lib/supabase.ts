// Data client for the Neon database.
//
// The site used to talk to Supabase straight from the browser. It now talks to
// our own Vercel functions (/api/*), which query Neon and enforce access rules.
// This module keeps the same `supabase.from(...).select().eq()...` shape so the
// rest of the app did not need rewriting:
//   supabase.from(table)  -> POST /api/db
//   supabase.auth.*       -> /api/auth/*   (admin login, HttpOnly cookie)
//   supabase.functions    -> POST /api/<name>
//   supabase.channel()    -> polling (replaces Supabase realtime)

/* eslint-disable @typescript-eslint/no-explicit-any */

export type DbError = { message: string; code?: string; details?: string | null; hint?: string | null };
export type Row = any;
export type DbResult<T = Row[]> = { data: T; error: DbError | null; count: number | null; status: number };
export type User = { id: string; email: string; full_name?: string | null; role?: string | null };
export type Session = { user: User };

type Filter = { column: string; op: string; value: unknown } | { or: string };
type Action = 'select' | 'insert' | 'update' | 'upsert' | 'delete';

async function post(url: string, body: unknown): Promise<{ status: number; json: any }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  } catch (e) {
    return { status: 0, json: { error: { message: (e as Error).message, code: 'FETCH_ERROR' } } };
  }
}

class QueryBuilder<T = Row[]> implements PromiseLike<DbResult<T>> {
  private q: {
    table: string;
    action: Action;
    columns?: string;
    returning?: string | null;
    filters: Filter[];
    order: { column: string; ascending?: boolean; nullsFirst?: boolean }[];
    limit?: number;
    offset?: number;
    single?: 'single' | 'maybeSingle' | null;
    count?: 'exact' | null;
    head?: boolean;
    values?: any;
    onConflict?: string;
  };

  constructor(table: string) {
    this.q = { table, action: 'select', filters: [], order: [], returning: null };
  }

  // ---- actions ----
  select(columns = '*', opts: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean } = {}) {
    if (this.q.action === 'select') this.q.columns = columns.trim();
    else this.q.returning = columns.trim(); // insert(...).select() -> return the rows
    if (opts.count) this.q.count = 'exact';
    if (opts.head) this.q.head = true;
    return this;
  }
  insert(values: any, opts: { count?: 'exact' } = {}) {
    Object.assign(this.q, { action: 'insert', values, count: opts.count ?? null });
    return this;
  }
  upsert(values: any, opts: { onConflict?: string; count?: 'exact' } = {}) {
    Object.assign(this.q, { action: 'upsert', values, onConflict: opts.onConflict, count: opts.count ?? null });
    return this;
  }
  update(values: any, opts: { count?: 'exact' } = {}) {
    Object.assign(this.q, { action: 'update', values, count: opts.count ?? null });
    return this;
  }
  delete(opts: { count?: 'exact' } = {}) {
    Object.assign(this.q, { action: 'delete', count: opts.count ?? null });
    return this;
  }

  // ---- filters ----
  private f(column: string, op: string, value: unknown) {
    this.q.filters.push({ column, op, value });
    return this;
  }
  eq(c: string, v: unknown) { return this.f(c, 'eq', v); }
  neq(c: string, v: unknown) { return this.f(c, 'neq', v); }
  gt(c: string, v: unknown) { return this.f(c, 'gt', v); }
  gte(c: string, v: unknown) { return this.f(c, 'gte', v); }
  lt(c: string, v: unknown) { return this.f(c, 'lt', v); }
  lte(c: string, v: unknown) { return this.f(c, 'lte', v); }
  like(c: string, v: string) { return this.f(c, 'like', v); }
  ilike(c: string, v: string) { return this.f(c, 'ilike', v); }
  in(c: string, v: readonly unknown[]) { return this.f(c, 'in', [...v]); }
  is(c: string, v: null | boolean) { return this.f(c, 'is', v); }
  contains(c: string, v: unknown) { return this.f(c, 'contains', v); }
  not(c: string, op: string, v: unknown) {
    if (op === 'is' && v === null) return this.f(c, 'not_is_null', null);
    throw new Error(`not(${op}) is not supported`);
  }
  match(obj: Record<string, unknown>) {
    Object.entries(obj).forEach(([c, v]) => this.f(c, 'eq', v));
    return this;
  }
  filter(c: string, op: string, v: unknown) { return this.f(c, op, v); }
  or(expr: string) {
    this.q.filters.push({ or: expr });
    return this;
  }

  // ---- modifiers ----
  order(column: string, opts: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    this.q.order.push({ column, ...opts });
    return this;
  }
  limit(n: number) { this.q.limit = n; return this; }
  range(from: number, to: number) { this.q.offset = from; this.q.limit = to - from + 1; return this; }
  single() { this.q.single = 'single'; return this as unknown as QueryBuilder<Row>; }
  maybeSingle() { this.q.single = 'maybeSingle'; return this as unknown as QueryBuilder<Row>; }

  async execute(): Promise<DbResult<T>> {
    const { status, json } = await post('/api/db', this.q);
    return { data: json.data ?? null, error: json.error ?? null, count: json.count ?? null, status };
  }

  then<R1 = DbResult<T>, R2 = never>(
    onfulfilled?: ((value: DbResult<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

// ---------------- auth (admin only) ----------------
type AuthListener = (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'INITIAL_SESSION', session: Session | null) => void;
const listeners = new Set<AuthListener>();
let current: Session | null = null;
let loaded: Promise<Session | null> | null = null;

function loadSession(force = false) {
  if (!loaded || force) {
    loaded = fetch('/api/auth/session', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((j) => (current = j.user ? { user: j.user } : null))
      .catch(() => (current = null));
  }
  return loaded;
}

const auth = {
  async getSession() {
    return { data: { session: await loadSession() }, error: null };
  },
  async getUser() {
    const s = await loadSession();
    return { data: { user: s?.user ?? null }, error: null };
  },
  onAuthStateChange(cb: AuthListener) {
    listeners.add(cb);
    return { data: { subscription: { unsubscribe: () => { listeners.delete(cb); } } } };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const { status, json } = await post('/api/auth/login', { email, password });
    if (status !== 200) return { data: { user: null, session: null }, error: json.error ?? { message: 'Login failed' } };
    current = { user: json.user };
    loaded = Promise.resolve(current);
    listeners.forEach((l) => l('SIGNED_IN', current));
    return { data: { user: json.user, session: current }, error: null };
  },
  async signOut() {
    await post('/api/auth/logout', {});
    current = null;
    loaded = Promise.resolve(null);
    listeners.forEach((l) => l('SIGNED_OUT', null));
    return { error: null };
  },
};

// ---------------- functions ----------------
const functions = {
  async invoke(name: string, opts: { body?: unknown } = {}) {
    const { status, json } = await post(`/api/${encodeURIComponent(name)}`, opts.body ?? {});
    if (status >= 200 && status < 300) return { data: json, error: null };
    return { data: null, error: { message: json.error?.message ?? json.error ?? `HTTP ${status}` } };
  },
};

// ---------------- "realtime" via polling ----------------
type ChangeHandler = (payload: { eventType: 'INSERT' | 'UPDATE'; new: any; old: Record<string, never>; table: string }) => void;

class PollingChannel {
  private handlers: { table: string; cb: ChangeHandler }[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private since = new Date().toISOString();

  constructor(private intervalMs = 15000) {}

  on(_type: 'postgres_changes', filter: { table: string; event?: string; schema?: string }, cb: ChangeHandler) {
    this.handlers.push({ table: filter.table, cb });
    return this;
  }

  subscribe() {
    this.timer ??= setInterval(() => void this.poll(), this.intervalMs);
    return this;
  }

  private async poll() {
    const now = new Date().toISOString();
    for (const table of new Set(this.handlers.map((h) => h.table))) {
      const { data, error } = await new QueryBuilder(table)
        .select('*')
        .or(`created_at.gt.${this.since},updated_at.gt.${this.since}`)
        .order('created_at', { ascending: true })
        .limit(50);
      if (error || !Array.isArray(data)) continue;
      for (const row of data) {
        const eventType = row.created_at > this.since ? 'INSERT' : 'UPDATE';
        this.handlers.filter((h) => h.table === table).forEach((h) => h.cb({ eventType, new: row, old: {}, table }));
      }
    }
    this.since = now;
  }

  unsubscribe() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    return Promise.resolve('ok');
  }
}

export const supabase = {
  from: <T = Row[]>(table: string) => new QueryBuilder<T>(table),
  auth,
  functions,
  channel: (_name: string) => new PollingChannel(),
  removeChannel: (ch: PollingChannel) => ch.unsubscribe(),
};

export const db = supabase;
