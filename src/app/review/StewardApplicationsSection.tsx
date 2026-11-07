'use client';

import React, { useState, useTransition } from 'react';
import { Icon } from '@/components/Icons';
import { approveStewardAction, rejectStewardAction } from '@/app/actions';

export interface StewardApplicationItem {
  id: number;
  user_id: number;
  id_document_url: string;
  region: string;
  category: string;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  current_role: string;
}

interface Props {
  applications: StewardApplicationItem[];
}

export default function StewardApplicationsSection({ applications }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const handleApprove = (e: React.FormEvent<HTMLFormElement>, appId: number) => {
    e.preventDefault();
    setPendingAction(`approve-${appId}`);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await approveStewardAction(fd);
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleReject = (e: React.FormEvent<HTMLFormElement>, appId: number) => {
    e.preventDefault();
    setPendingAction(`reject-${appId}`);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await rejectStewardAction(fd);
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <section className="rc-section-block" aria-labelledby="heading-steward-applications">
      <div className="rc-section-header-wrap">
        <h2 id="heading-steward-applications" className="rc-section-heading" style={{ margin: 0 }}>
          <Icon name="shield" size={22} />
          <span>Steward Verification Requests ({applications.length})</span>
        </h2>
        <span className="rc-section-tag stewards">KYC &amp; Onboarding</span>
      </div>

      {applications.length === 0 ? (
        <div className="rc-empty-card">
          <Icon name="checkCircle" size={18} />
          <span>No pending steward applications. All submitted identity verifications have been processed!</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map((app) => (
            <article
              key={app.id}
              className="rc-record-card"
              aria-label={`Steward application from ${app.user_name}`}
              style={{
                border: '1.5px solid var(--rc-border, #ebe2d5)',
                borderRadius: 16,
                padding: '20px',
                background: 'var(--rc-card, #ffffff)',
              }}
            >
              {/* Header: User Info & Status Badges */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(117, 27, 22, 0.1)',
                        color: 'var(--rc-maroon, #751b16)',
                      }}
                    >
                      <Icon name="user" size={18} />
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--rc-ink, #2b1810)' }}>
                      {app.user_name}
                    </h3>
                  </div>

                  <p style={{ margin: '6px 0 0 40px', fontSize: '0.9rem', color: 'var(--rc-muted, #725c48)' }}>
                    Email: <strong>{app.user_email}</strong> · Current Role: <span className="chip" style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}>{app.current_role}</span>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="chip ask" style={{ fontWeight: 600 }}>Pending Review</span>
                  <span className="chip muted" style={{ fontSize: '0.8rem' }}>
                    Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>

              {/* Focus Area Tags */}
              <div
                style={{
                  background: 'rgba(196, 124, 26, 0.08)',
                  border: '1px solid rgba(196, 124, 26, 0.25)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--rc-ink, #2b1810)' }}>
                  Proposed Cultural Focus:
                </span>
                <span className="chip" style={{ background: '#fff', border: '1px solid #ddd' }}>
                  Region: <strong>{app.region || 'All Kerala'}</strong>
                </span>
                <span className="chip" style={{ background: '#fff', border: '1px solid #ddd' }}>
                  Category: <strong>{app.category || 'All Domains'}</strong>
                </span>
              </div>

              {/* Action Buttons Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--rc-border, #ebe2d5)',
                }}
              >
                {/* View ID Document */}
                <a
                  href={`/api/admin/kyc-document/${app.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                  }}
                >
                  <Icon name="search" size={16} />
                  <span>View ID Document (Secure)</span>
                </a>

                {/* Approve & Reject Form Controls */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <form onSubmit={(e) => handleApprove(e, app.id)} style={{ margin: 0 }}>
                    <input type="hidden" name="applicationId" value={app.id} />
                    <input type="hidden" name="redirectTo" value="/review" />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn pp-btn-maroon"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 700,
                        cursor: isPending ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Icon name="check" size={16} />
                      <span>{pendingAction === `approve-${app.id}` ? 'Approving...' : 'Approve as Steward'}</span>
                    </button>
                  </form>

                  <form onSubmit={(e) => handleReject(e, app.id)} style={{ margin: 0 }}>
                    <input type="hidden" name="applicationId" value={app.id} />
                    <input type="hidden" name="redirectTo" value="/review" />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn danger"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: isPending ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Icon name="cross" size={16} />
                      <span>{pendingAction === `reject-${app.id}` ? 'Rejecting...' : 'Reject'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
