// Admin sessions: a signed, HttpOnly cookie (HMAC-SHA256 with AUTH_SECRET).
// Replaces Supabase Auth. Admin passwords are the same bcrypt hashes that
// Supabase Auth stored, now kept in admin_users.password_hash.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from './db.js';

const COOKIE = 'iw_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AdminUser = { id: string; email: string; full_name: string | null; role: string | null };

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET is not configured');
  return s;
}

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export function sessionCookie(user: { id: string; email: string }): string {
  const payload = b64(JSON.stringify({ sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  return `${COOKIE}=${payload}.${sign(payload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

function readCookie(req: Request): { sub: string; email: string } | null {
  const raw = req.headers.get('cookie')?.split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}

/** The signed-in, still-active admin for this request, or null. */
export async function currentAdmin(req: Request): Promise<AdminUser | null> {
  const s = readCookie(req);
  if (!s) return null;
  const { rows } = await db().query(
    `select id, email, full_name, role from admin_users where id=$1 and is_active is true`,
    [s.sub]
  );
  return rows[0] ?? null;
}
