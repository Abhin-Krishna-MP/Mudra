'use client';
import { useActionState, useState } from 'react';
import { requestPermissionAction } from '@/app/actions';
import { LotusLoader } from '@/components/LotusLoader';
import type { ActionResult } from '@/lib/contracts';

interface Props {
  recordId: string;
  recordTitle: string;
  useKey: string;
  hasSteward: boolean;
  onCancel?: () => void;
}

export default function RequestPermissionForm({ recordId, recordTitle, useKey, hasSteward, onCancel }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(requestPermissionAction, null);

  return (
    <div className="panel ui" style={{ marginTop: 20 }}>
      <h3 style={{ marginTop: 0 }}>Request permission to use this work</h3>
      <p className="hint">
        {hasSteward
          ? 'A steward is linked to this record. Your request will be sent to them for review. Your contact is kept private.'
          : 'No steward is currently linked to this record. Your request will be forwarded to the listed contact. This may take some time.'}
      </p>
      <p className="hint" style={{ marginBottom: 16 }}>
        <strong>{recordTitle}</strong> · Use: {useKey.replace(/_/g, ' ')}
      </p>

      {state && !state.ok && <p className="notice" role="alert" style={{ color: 'var(--ink-warn)' }}>{state.error}</p>}

      <form action={formAction}>
        <input type="hidden" name="recordId" value={recordId} />
        <input type="hidden" name="useKey" value={useKey} />
        {/* Honeypot */}
        <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

        <label htmlFor="req-name">Your name <span aria-hidden>*</span></label>
        <input id="req-name" name="requesterName" required autoComplete="name" />

        <label htmlFor="req-contact">Your contact (email or phone) <span aria-hidden>*</span></label>
        <input id="req-contact" name="requesterContact" required type="text"
          aria-describedby="contact-hint" autoComplete="email" />
        <p id="contact-hint" className="hint" style={{ marginTop: 2 }}>Kept private — only shown to the reviewer, never published.</p>

        <label htmlFor="req-what">What you will make <span aria-hidden>*</span></label>
        <textarea id="req-what" name="whatYouWillMake" required rows={2}
          placeholder="e.g. a T-shirt print for a craft fair, a book illustration, a documentary poster…" />

        <label htmlFor="req-where">Where and how long <span aria-hidden>*</span></label>
        <textarea id="req-where" name="whereAndHowLong" required rows={2}
          placeholder="e.g. sold in Kerala only, one season; or online store, indefinite…" />

        <div className="btn-row" style={{ marginTop: 20 }}>
          <button type="submit" disabled={pending}>
            {pending ? <LotusLoader size="xs" inline /> : null}
            {pending ? 'Sending…' : 'Send request'}
          </button>
          {onCancel && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
        </div>
      </form>

      <p className="hint" style={{ marginTop: 16 }}>
        A grant is a recorded statement, not a legal contract. After submitting, you will receive a private link to track the status of your request.
      </p>
    </div>
  );
}
