'use client';
import { useActionState, useState, useEffect, useRef } from 'react';
import { requestPermissionAction } from '@/app/actions';
import { LotusLoader } from '@/components/LotusLoader';
import { Icon } from '@/components/Icons';
import { saveStoredRequest } from '@/lib/userRequests';
import type { ActionResult } from '@/lib/contracts';

interface Props {
  recordId: string;
  recordTitle: string;
  useKey: string;
  hasSteward: boolean;
  onCancel?: () => void;
  onSuccess?: (info: { token: string; requestId: string }) => void;
}

export default function RequestPermissionForm({ recordId, recordTitle, useKey, hasSteward, onCancel, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<
    (ActionResult & { token?: string; requestId?: string }) | null,
    FormData
  >(requestPermissionAction, null);
  const [showAnother, setShowAnother] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok && state.token) {
      // 1. Save to local storage and cookies so the Request Status tab has it immediately
      saveStoredRequest({
        token: state.token,
        requestId: state.requestId || '',
        recordId,
        recordTitle,
        useKey,
        createdAt: new Date().toISOString(),
      });

      // 2. Dispatch event to wake up RequestStatusTab
      window.dispatchEvent(
        new CustomEvent('mudra:request-submitted', {
          detail: { token: state.token, requestId: state.requestId, recordId, useKey },
        }),
      );

      // 3. Close parent <details> if inside one
      const detailsParent = formContainerRef.current?.closest('details');
      if (detailsParent) {
        detailsParent.open = false;
      }

      // 4. Call onSuccess callback if provided
      if (onSuccess && state.requestId) {
        onSuccess({ token: state.token, requestId: state.requestId });
      }
    }
  }, [state, recordId, recordTitle, useKey, onSuccess]);

  if (state?.ok && !showAnother) {
    return (
      <div ref={formContainerRef} className="panel ui req-success-card" style={{ marginTop: 18, border: '1.5px solid rgba(22, 101, 52, .35)', background: 'var(--pp-ok-bg, #eef9ee)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--pp-ok-ink, #14532d)' }}>
          <Icon name="checkCircle" size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--pp-ok-ink, #14532d)' }}>Request Submitted — Form Closed</h3>
        </div>
        <p style={{ margin: '8px 0 16px', color: 'var(--pp-ok-ink, #14532d)', fontSize: '.95rem', lineHeight: 1.5 }}>
          Your permission request for <strong>{recordTitle}</strong> ({useKey.replace(/_/g, ' ')}) has been submitted. The form is now closed, and you can monitor the status anytime.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn"
            style={{ minHeight: 42, padding: '0 20px', background: 'var(--pp-ok-ink, #14532d)', color: '#fff' }}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('mudra:select-tab', { detail: { tabId: 'request-status' } }));
              document.querySelector('.tablist')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Icon name="clock" size={16} /> View Status in Tab →
          </button>
          <a
            href={`/request/${state.token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn secondary"
            style={{ minHeight: 42, padding: '0 18px' }}
          >
            Open Private Tracking Link ↗
          </a>
          <button
            type="button"
            className="btn secondary"
            style={{ minHeight: 42, padding: '0 14px', marginLeft: 'auto' }}
            onClick={() => setShowAnother(true)}
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={formContainerRef} className="panel ui" style={{ marginTop: 20 }}>
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
        A grant is a recorded statement, not a legal contract. After submitting, the form will close and you can monitor the status in the <strong>Request Status</strong> tab.
      </p>
    </div>
  );
}
