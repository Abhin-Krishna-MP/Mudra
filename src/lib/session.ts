import { cookies } from 'next/headers';
import { readSession, signSession } from './auth';
import type { Actor } from './contracts';

import { SESSION_COOKIE as COOKIE, sessionSecret as secret } from './session-secret';
export async function getSession() {
  const jar = await cookies();
  return readSession(jar.get(COOKIE)?.value, secret());
}
export async function getActor(): Promise<Actor | null> {
  const jar = await cookies();
  const s = readSession(jar.get(COOKIE)?.value, secret());
  return s ? { id: s.uid, role: s.role, name: s.name } : null;
}
export async function getSessionUser(): Promise<{ id: number; name: string; role: string } | null> {
  const jar = await cookies();
  const s = readSession(jar.get(COOKIE)?.value, secret());
  return s ? { id: s.uid, name: s.name, role: s.role } : null;
}
export async function startSession(u: { id: number; name: string; role: string }) {
  const jar = await cookies();
  jar.set(COOKIE, signSession({ uid: u.id, name: u.name, role: u.role, exp: Date.now() + 8 * 3600_000 }, secret()), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 8 * 3600,
  });
}
export async function endSession() { (await cookies()).delete(COOKIE); }
