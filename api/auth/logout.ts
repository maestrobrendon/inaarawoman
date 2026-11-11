// POST /api/auth/logout -> clears the admin session cookie.
import { clearCookie } from '../_lib/auth.js';
import { json } from '../_lib/db.js';

export async function POST(): Promise<Response> {
  return json({ error: null }, 200, { 'set-cookie': clearCookie() });
}
