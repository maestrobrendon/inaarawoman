// POST /api/discount  { code }  -> { code, percent, affiliate } | 404
// Public: checks a creator/affiliate code without exposing the code list.
import { db, json } from './_lib/db.js';

export async function POST(req: Request): Promise<Response> {
  let code = '';
  try {
    ({ code } = await req.json());
  } catch { /* handled below */ }
  code = typeof code === 'string' ? code.trim().toUpperCase() : '';
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) return json({ error: 'Invalid code' }, 400);

  try {
    const { rows } = await db().query(
      `select code, type, value, affiliate_name
         from discount_codes
        where code = $1
          and is_active is true
          and (start_date is null or start_date <= now())
          and (end_date is null or end_date > now())
          and (maximum_uses is null or coalesce(uses_count, 0) < maximum_uses)`,
      [code]
    );
    const d = rows[0];
    if (!d || d.type !== 'percentage' || !(d.value > 0 && d.value <= 100)) {
      return json({ error: 'This code is not valid or has expired' }, 404);
    }
    return json({ code: d.code, percent: Number(d.value), affiliate: d.affiliate_name ?? null });
  } catch (e) {
    console.error('discount check failed', (e as Error).message);
    return json({ error: 'Could not check the code right now' }, 500);
  }
}
