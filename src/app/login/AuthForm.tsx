'use client';
import { useActionState } from 'react';
import { loginAction, signupAction } from '@/app/actions';
import { Icon } from '@/components/Icons';
import { LotusLoader } from '@/components/LotusLoader';
import type { ActionResult } from '@/lib/contracts';

/** Author sign-in / sign-up card. Same look as the reviewer sign-in (signin.css). */
export default function AuthForm({ mode, next, notice }: { mode: 'login' | 'signup'; next: string; notice: string | null }) {
  const signup = mode === 'signup';
  const [loginState, loginActionHandler, loginPending] = useActionState<ActionResult | null, FormData>(loginAction, null);
  const [signupState, signupActionHandler, signupPending] = useActionState<ActionResult | null, FormData>(signupAction, null);

  const s = signup ? signupState : loginState;
  const action = signup ? signupActionHandler : loginActionHandler;
  const pending = signup ? signupPending : loginPending;
  const other = `/login${signup ? '' : '?mode=signup'}${next ? `${signup ? '?' : '&'}next=${encodeURIComponent(next)}` : ''}`;
  return (
    <div className="studio si-grid">
      <form action={action} className="rs-card si-card">
        <div className="rs-card-head">
          <span className="si-ico"><Icon name="users" size={28} /></span>
          <div>
            <h2>{signup ? 'Create your author account' : 'Sign in to submit'}</h2>
            <p>{signup ? 'New accounts can submit records for review.' : 'Use your author account.'}</p>
          </div>
        </div>

        {(notice || s?.error) && <p className="errsum" role="alert">{s?.error ?? notice}</p>}

        <input type="hidden" name="next" value={next} />

        {signup && (
          <div key="signup-name-group">
            <label className="rs-label" htmlFor="name">Name</label>
            <input className="si-input" id="name" name="name" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={80} />
          </div>
        )}

        <label className="rs-label" htmlFor="email">Email</label>
        <input className="si-input" id="email" type="email" name="email" autoComplete="username" placeholder="Enter your email" required />

        <label className="rs-label" htmlFor="password">Password</label>
        <input className="si-input" id="password" type="password" name="password" autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'At least 10 characters' : 'Enter your password'} required minLength={signup ? 10 : undefined} />

        <div className="rs-actions">
          <button type="submit" className="btn" disabled={pending}>
            {pending ? <LotusLoader size="xs" inline /> : null}
            {pending ? 'Please wait…' : <>{signup ? 'Create account' : 'Sign in'} <Icon name="arrow" size={18} /></>}
          </button>
        </div>
        <p className="muted" style={{ marginTop: 18 }}>
          {signup ? 'Already registered? ' : 'New here? '}<a href={other}>{signup ? 'Sign in' : 'Create an author account'}</a>
        </p>
      </form>

      <section className="si-info" aria-label="About author accounts">
        <h2>Authors</h2>
        <p className="si-info-lede">Registered authors contribute cultural works. Every draft is checked by reviewers before it is published.</p>
        <ul>
          <li><span className="si-ico"><Icon name="file" size={26} /></span><div><h3>Submit drafts</h3><p>Add a work, its media and trusted references.</p></div></li>
          <li><span className="si-ico"><Icon name="shield" size={26} /></span><div><h3>Reviewed before publishing</h3><p>Nothing goes public without a reviewer’s check.</p></div></li>
        </ul>
      </section>
    </div>
  );
}
