import { getDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canSubmit } from '@/lib/auth';

export const UNAUTHORIZED_URL = '/login?msg=Unauthorized';

/**
 * Server-side check for the submission route: is the request from a signed-in user whose role is `author`?
 * The signed cookie proves who they are; the role is re-read from the database so a demoted or banned
 * author loses access immediately instead of when their session expires.
 */
export async function getSubmitter(): Promise<{ id: number; name: string } | null> {
  const s = await getSession();
  if (!s) return null;
  const u = (await (await getDb()).execute('SELECT id, name, role FROM users WHERE id = ?', [s.uid])).rows[0];
  return u && canSubmit(String(u.role)) ? { id: Number(u.id), name: String(u.name) } : null;
}
