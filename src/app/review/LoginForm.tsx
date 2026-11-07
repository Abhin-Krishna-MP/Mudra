'use client';
import { useActionState, useState } from 'react';
import { loginAction } from '@/app/actions';
import { Icon, type IconName } from '@/components/Icons';
import { LotusLoader } from '@/components/LotusLoader';
import type { ActionResult } from '@/lib/contracts';

const svg = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const;
const Mail = () => <svg {...svg}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
const Lock = () => <svg {...svg}><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>;
const Eye = ({ off }: { off: boolean }) => (
  <svg {...svg}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" />{off && <path d="M4 4l16 16" />}</svg>
);

const POINTS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'file', title: 'Review Submissions', text: 'Check and validate cultural records.' },
  { icon: 'shield', title: 'Ensure Accuracy', text: 'Verify details, references and licences.' },
  { icon: 'layers', title: 'Manage Catalogue', text: 'Approve and keep the catalogue trustworthy.' },
];

/** Reviewer sign-in: form card on the left, console summary on the right (same sheet look as Reuse Studio). */
export default function LoginForm() {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(loginAction, null);
  const [show, setShow] = useState(false);
  return (
    <div className="studio si-grid">
      <form action={action} className="rs-card si-card">
        <div className="rs-card-head">
          <span className="si-ico"><Icon name="users" size={28} /></span>
          <div>
            <h2>Sign in to Reviewer Console</h2>
            <p>Access review tools, records and submissions.</p>
          </div>
        </div>

        {s?.error && <p className="errsum" role="alert">{s.error}</p>}

        <label className="rs-label" htmlFor="email"><span className="rs-i"><Mail /></span>Email</label>
        <input className="si-input" id="email" type="email" name="email" autoComplete="username" placeholder="Enter your email" required />

        <label className="rs-label" htmlFor="password"><span className="rs-i"><Lock /></span>Password</label>
        <div className="si-pass">
          <input className="si-input" id="password" type={show ? 'text' : 'password'} name="password" autoComplete="current-password" placeholder="Enter your password" required />
          <button type="button" className="si-eye" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}><Eye off={!show} /></button>
        </div>

        <div className="rs-actions">
          <button type="submit" className="btn" disabled={pending}>
            {pending ? <LotusLoader size="xs" inline /> : null}
            {pending ? 'Signing in…' : <>Sign in <Icon name="arrow" size={18} /></>}
          </button>
        </div>
      </form>

      <section className="si-info" aria-label="About the Reviewer Console">
        <h2>Reviewer Console</h2>
        <p className="si-info-lede">A dedicated space to review, verify and manage cultural records.</p>
        <ul>
          {POINTS.map((p) => (
            <li key={p.title}>
              <span className="si-ico"><Icon name={p.icon} size={26} /></span>
              <div><h3>{p.title}</h3><p>{p.text}</p></div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
