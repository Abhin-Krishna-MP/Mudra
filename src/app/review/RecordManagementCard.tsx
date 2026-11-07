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
  asset_id?: string;
  asset_alt?: string;
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
    <section className="rc-record-card" aria-label={r.title}>
      {/* Top row with Thumbnail and Metadata */}
      <div className="rc-record-top">
        {/* Left Artwork Thumbnail */}
        <div className="rc-record-thumb">
          {r.asset_id ? (
            <img src={`/api/assets/${r.asset_id}`} alt={r.asset_alt || r.title} />
          ) : (
            <div style={{ color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="image" size={32} />
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="rc-record-meta">
          <h3 className="rc-record-title">
            <a href={`/r/${r.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {r.title}
            </a>{' '}
            <span style={{ fontWeight: 400, fontSize: '0.92rem', color: 'var(--rc-muted)' }}>({r.id})</span>
          </h3>

          {/* Chips matching user image */}
          <ul className="rc-record-chips">
            <li
              className="chip"
              style={{
                background: r.status === 'published' ? '#edf7ed' : '#fff3e0',
                color: r.status === 'published' ? '#1b5e20' : '#b45309',
                borderColor: r.status === 'published' ? '#c8e6c9' : '#fed7aa',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {String(r.status).replace('_', ' ')}
            </li>

            <li className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="pin" size={13} />
              <span>{r.region || 'Kerala'}</span>
            </li>

            <li className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="layers" size={13} />
              <span>{r.category || 'Cultural Work'}</span>
            </li>

            <li className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="shield" size={13} />
              <span style={{ textTransform: 'capitalize' }}>{r.verification_level}</span>
            </li>

            {r.disputed ? <li className="chip ask">Open Report</li> : null}

            {linkedStewards.length > 0 && (
              <li
                className="chip"
                style={{
                  background: '#0d4734',
                  color: '#ffffff',
                  borderColor: '#0d4734',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Icon name="user" size={13} />
                <span>Steward: {linkedStewards.map((s) => s.name).join(', ')}</span>
              </li>
            )}
          </ul>

          {/* Assigned Stewards with Unlink chip */}
          {linkedStewards.length > 0 && (
            <div className="rc-assigned-row">
              <span style={{ fontSize: '0.84rem', color: 'var(--rc-muted)', fontWeight: 600 }}>Assigned:</span>
              {linkedStewards.map((s) => (
                <form key={s.id} action={unassignStewardAction} style={{ display: 'inline', margin: 0 }}>
                  <input type="hidden" name="recordId" value={r.id} />
                  <input type="hidden" name="userId" value={s.id} />
                  <span className="rc-assigned-pill">
                    <span>{s.name}</span>
                    <button type="submit" title={`Unlink ${s.name}`}>
                      ✕
                    </button>
                  </span>
                </form>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Tabs to switch between Moderation, Verification, and Stewardship */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 6,
          marginTop: 18,
          borderBottom: '1.5px solid var(--rc-panel-border, rgba(180, 140, 90, 0.25))',
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
            gap: 6,
            padding: '8px 16px',
            background: 'transparent',
            border: 0,
            borderBottom: activeTab === 'moderation' ? '3px solid var(--rc-maroon, #751b16)' : '3px solid transparent',
            color: activeTab === 'moderation' ? 'var(--rc-maroon, #751b16)' : 'var(--rc-muted)',
            fontWeight: activeTab === 'moderation' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name="scale" size={14} />
          <span>Moderation & Review</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'verification'}
          onClick={() => setActiveTab('verification')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: 'transparent',
            border: 0,
            borderBottom: activeTab === 'verification' ? '3px solid var(--rc-maroon, #751b16)' : '3px solid transparent',
            color: activeTab === 'verification' ? 'var(--rc-maroon, #751b16)' : 'var(--rc-muted)',
            fontWeight: activeTab === 'verification' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name="checkCircle" size={14} />
          <span>Evidence Verification</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'stewardship'}
          onClick={() => setActiveTab('stewardship')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            background: 'transparent',
            border: 0,
            borderBottom: activeTab === 'stewardship' ? '3px solid var(--rc-maroon, #751b16)' : '3px solid transparent',
            color: activeTab === 'stewardship' ? 'var(--rc-maroon, #751b16)' : 'var(--rc-muted)',
            fontWeight: activeTab === 'stewardship' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Icon name="users" size={14} />
          <span>Stewardship ({linkedStewards.length})</span>
        </button>
      </div>

      {/* Tab 1: Moderation */}
      {activeTab === 'moderation' && (
        <div className="rc-edit-note-box">
          {r.revision_note && (
            <div className="sb-callout" style={{ margin: '0 0 12px', padding: '8px 12px', borderRadius: 8 }}>
              <strong>Current Revision Note:</strong> {r.revision_note}
            </div>
          )}

          <form action={reviewFormAction}>
            <input type="hidden" name="recordId" value={r.id} />

            <label htmlFor={`n-${r.id}`} className="rc-edit-note-label">
              <Icon name="quote" size={15} />
              <span>Required edits or reviewer note (required when requesting revision)</span>
            </label>
            <input
              id={`n-${r.id}`}
              type="text"
              name="note"
              className="rc-edit-note-input"
              placeholder="Describe edits for author (e.g. Please verify tradition lineage)..."
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
        <div style={{ paddingTop: 12 }}>
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
                  style={{ width: '100%', minHeight: 40, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--rc-panel-border)' }}
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
                  style={{ width: '100%', minHeight: 40, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--rc-panel-border)' }}
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
                placeholder="Details of the verification check performed against cultural evidence..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem', border: '1.5px solid var(--rc-panel-border)' }}
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
        <div style={{ paddingTop: 12 }}>
          {/* Quick Assign Steward to this Record */}
          <form
            action={assignStewardAction}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(180, 140, 90, 0.08)',
              border: '1px solid var(--rc-panel-border)',
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
                  border: '1.5px solid var(--rc-panel-border)',
                  background: 'var(--rc-card, #ffffff)',
                  color: 'var(--rc-ink)',
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
