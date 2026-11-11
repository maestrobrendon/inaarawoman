// GET /api/auth/session -> { user } for the signed-in admin, or { user: null }.
import { currentAdmin } from '../_lib/auth.js';
import { json } from '../_lib/db.js';

export async function GET(req: Request): Promise<Response> {
  try {
    return json({ user: await currentAdmin(req) });
  } catch (e) {
    console.error('session error', (e as Error).message);
    return json({ user: null });
  }
}
