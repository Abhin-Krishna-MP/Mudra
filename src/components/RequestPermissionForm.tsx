'use client';
import { useActionState, useEffect, useRef } from 'react';
import { requestPermissionAction } from '@/app/actions';
import { LotusLoader } from '@/components/LotusLoader';
import { Icon } from '@/components/Icons';
import { CopyButton } from '@/components/CopyButton';
import { clearLegacyStoredRequests } from '@/lib/userRequests';
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
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok && state.token) {
      // Ephemeral policy: clear any legacy persistent browser storage
      clearLegacyStoredRequests();

      // Dispatch event to inform any active listener in the current page session
      window.dispatchEvent(
        new CustomEvent('mudra:request-submitted', {
          detail: { token: state.token, requestId: state.requestId, recordId, useKey },
        }),
      );

      // Close parent <details> if inside one
      const detailsParent = formContainerRef.current?.closest('details');
      if (detailsParent) {
        detailsParent.open = false;
      }

      // Call onSuccess callback if provided
      if (onSuccess && state.requestId) {
        onSuccess({ token: state.token, requestId: state.requestId });
      }
    }
  }, [state, recordId, recordTitle, useKey, onSuccess]);

  if (state?.ok && state.token) {
    return (
      <div
        ref={formContainerRef}
        className="panel ui req-success-card"
        style={{
          marginTop: 18,
          border: '1.5px solid rgba(22, 101, 52, .35)',
          background: 'var(--pp-ok-bg, #eef9ee)',
          padding: '24px 26px',
          borderRadius: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--pp-ok-ink, #14532d)' }}>
          <Icon name="checkCircle" size={24} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--pp-ok-ink, #14532d)' }}>
            Request Submitted — Form Closed
          </h3>
        </div>
        <p style={{ margin: '10px 0 16px', color: 'var(--pp-ok-ink, #14532d)', fontSize: '.95rem', lineHeight: 1.5 }}>
          Your permission request for <strong>{recordTitle}</strong> ({useKey.replace(/_/g, ' ')}) has been submitted. The submission form is now closed.
        </p>

        {/* Request Token Display Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(22, 101, 52, .35)',
            borderRadius: 12,
            padding: '16px 20px',
            margin: '16px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontSize: '.84rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#14532d' }}>
              Your Private Request Token
            </span>
            <CopyButton text={state.token} label="Copy Token Code" />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '.95rem',
              wordBreak: 'break-all',
              padding: '10px 14px',
              background: 'rgba(20, 83, 45, 0.08)',
              borderRadius: 8,
              color: '#0f3a20',
              border: '1px solid rgba(20, 83, 45, 0.2)',
              fontWeight: 600,
              userSelect: 'all',
            }}
          >
            {state.token}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(185, 28, 28, 0.08)',
              border: '1px solid rgba(185, 28, 28, 0.25)',
              color: '#991b1b',
              fontSize: '.88rem',
              lineHeight: 1.45,
            }}
          >
            <span style={{ flex: 'none', marginTop: 1, display: 'inline-flex' }}>
              <Icon name="help" size={16} />
            </span>
            <span>
              <strong>Important:</strong> Copy and save your token now. It will disappear when this page is refreshed. You can view the status of your request at any time by entering this token code in the <strong>Request Status</strong> tab.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
          <button
            type="button"
            className="btn"
            style={{ minHeight: 42, padding: '0 22px', background: 'var(--pp-ok-ink, #14532d)', color: '#fff' }}
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('mudra:select-tab', { detail: { tabId: 'request-status', token: state.token } }),
              );
              document.querySelector('.tablist')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Icon name="clock" size={16} /> View Status in Request Status Tab →
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
        <input id="req-name" name="requesterName" required type="text" autoComplete="name" placeholder="Your full name" />

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
            <span>{pending ? 'Submitting request…' : 'Submit Permission Request'}</span>
          </button>
          {onCancel && (
            <button type="button" className="secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
