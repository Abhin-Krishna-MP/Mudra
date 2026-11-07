'use client';
import { useActionState, useState } from 'react';
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

export default function LoginClient({ error, redirect }: { error?: string; redirect?: string }) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loginState, loginDispatch, loginPending] = useActionState<ActionResult | null, FormData>(loginAction, null);
  const [signupState, signupDispatch, signupPending] = useActionState<ActionResult | null, FormData>(signupAction, null);
  const [showPassword, setShowPassword] = useState(false);

  const isUnauthorized = error === 'Unauthorized' || error === 'unauthorized';

  return (
    <div className="studio si-grid">
      <div className="rs-card si-card">
        {/* Step 1 Requirement: Display "Unauthorized" message prominently when redirected */}
        {isUnauthorized && (
          <div className="errsum" role="alert" style={{ marginBottom: 20 }}>
            <div className="errsum-head">
              <span className="errsum-ico" aria-hidden="true"><Icon name="info" size={24} /></span>
              <div>
                <strong>Unauthorized</strong>
                <p>You must be signed in with an author role to submit cultural works. Please sign in or register below.</p>
              </div>
            </div>
          </div>
        )}

        <div className="rs-tabs-head" style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--line)' }}>
          <button
            type="button"
            className={`btn ${tab === 'signin' ? '' : 'secondary'}`}
            style={{ flex: 1, padding: '10px 16px' }}
            onClick={() => setTab('signin')}
            aria-selected={tab === 'signin'}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn ${tab === 'signup' ? '' : 'secondary'}`}
            style={{ flex: 1, padding: '10px 16px' }}
            onClick={() => setTab('signup')}
            aria-selected={tab === 'signup'}
          >
            New Author Signup
          </button>
        </div>

        {tab === 'signin' ? (
          <form action={loginDispatch} className="ui">
            {redirect && <input type="hidden" name="redirect" value={redirect} />}
            <div className="rs-card-head">
              <span className="si-ico"><Icon name="users" size={28} /></span>
              <div>
                <h2>Sign In</h2>
                <p>Authors, Stewards, and Reviewers sign in here.</p>
              </div>
            </div>

            {loginState?.error && <p className="errsum" role="alert">{loginState.error}</p>}

            <label className="rs-label" htmlFor="login-email">Email</label>
            <input
              className="si-input"
              id="login-email"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="Enter your email"
              required
            />

            <label className="rs-label" htmlFor="login-password">Password</label>
            <div className="si-pass">
              <input
                className="si-input"
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="si-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name="search" size={16} />
              </button>
            </div>

            <div className="rs-actions" style={{ marginTop: 20 }}>
              <button type="submit" className="btn" disabled={loginPending}>
                {loginPending ? <LotusLoader size="xs" inline /> : null}
                {loginPending ? 'Signing in…' : <>Sign In <Icon name="arrow" size={18} /></>}
              </button>
            </div>
          </form>
        ) : (
          <form action={signupDispatch} className="ui">
            {redirect && <input type="hidden" name="redirect" value={redirect} />}
            <div className="rs-card-head">
              <span className="si-ico"><Icon name="shield" size={28} /></span>
              <div>
                <h2>Register as Author</h2>
                <p>Default role is author for all new contributors.</p>
              </div>
            </div>

            {signupState?.error && <p className="errsum" role="alert">{signupState.error}</p>}

            <label className="rs-label" htmlFor="reg-name">Full Name</label>
            <input
              className="si-input"
              id="reg-name"
              type="text"
              name="name"
              placeholder="Your full name"
              required
            />

            <label className="rs-label" htmlFor="reg-email">Email</label>
            <input
              className="si-input"
              id="reg-email"
              type="email"
              name="email"
              placeholder="name@example.com"
              required
            />

            <label className="rs-label" htmlFor="reg-password">Password (at least 8 characters)</label>
            <input
              className="si-input"
              id="reg-password"
              type="password"
              name="password"
              placeholder="Create a secure password"
              minLength={8}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label className="rs-label" htmlFor="reg-region">Primary Region</label>
                <select id="reg-region" name="region" className="si-input" required defaultValue="">
                  <option value="" disabled>Select region</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="rs-label" htmlFor="reg-category">Primary Category</label>
                <select id="reg-category" name="category" className="si-input" required defaultValue="">
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="rs-actions" style={{ marginTop: 20 }}>
              <button type="submit" className="btn" disabled={signupPending}>
                {signupPending ? <LotusLoader size="xs" inline /> : null}
                {signupPending ? 'Creating Account…' : <>Sign Up as Author <Icon name="arrow" size={18} /></>}
              </button>
            </div>
          </form>
        )}
      </div>

      <section className="si-info" aria-label="About Author Access">
        <h2>Cultural Bearers & Authors</h2>
        <p className="si-info-lede">Protecting cultural heritage through verified provenance and accountable stewardship.</p>
        <ul>
          <li>
            <Icon name="shield" size={24} />
            <div>
              <h3>Role-Based Access</h3>
              <p>Only verified registered authors can submit cultural drafts to prevent spam and misattribution.</p>
            </div>
          </li>
          <li>
            <Icon name="layers" size={24} />
            <div>
              <h3>Steward Matching</h3>
              <p>Your submissions route directly to regional stewards specializing in your cultural tradition.</p>
            </div>
          </li>
          <li>
            <Icon name="file" size={24} />
            <div>
              <h3>Asynchronous Revision</h3>
              <p>Receive constructive feedback and revision notes from stewards directly on your dashboard.</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
