// POST /api/db — runs one query from the browser data client (src/lib/supabase.ts)
// against Neon, after applying the access rules in _lib/policy.ts.
import { currentAdmin } from './_lib/auth.js';
import { json } from './_lib/db.js';
import { authorizePublic } from './_lib/policy.js';
import { QueryError, run, type QueryRequest } from './_lib/query.js';

export async function POST(req: Request): Promise<Response> {
  let body: QueryRequest;
  try {
    body = await req.json();
  } catch {
    return json({ data: null, error: { message: 'Invalid JSON', code: 'PGRST100' } }, 400);
  }
  try {
    if (!body || typeof body.table !== 'string' || typeof body.action !== 'string') throw new QueryError('Invalid query');
    const admin = await currentAdmin(req);
    const request = admin ? body : authorizePublic(body);
    const { data, count } = await run(request);

    if (request.single) {
      const rows = (data as unknown[] | null) ?? [];
      if (rows.length > 1 || (rows.length === 0 && request.single === 'single')) {
        return json({
          data: null,
          count,
          error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116', details: `The result contains ${rows.length} rows` },
        }, 406);
      }
      return json({ data: rows[0] ?? null, count, error: null });
    }
    return json({ data, count, error: null });
  } catch (e) {
    const err = e as QueryError & { code?: string; detail?: string; hint?: string };
    const status = e instanceof QueryError ? err.status : 400;
    if (!(e instanceof QueryError)) console.error('db error', body?.table, body?.action, err.code, err.message);
    return json({ data: null, error: { message: err.message, code: err.code ?? 'XX000', details: err.detail ?? err.details ?? null, hint: err.hint ?? null } }, status);
  }
}
