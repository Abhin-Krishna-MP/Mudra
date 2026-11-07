'use client';
import { useActionState } from 'react';
import { applyStewardAction } from '@/app/actions';
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

export default function ApplyStewardForm({ user }: { user: { name: string; email: string } }) {
  const [s, action, pending] = useActionState<ActionResult | null, FormData>(applyStewardAction, null);

  return (
    <form action={action} className="ui panel" style={{ maxWidth: 640 }}>
      {s?.error && (
        <div className="errsum" role="alert" style={{ marginBottom: 16 }}>
          {s.error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="kyc-name"><strong>Applicant Name</strong></label>
        <input id="kyc-name" type="text" value={user.name} disabled className="si-input" style={{ opacity: 0.8 }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="kyc-email"><strong>Email Address</strong></label>
        <input id="kyc-email" type="email" value={user.email} disabled className="si-input" style={{ opacity: 0.8 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label htmlFor="kyc-region"><strong>Expertise Region</strong></label>
          <select id="kyc-region" name="region" required className="si-input" defaultValue="">
            <option value="" disabled>Select your region</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <p className="hint" style={{ fontSize: '0.85rem' }}>Drafts from this region will be routed to you.</p>
        </div>
        <div>
          <label htmlFor="kyc-category"><strong>Cultural Category</strong></label>
          <select id="kyc-category" name="category" required className="si-input" defaultValue="">
            <option value="" disabled>Select your category</option>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <p className="hint" style={{ fontSize: '0.85rem' }}>Your domain of cultural expertise.</p>
        </div>
      </div>

      {/* Step 3: Secure upload form for identity documents */}
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="kyc-doc"><strong>Upload Identity Document (Photo / PDF)</strong></label>
        <p className="hint" style={{ margin: '4px 0 8px 0', fontSize: '0.9rem' }}>
          Upload a clear photo of your government-issued ID (Passport, Aadhaar, Voter ID, or Driver’s License).
          This document is stored in an encrypted private bucket and is strictly accessible only to Mudra administrators.
        </p>
        <input
          id="kyc-doc"
          type="file"
          name="idDocument"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          className="si-input"
          style={{ padding: '8px' }}
        />
      </div>

      <div className="btn-row">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? <LotusLoader size="xs" inline /> : null}
          {pending ? 'Submitting KYC Application…' : <>Submit KYC Verification <Icon name="arrow" size={18} /></>}
        </button>
      </div>
    </form>
  );
}
