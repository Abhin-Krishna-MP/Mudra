'use client';
import { useActionState } from 'react';
import { loginAction } from '@/app/actions';
import { Field } from '@/components/Field';
import type { ActionResult } from '@/lib/contracts';
export default function LoginForm() {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(loginAction, null);
  return (
    <form action={action} className="panel ui" style={{ maxWidth: 420 }}>
      {s?.error && <p className="err" role="alert">{s.error}</p>}
      <Field name="email" label="Email">{(p) => <input type="email" name="email" autoComplete="username" required {...p} />}</Field>
      <Field name="password" label="Password">{(p) => <input type="password" name="password" autoComplete="current-password" required {...p} />}</Field>
      <p><button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button></p>
    </form>
  );
}
