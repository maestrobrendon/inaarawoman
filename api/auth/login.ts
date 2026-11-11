// POST /api/auth/login  { email, password }  -> sets the admin session cookie.
import bcrypt from 'bcryptjs';
import { sessionCookie } from '../_lib/auth.js';
import { db, json } from '../_lib/db.js';

export async function POST(req: Request): Promise<Response> {
  let email = '', password = '';
  try {
    ({ email, password } = await req.json());
  } catch { /* fall through */ }
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return json({ error: { message: 'Email and password are required' } }, 400);
  }

  const { rows } = await db().query(
    `select id, email, full_name, role, password_hash from admin_users where lower(email)=lower($1) and is_active is true`,
    [email.trim()]
  );
  const user = rows[0];
  const ok = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
  if (!ok) {
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing
    return json({ error: { message: 'Invalid login credentials' } }, 401);
  }

  await db().query(`update admin_users set last_login=now() where id=$1`, [user.id]);
  const { password_hash: _omit, ...publicUser } = user;
  return json({ user: publicUser, error: null }, 200, { 'set-cookie': sessionCookie(user) });
}
