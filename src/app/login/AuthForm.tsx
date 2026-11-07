'use client';
import { useActionState } from 'react';
import { loginAction, signupAction } from '@/app/actions';
import { Icon } from '@/components/Icons';
import { LotusLoader } from '@/components/LotusLoader';
import type { ActionResult } from '@/lib/contracts';

const REGIONS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki',
  'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
  'North Malabar', 'Kuttanad'
];

const CATEGORIES: [string, string][] = [
  ['ritual', 'Ritual art'],
  ['performing', 'Performing art'],
  ['craft', 'Craft'],
  ['textile', 'Textile'],
  ['visual', 'Visual art'],
  ['other', 'Folk art / other']
];

/** Author sign-in / sign-up card with tabs and tag selection for author registration. */
export default function AuthForm({ mode, next, notice }: { mode: 'login' | 'signup'; next: string; notice: string | null }) {
  const signup = mode === 'signup';
  const [loginState, loginActionHandler, loginPending] = useActionState<ActionResult | null, FormData>(loginAction, null);
  const [signupState, signupActionHandler, signupPending] = useActionState<ActionResult | null, FormData>(signupAction, null);

  const s = signup ? signupState : loginState;
  const action = signup ? signupActionHandler : loginActionHandler;
  const pending = signup ? signupPending : loginPending;

  const loginUrl = `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`;
  const signupUrl = `/login?mode=signup${next ? `&next=${encodeURIComponent(next)}` : ''}`;

  return (
    <div className="studio si-grid">
      <div className="rs-card si-card">
        {/* Prominent Tab Switcher between Sign-In and Sign-Up */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--line, rgba(0,0,0,0.1))', paddingBottom: 12 }}>
          <a
            href={loginUrl}
            className={`btn ${!signup ? '' : 'secondary'}`}
            style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
          >
            Sign In
          </a>
          <a
            href={signupUrl}
            className={`btn ${signup ? '' : 'secondary'}`}
            style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
          >
            Sign Up as Author
          </a>
        </div>

        <form action={action} className="ui">
          <div className="rs-card-head">
            <span className="si-ico"><Icon name={signup ? 'shield' : 'users'} size={28} /></span>
            <div>
              <h2>{signup ? 'Create Author Account' : 'Sign In as Author'}</h2>
              <p>{signup ? 'New author accounts can submit records for steward review.' : 'Access your author dashboard and submit drafts.'}</p>
            </div>
          </div>

          {(notice || s?.error) && (
            <p className="errsum" role="alert" style={{ marginBottom: 16 }}>
              {s?.error ?? notice}
            </p>
          )}

          <input type="hidden" name="next" value={next} />

          {signup && (
            <div key="signup-name-group" style={{ marginBottom: 12 }}>
              <label className="rs-label" htmlFor="name">Full Name</label>
              <input className="si-input" id="name" name="name" autoComplete="name" placeholder="Your full name" required minLength={2} maxLength={80} />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label className="rs-label" htmlFor="email">Email Address</label>
            <input className="si-input" id="email" type="email" name="email" autoComplete="username" placeholder="name@example.com" required />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="rs-label" htmlFor="password">Password</label>
            <input
              className="si-input"
              id="password"
              type="password"
              name="password"
              autoComplete={signup ? 'new-password' : 'current-password'}
              placeholder={signup ? 'At least 8 characters' : 'Enter your password'}
              required
              minLength={8}
            />
          </div>

          {signup && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="rs-label" htmlFor="region">Primary Region</label>
                <select id="region" name="region" className="si-input" defaultValue="">
                  <option value="">Select region</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="rs-label" htmlFor="category">Primary Category</label>
                <select id="category" name="category" className="si-input" defaultValue="">
                  <option value="">Select category</option>
                  {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="rs-actions" style={{ marginTop: 20 }}>
            <button type="submit" className="btn" disabled={pending}>
              {pending ? <LotusLoader size="xs" inline /> : null}
              {pending ? 'Please wait…' : <>{signup ? 'Create Author Account' : 'Sign In'} <Icon name="arrow" size={18} /></>}
            </button>
          </div>

          <p className="muted" style={{ marginTop: 18 }}>
            {signup ? 'Already have an author account? ' : 'Need an author account to submit? '}
            <a href={signup ? loginUrl : signupUrl}>
              {signup ? 'Sign In' : 'Sign Up as Author'}
            </a>
          </p>
        </form>
      </div>

      <section className="si-info" aria-label="About author accounts">
        <h2>Author Registry</h2>
        <p className="si-info-lede">Registered authors contribute Kerala’s living cultural heritage. Every draft is verified by regional stewards before publication.</p>
        <ul>
          <li>
            <span className="si-ico"><Icon name="file" size={26} /></span>
            <div>
              <h3>Submit Cultural Works</h3>
              <p>Add cultural works, imagery, community credits, and documented references.</p>
            </div>
          </li>
          <li>
            <span className="si-ico"><Icon name="shield" size={26} /></span>
            <div>
              <h3>Steward Review & Feedback</h3>
              <p>Regional stewards review your submissions and provide feedback directly on your author dashboard.</p>
            </div>
          </li>
          <li>
            <span className="si-ico"><Icon name="users" size={26} /></span>
            <div>
              <h3>Apply as Steward</h3>
              <p>Authors can apply for KYC verification to become community stewards for their region.</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
