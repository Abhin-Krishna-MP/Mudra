'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/Icons';
import { reviewFormAction, assignStewardAction, unassignStewardAction } from '@/app/actions';

export interface RecordItem {
  id: string;
  status: string;
  verification_level: string;
  disputed: number;
  title: string;
  region: string;
  category: string;
  revision_note: string;
}

export interface StewardUser {
  id: number;
  name: string;
  email: string;
  role: string;
  region: string;
  category: string;
}

interface Props {
  record: RecordItem;
  linkedStewards: Array<{ id: number; name: string }>;
  allStewards: StewardUser[];
}

export default function RecordManagementCard({ record: r, linkedStewards, allStewards }: Props) {
  const [activeTab, setActiveTab] = useState<'moderation' | 'verification' | 'stewardship'>('moderation');

  return (
    <section className="panel ui" aria-label={r.title} style={{ marginBottom: 22, padding: '22px 24px', borderRadius: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>
            <a href={`/r/${r.id}`}>{r.title}</a>{' '}
            <span className="muted" style={{ fontSize: '0.9rem' }}>({r.id})</span>
          </h3>

          {/* Chips */}
          <ul className="chips" style={{ margin: '6px 0 0' }}>
            <li className="chip">{String(r.status).replace('_', ' ')}</li>
            <li className="chip">{r.region}</li>
            <li className="chip">{r.category}</li>
            <li className="chip">{r.verification_level}</li>
            {r.disputed ? <li className="chip ask">open report</li> : null}
            {linkedStewards.length > 0 ? (
              <li className="chip verified" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Icon name="shield" size={13} />
                <span>Steward: {linkedStewards.map((s) => s.name).join(', ')}</span>
              </li>
            ) : (
              <li className="chip muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Icon name="shield" size={13} />
                <span>No steward</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Horizontal Tabs to Consolidate Management Tools */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 6,
          marginTop: 18,
          marginBottom: 16,
          borderBottom: '1.5px solid var(--pp-edge, rgba(240, 137, 74, 0.3))',
          paddingBottom: 0,
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'moderation'}
          onClick={() => setActiveTab('moderation')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 16px',
            background: 'transparent',
            border: 0,
            borderBottom: activeTab === 'moderation' ? '3px solid var(--pp-accent, #e8782a)' : '3px solid transparent',
            color: activeTab === 'moderation' ? 'var(--pp-ink, #ffffff)' : 'var(--pp-muted, #a89682)',
            fontWeight: activeTab === 'moderation' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name="scale" size={15} />
          <span>1. Moderation & Review</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'verification'}
          onClick={() => setActiveTab('verification')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 16px',
            background: 'transparent',
            border: 0,
            borderBottom: activeTab === 'verification' ? '3px solid var(--pp-accent, #e8782a)' : '3px solid transparent',
            color: activeTab === 'verification' ? 'var(--pp-ink, #ffffff)' : 'var(--pp-muted, #a89682)',
            fontWeight: activeTab === 'verification' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name="checkCircle" size={15} />
          <span>2. Evidence Verification</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'stewardship'}
          onClick={() => setActiveTab('stewardship')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 16px',
            background: 'transparent',
            border: 0,
            borderBottom: activeTab === 'stewardship' ? '3px solid var(--pp-accent, #e8782a)' : '3px solid transparent',
            color: activeTab === 'stewardship' ? 'var(--pp-ink, #ffffff)' : 'var(--pp-muted, #a89682)',
            fontWeight: activeTab === 'stewardship' ? 700 : 500,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name="users" size={15} />
          <span>3. Stewardship ({linkedStewards.length})</span>
        </button>
      </div>

      {/* Tab 1: Moderation */}
      {activeTab === 'moderation' && (
        <div style={{ paddingTop: 4 }}>
          {r.revision_note && (
            <div className="sb-callout" style={{ margin: '0 0 14px', padding: '10px 14px', borderRadius: 10 }}>
              <strong>Current Revision Note:</strong> {r.revision_note}
            </div>
          )}

          <form action={reviewFormAction}>
            <input type="hidden" name="recordId" value={r.id} />

            <label htmlFor={`n-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 6, fontSize: '0.9rem' }}>
              Required edits or reviewer note (required when requesting revision):
            </label>
            <input
              id={`n-${r.id}`}
              type="text"
              name="note"
              placeholder="Describe edits for author (e.g. Please verify tradition lineage)..."
              style={{ width: '100%', minHeight: 44, padding: '8px 14px', borderRadius: 8, fontSize: '0.9rem' }}
            />

            <div className="btn-row" style={{ marginTop: 14 }}>
              <button type="submit" name="action" value="approve" className="btn pp-btn-maroon">
                <Icon name="check" size={15} /> Approve
              </button>
              <button type="submit" name="action" value="requestRevision" className="secondary">
                Request Revision
              </button>
              <button type="submit" name="action" value="remove" className="danger">
                Deny
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Evidence Verification */}
      {activeTab === 'verification' && (
        <div style={{ paddingTop: 4 }}>
          <form action={reviewFormAction}>
            <input type="hidden" name="recordId" value={r.id} />
            <input type="hidden" name="action" value="verify" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div>
                <label htmlFor={`s-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: '0.88rem' }}>
                  Evidence source *
                </label>
                <input
                  id={`s-${r.id}`}
                  type="text"
                  name="source"
                  required
                  placeholder="e.g. State Folklore Academy Gazette / Gurukulam record"
                  style={{ width: '100%', minHeight: 40, padding: '6px 12px', borderRadius: 8 }}
                />
              </div>

              <div>
                <label htmlFor={`u-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: '0.88rem' }}>
                  URL (optional)
                </label>
                <input
                  id={`u-${r.id}`}
                  type="url"
                  name="url"
                  placeholder="https://..."
                  style={{ width: '100%', minHeight: 40, padding: '6px 12px', borderRadius: 8 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label htmlFor={`e-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 4, fontSize: '0.88rem' }}>
                Evidence note *
              </label>
              <textarea
                id={`e-${r.id}`}
                name="note"
                required
                rows={3}
                placeholder="Details of the verification check performed..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem' }}
              />
            </div>

            <div className="btn-row" style={{ marginTop: 12 }}>
              <button type="submit" className="btn pp-btn-maroon">
                <Icon name="shield" size={15} /> Mark Verified with Evidence
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Stewardship */}
      {activeTab === 'stewardship' && (
        <div style={{ paddingTop: 4 }}>
          {/* Currently Assigned Stewards */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--pp-muted)' }}>
              Assigned Stewards for this record:
            </span>
            {linkedStewards.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {linkedStewards.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(29, 90, 42, 0.25)',
                      border: '1px solid rgba(46, 125, 50, 0.45)',
                      borderRadius: 999,
                      padding: '4px 12px',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: '#81c784', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="shield" size={13} /> {s.name}
                    </span>
                    <form action={unassignStewardAction} style={{ display: 'inline', margin: 0 }}>
                      <input type="hidden" name="recordId" value={r.id} />
                      <input type="hidden" name="userId" value={s.id} />
                      <button
                        type="submit"
                        title={`Unlink ${s.name}`}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: '#e57373',
                          cursor: 'pointer',
                          padding: '0 4px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>
                No steward is currently linked to this record.
              </p>
            )}
          </div>

          {/* Quick Assign Steward to this Record */}
          <form
            action={assignStewardAction}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(24, 15, 11, 0.5)',
              border: '1px solid var(--pp-edge, rgba(240, 137, 74, 0.25))',
            }}
          >
            <input type="hidden" name="recordId" value={r.id} />
            <label htmlFor={`link-steward-${r.id}`} style={{ fontWeight: 600, display: 'block', marginBottom: 6, fontSize: '0.88rem' }}>
              Link a Steward to this record:
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                id={`link-steward-${r.id}`}
                name="userId"
                required
                style={{
                  minHeight: 40,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  flex: '1 1 240px',
                }}
              >
                <option value="">— Select Steward / Reviewer —</option>
                {allStewards.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) [{u.role.toUpperCase()}{u.region ? ` · ${u.region}` : ''}]
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="btn secondary"
                style={{ minHeight: 40, padding: '0 16px', fontSize: '0.86rem', fontWeight: 600, borderRadius: 8 }}
              >
                <Icon name="check" size={14} /> Link Steward
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
