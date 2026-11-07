'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icons';
import { CopyButton } from './CopyButton';
import { LotusLoader } from './LotusLoader';
import { clearLegacyStoredRequests, type StoredRequestInfo } from '@/lib/userRequests';
import type { RequestView } from '@/lib/repo-grants';

export type { StoredRequestInfo };

const STATUS_LABELS: Record<string, { label: string; tone: string; icon: 'clock' | 'checkCircle' | 'cross' | 'help' }> = {
  open: { label: 'Pending — awaiting review', tone: 'ask', icon: 'clock' },
  granted: { label: 'Permission Granted', tone: 'ok', icon: 'checkCircle' },
  declined: { label: 'Request Declined', tone: 'no', icon: 'cross' },
  revoked: { label: 'Grant Revoked', tone: 'no', icon: 'cross' },
  forwarded: { label: 'Forwarded to community contact', tone: 'ask', icon: 'help' },
  expired: { label: 'Request Expired', tone: 'muted', icon: 'clock' },
};

export function RequestStatusTab({
  recordId,
  recordTitle,
  hasSteward,
}: {
  recordId: string;
  recordTitle: string;
  hasSteward?: boolean;
}) {
  const [tokenInput, setTokenInput] = useState('');
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [request, setRequest] = useState<RequestView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupToken = useCallback(async (tok: string) => {
    const clean = tok.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok || !data.ok || !data.request) {
        setError(data.error || 'No request found for this token code. Please check your token and try again.');
        setRequest(null);
        setActiveToken(null);
      } else {
        setRequest(data.request);
        setActiveToken(clean);
        setTokenInput('');
      }
    } catch {
      setError('Unable to fetch request status. Please check your network connection.');
      setRequest(null);
      setActiveToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ephemeral lifecycle: wipe any legacy storage on mount
  useEffect(() => {
    clearLegacyStoredRequests();

    // Listen to in-memory event from active session submission
    const handleSubmitted = (e: Event) => {
      const ce = e as CustomEvent<{ token?: string }>;
      if (ce.detail?.token) {
        lookupToken(ce.detail.token);
      }
    };

    window.addEventListener('mudra:request-submitted', handleSubmitted);
    window.addEventListener('mudra:select-tab', handleSubmitted);
    return () => {
      window.removeEventListener('mudra:request-submitted', handleSubmitted);
      window.removeEventListener('mudra:select-tab', handleSubmitted);
    };
  }, [lookupToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupToken(tokenInput);
  };

  const handleClear = () => {
    setRequest(null);
    setActiveToken(null);
    setTokenInput('');
    setError(null);
  };

  const statusConfig = request ? (STATUS_LABELS[request.status] || STATUS_LABELS.open) : STATUS_LABELS.open;

  return (
    <div className="pp-req-status-tab" style={{ display: 'grid', gap: 20 }}>
      {/* Header banner */}
      <div className="pp-card-in" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
              Permission Request Status
            </h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: '.92rem' }}>
              Track consent requests and steward decisions for <strong>{recordTitle}</strong> ({recordId}).
            </p>
          </div>
          {activeToken && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn secondary"
                style={{ minHeight: 38, padding: '0 14px', fontSize: '.86rem' }}
                onClick={() => lookupToken(activeToken)}
                disabled={loading}
              >
                {loading ? <LotusLoader size="xs" inline /> : <Icon name="refresh" size={15} />}
                <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
              </button>
              <button
                type="button"
                className="btn secondary"
                style={{ minHeight: 38, padding: '0 14px', fontSize: '.86rem' }}
                onClick={handleClear}
              >
                <span>Check Another Token</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {request && activeToken ? (
        /* Detailed Request View for Active Token */
        <div
          className="pp-card-in req-detail-card"
          style={{
            padding: '24px 26px',
            borderLeft: `4px solid var(--pp-${statusConfig.tone === 'ok' ? 'ok' : statusConfig.tone === 'no' ? 'no' : 'accent'})`,
          }}
        >
          {/* Status pill & title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                className={`rpill ${statusConfig.tone}`}
                style={{ padding: '6px 16px', fontSize: '.92rem' }}
              >
                <Icon name={statusConfig.icon} size={16} />
                <strong>{statusConfig.label}</strong>
              </span>
              <span className="muted" style={{ fontSize: '.86rem' }}>
                ID: #{request.id.slice(0, 8)}
              </span>
            </div>
            <span className="muted" style={{ fontSize: '.88rem' }}>
              Submitted {new Date(request.created_at || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </span>
          </div>

          {/* Token Code Display Box with Copy Button */}
          <div
            className="req-token-box"
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'rgba(0, 0, 0, .2)',
              border: '1px solid var(--pp-edge)',
              margin: '14px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <span className="muted" style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Your Request Token Code
              </span>
              <CopyButton text={activeToken} label="Copy Token Code" />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '.9rem',
                wordBreak: 'break-all',
                color: 'var(--pp-accent)',
                userSelect: 'all',
              }}
            >
              {activeToken}
            </div>
            <p className="hint" style={{ margin: '8px 0 0', fontSize: '.82rem' }}>
              Note: This token code will disappear when this page is refreshed. Make sure you have copied it to check status again later.
            </p>
          </div>

          {/* Scope details */}
          <div
            className="req-scope-box"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              margin: '16px 0',
              padding: '16px 18px',
              background: 'rgba(0, 0, 0, .14)',
              borderRadius: 12,
              border: '1px solid var(--pp-edge)',
            }}
          >
            <div>
              <span className="muted" style={{ display: 'block', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
                Requested Purpose
              </span>
              <strong style={{ fontSize: '.98rem' }}>
                {request.use_key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </strong>
            </div>
            <div>
              <span className="muted" style={{ display: 'block', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
                What You Will Make
              </span>
              <span style={{ fontSize: '.94rem' }}>{request.scope?.whatYouWillMake || '—'}</span>
            </div>
            <div>
              <span className="muted" style={{ display: 'block', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
                Where & How Long
              </span>
              <span style={{ fontSize: '.94rem' }}>{request.scope?.whereAndHowLong || '—'}</span>
            </div>
          </div>

          {/* Reviewer note if decided */}
          {request.decision_note && (
            <div
              style={{
                margin: '16px 0',
                padding: '14px 18px',
                borderRadius: 12,
                background: 'rgba(232, 147, 90, .12)',
                border: '1px solid var(--pp-edge)',
              }}
            >
              <p style={{ margin: 0, fontSize: '.94rem' }}>
                <strong>Reviewer note:</strong> {request.decision_note}
              </p>
              {request.decided_at && (
                <p className="muted" style={{ margin: '6px 0 0', fontSize: '.82rem' }}>
                  Decided: {new Date(request.decided_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                </p>
              )}
            </div>
          )}

          {/* Granted specifics */}
          {request.status === 'granted' && (
            <div style={{ display: 'grid', gap: 14, margin: '18px 0' }}>
              {request.conditions && request.conditions.length > 0 && (
                <div>
                  <strong style={{ fontSize: '.94rem' }}>Steward Conditions:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: '.92rem' }}>
                    {request.conditions.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
              {request.credit_text && (
                <div>
                  <strong style={{ fontSize: '.94rem' }}>Required Credit Line:</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                    <code style={{ background: 'rgba(0, 0, 0, .25)', padding: '6px 12px', borderRadius: 8, fontSize: '.88rem' }}>
                      {request.credit_text}
                    </code>
                    <CopyButton text={request.credit_text} label="Copy Credit Line" />
                  </div>
                </div>
              )}
              {request.grantId && (
                <div style={{ marginTop: 8 }}>
                  <a
                    href={`/g/${request.grantId}`}
                    className="btn pp-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 40, padding: '0 18px', fontSize: '.92rem' }}
                  >
                    <Icon name="shield" size={16} /> View Cryptographically Signed Grant →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Footer information */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--pp-edge)', flexWrap: 'wrap' }}>
            <span className="muted" style={{ fontSize: '.84rem' }}>
              {hasSteward
                ? 'Reviewed by verified tradition stewards.'
                : 'Forwarded to the community contact listed on record.'}
            </span>
            <button
              type="button"
              className="btn secondary"
              style={{ minHeight: 38, padding: '0 16px', fontSize: '.88rem' }}
              onClick={handleClear}
            >
              Enter Another Token
            </button>
          </div>
        </div>
      ) : (
        /* Token Lookup Prompt (shown by default after refresh or when no token entered) */
        <div
          className="pp-card-in"
          style={{
            padding: '36px 30px',
            maxWidth: 680,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div
              style={{
                display: 'inline-flex',
                padding: 14,
                borderRadius: '50%',
                background: 'rgba(232, 147, 90, .14)',
                color: 'var(--pp-accent)',
                flex: 'none',
              }}
            >
              <Icon name="shield" size={26} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Track Your Consent Request</h3>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: '.9rem' }}>
                Enter your private request token code to view status and steward decisions.
              </p>
            </div>
          </div>

          <p className="hint" style={{ fontSize: '.92rem', lineHeight: 1.5, margin: '14px 0 20px' }}>
            For privacy, requests are not displayed publicly. Only a person with the unique request token code received upon submitting a consent request can view its status.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            <label htmlFor="token-lookup-input" style={{ fontSize: '.88rem', fontWeight: 600 }}>
              Request Token Code
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                id="token-lookup-input"
                type="text"
                placeholder="Paste your 64-character request token code"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                style={{
                  flex: '1 1 300px',
                  minHeight: 44,
                  padding: '0 14px',
                  borderRadius: 10,
                  border: '1.5px solid var(--pp-edge)',
                  background: 'rgba(0, 0, 0, .15)',
                  color: 'var(--pp-ink)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '.88rem',
                }}
              />
              <button
                type="submit"
                className="btn pp-primary"
                disabled={loading || !tokenInput.trim()}
                style={{ minHeight: 44, padding: '0 22px', fontSize: '.92rem' }}
              >
                {loading ? <LotusLoader size="xs" inline /> : <Icon name="search" size={16} />}
                <span>{loading ? 'Checking…' : 'Check Status'}</span>
              </button>
            </div>
            {error && (
              <p style={{ margin: '8px 0 0', color: 'var(--no, #dc2626)', fontSize: '.9rem', fontWeight: 500 }}>
                {error}
              </p>
            )}
          </form>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--pp-edge)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span className="muted" style={{ fontSize: '.86rem' }}>
              Don&apos;t have a token? Check reuse permissions first.
            </span>
            <a
              href="#studio-h"
              className="btn secondary"
              style={{ minHeight: 36, padding: '0 16px', fontSize: '.86rem' }}
            >
              <Icon name="refresh" size={14} /> Check Permissions
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
