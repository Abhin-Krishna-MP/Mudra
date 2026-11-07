'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icons';
import { CopyButton } from './CopyButton';
import { LotusLoader } from './LotusLoader';
import { getStoredRequests, saveStoredRequest, type StoredRequestInfo } from '@/lib/userRequests';
import type { RequestView } from '@/lib/repo-grants';

export { getStoredRequests, saveStoredRequest, type StoredRequestInfo };

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
  const [requests, setRequests] = useState<StoredRequestInfo[]>([]);
  const [details, setDetails] = useState<Record<string, RequestView>>({});
  const [loading, setLoading] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const loadRequests = useCallback(async () => {
    const all = getStoredRequests();
    const matching = all.filter((r) => r.recordId === recordId);
    setRequests(matching);

    if (matching.length === 0) return;

    setLoading(true);
    const newDetails: Record<string, RequestView> = {};
    for (const r of matching) {
      try {
        const res = await fetch(`/api/requests/${r.token}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.request) {
            newDetails[r.token] = data.request;
          }
        }
      } catch {
        /* fetch failed */
      }
    }
    setDetails((prev) => ({ ...prev, ...newDetails }));
    setLoading(false);
  }, [recordId]);

  useEffect(() => {
    loadRequests();
    const handleUpdate = () => loadRequests();
    window.addEventListener('mudra:request-submitted', handleUpdate);
    return () => window.removeEventListener('mudra:request-submitted', handleUpdate);
  }, [loadRequests]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = manualToken.trim();
    if (!token) return;

    setLookingUp(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/requests/${token}`);
      const data = await res.json();
      if (!res.ok || !data.ok || !data.request) {
        setLookupError('Request not found. Please check your token and try again.');
        setLookingUp(false);
        return;
      }
      const req: RequestView = data.request;
      const stored: StoredRequestInfo = {
        token,
        requestId: req.id,
        recordId: req.record_id,
        recordTitle: req.record_id === recordId ? recordTitle : `Record ${req.record_id}`,
        useKey: req.use_key,
        requesterName: req.requester_name,
        whatYouWillMake: req.scope?.whatYouWillMake,
        whereAndHowLong: req.scope?.whereAndHowLong,
        createdAt: req.created_at,
      };
      saveStoredRequest(stored);
      setDetails((prev) => ({ ...prev, [token]: req }));
      setRequests((prev) => [stored, ...prev.filter((p) => p.token !== token)]);
      setManualToken('');
    } catch {
      setLookupError('Failed to fetch request status. Please try again.');
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <div className="pp-req-status-tab" style={{ display: 'grid', gap: 20 }}>
      {/* Header banner */}
      <div className="pp-card-in" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
              Permission Requests for this Record
            </h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: '.94rem' }}>
              Track the status of your consent requests for <strong>{recordTitle}</strong> ({recordId}).
            </p>
          </div>
          {requests.length > 0 && (
            <button
              type="button"
              className="btn secondary"
              style={{ minHeight: 38, padding: '0 16px', fontSize: '.88rem' }}
              onClick={loadRequests}
              disabled={loading}
            >
              {loading ? <LotusLoader size="xs" inline /> : <Icon name="refresh" size={15} />}
              <span>{loading ? 'Refreshing…' : 'Refresh Status'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Requests list */}
      {requests.length > 0 ? (
        <div style={{ display: 'grid', gap: 18 }}>
          {requests.map((r) => {
            const live = details[r.token];
            const currentStatus = live?.status || 'open';
            const statusConfig = STATUS_LABELS[currentStatus] || STATUS_LABELS.open;

            return (
              <div
                key={r.token}
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
                      ID: #{r.requestId ? r.requestId.slice(0, 8) : 'REQ'}
                    </span>
                  </div>
                  <span className="muted" style={{ fontSize: '.88rem' }}>
                    Submitted {new Date(r.createdAt || live?.created_at || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>

                {/* Request scope details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, margin: '16px 0', padding: '14px 18px', background: 'rgba(0, 0, 0, .15)', borderRadius: 12 }}>
                  <div>
                    <span className="muted" style={{ display: 'block', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Requested Purpose</span>
                    <strong style={{ fontSize: '.98rem' }}>{r.useKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</strong>
                  </div>
                  <div>
                    <span className="muted" style={{ display: 'block', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>What you will make</span>
                    <span style={{ fontSize: '.94rem' }}>{live?.scope?.whatYouWillMake || r.whatYouWillMake || '—'}</span>
                  </div>
                  <div>
                    <span className="muted" style={{ display: 'block', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Where & How long</span>
                    <span style={{ fontSize: '.94rem' }}>{live?.scope?.whereAndHowLong || r.whereAndHowLong || '—'}</span>
                  </div>
                </div>

                {/* Decision note if decided */}
                {live?.decision_note && (
                  <div style={{ margin: '14px 0', padding: '12px 16px', borderRadius: 10, background: 'rgba(232, 147, 90, .12)', border: '1px solid var(--pp-edge)' }}>
                    <p style={{ margin: 0, fontSize: '.92rem' }}>
                      <strong>Reviewer note:</strong> {live.decision_note}
                    </p>
                    {live.decided_at && (
                      <p className="muted" style={{ margin: '4px 0 0', fontSize: '.8rem' }}>
                        Decided: {new Date(live.decided_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                      </p>
                    )}
                  </div>
                )}

                {/* Granted specifics */}
                {currentStatus === 'granted' && (
                  <div style={{ display: 'grid', gap: 12, margin: '16px 0' }}>
                    {live?.conditions && live.conditions.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '.92rem' }}>Steward Conditions:</strong>
                        <ul style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: '.92rem' }}>
                          {live.conditions.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                    {live?.credit_text && (
                      <div>
                        <strong style={{ fontSize: '.92rem' }}>Required Credit Line:</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                          <code style={{ background: 'rgba(0, 0, 0, .25)', padding: '6px 12px', borderRadius: 8, fontSize: '.88rem' }}>{live.credit_text}</code>
                          <CopyButton text={live.credit_text} label="Copy Credit Line" />
                        </div>
                      </div>
                    )}
                    {live?.grantId && (
                      <div style={{ marginTop: 8 }}>
                        <a href={`/g/${live.grantId}`} className="btn pp-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 40, padding: '0 18px', fontSize: '.92rem' }}>
                          <Icon name="shield" size={16} /> View Cryptographically Signed Grant →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--pp-edge)', flexWrap: 'wrap' }}>
                  <span className="muted" style={{ fontSize: '.84rem' }}>
                    {hasSteward
                      ? 'Reviewed by verified tradition stewards.'
                      : 'Forwarded to the community contact listed on record.'}
                  </span>
                  <a
                    href={`/request/${r.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn secondary"
                    style={{ minHeight: 38, padding: '0 16px', fontSize: '.88rem' }}
                  >
                    <span>Open Private Status Link</span>
                    <Icon name="arrow" size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="pp-card-in" style={{ padding: '36px 28px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(232, 147, 90, .14)', color: 'var(--pp-accent)', marginBottom: 14 }}>
            <Icon name="clock" size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>No Requests on This Device Yet</h3>
          <p className="muted" style={{ maxWidth: 460, margin: '0 auto 20px', fontSize: '.96rem' }}>
            If you need to use this cultural work for a purpose marked <strong>Ask first</strong>, you can submit a consent request. Once submitted, you can track it here anytime.
          </p>
          <a
            href="#studio-h"
            className="btn pp-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 24px' }}
          >
            <Icon name="refresh" size={16} /> Check Reuse Studio & Request Permission
          </a>
        </div>
      )}

      {/* Manual token lookup form */}
      <div className="pp-card-in" style={{ padding: '20px 24px' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>Track an Existing Request from Another Device</h4>
        <p className="muted" style={{ margin: '0 0 14px', fontSize: '.88rem' }}>
          If you submitted a request previously or on a different phone or browser, enter your private request token to track it here:
        </p>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Paste your 64-character private request token"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            style={{
              flex: '1 1 280px',
              minHeight: 42,
              padding: '0 14px',
              borderRadius: 10,
              border: '1.5px solid var(--pp-edge)',
              background: 'rgba(0, 0, 0, .15)',
              color: 'var(--pp-ink)',
              fontSize: '.92rem',
            }}
          />
          <button
            type="submit"
            className="btn secondary"
            disabled={lookingUp || !manualToken.trim()}
            style={{ minHeight: 42, padding: '0 20px', fontSize: '.92rem' }}
          >
            {lookingUp ? <LotusLoader size="xs" inline /> : <Icon name="search" size={16} />}
            <span>{lookingUp ? 'Checking…' : 'Find Request'}</span>
          </button>
        </form>
        {lookupError && (
          <p style={{ margin: '10px 0 0', color: 'var(--no, #dc2626)', fontSize: '.88rem' }}>
            {lookupError}
          </p>
        )}
      </div>
    </div>
  );
}

