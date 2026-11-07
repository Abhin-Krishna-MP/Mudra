/** Edge-safe (no Node imports) so both session.ts and middleware.ts read the same secret the same way. */
export const SESSION_COOKIE = 'mudra_session';
export function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && (!s || s.startsWith('dev-only'))) throw new Error('SESSION_SECRET must be set in production');
  return s || 'dev-only-change-me-dev-only-change-me';
}
