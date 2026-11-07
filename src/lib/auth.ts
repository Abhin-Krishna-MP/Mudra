import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import type { Actor } from './contracts';

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) { super(message); }
}

/** Server-side guard. Every reviewer action calls this first. */
export function requireRole(actor: (Actor & { role: string }) | null | undefined, roles: string[]): Actor {
  if (!actor) throw new AuthError(401, 'Sign in required.');
  if (!roles.includes(actor.role)) throw new AuthError(403, 'Not allowed.');
  return actor;
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const h = scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString('hex')}$${h.toString('hex')}`;
}
export function checkPassword(pw: string, stored: string): boolean {
  const [alg, saltHex, hashHex] = stored.split('$');
  if (alg !== 'scrypt' || !saltHex || !hashHex) return false;
  const h = scryptSync(pw, Buffer.from(saltHex, 'hex'), 64);
  const want = Buffer.from(hashHex, 'hex');
  return h.length === want.length && timingSafeEqual(h, want);
}

export interface SessionData { uid: number; name: string; role: string; exp: number }
export function signSession(data: SessionData, secret: string): string {
  const body = Buffer.from(JSON.stringify(data)).toString('base64url');
  const mac = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${mac}`;
}
export function readSession(token: string | undefined, secret: string, now = Date.now()): SessionData | null {
  if (!token) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const want = createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionData;
    return d.exp > now ? d : null;
  } catch { return null; }
}

export { SUBMIT_ROLES, canSubmit } from './authorRoles';

/** Only same-site relative paths may be used as a post-login destination (blocks open redirects like //evil.com). */
export function safeNext(raw: unknown, fallback: string): string {
  const v = typeof raw === 'string' ? raw : '';
  return v.startsWith('/') && !v.startsWith('//') && !v.includes('\\') && !/[\r\n]/.test(v) ? v : fallback;
}
