'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  evaluate,
  CAPABILITIES,
  CAP_PHRASE,
  USES,
  USE_IDS,
  LICENCES,
  type Capability,
  type Use,
  type CulturalState,
  type LicenceId,
  type Sensitivity,
} from '@/lib/permissions';
import { Icon } from './Icons';
import { VerdictCard } from './VerdictCard';
import { CreditWidget, type CreditFormats } from './CreditWidget';
import RequestPermissionForm from './RequestPermissionForm';

interface Props {
  recordId: string;
  recordTitle: string;
  licence: LicenceId;
  permissions: Record<Capability, CulturalState>;
  attributionRequired: boolean;
  sensitivity: Sensitivity;
  credit: CreditFormats;
  hasSteward: boolean;
  initialUse?: Use;
  initialOpen?: boolean;
}

const CAP_TO_USE: Record<Capability, Use> = {
  commercial: 'print_merch',
  share: 'share_online',
  adapt: 'remix',
  ai_training: 'ai_training',
};

const USE_TO_CAP: Record<Use, Capability> = {
  share_online: 'share',
  teach: 'share',
  print_merch: 'commercial',
  remix: 'adapt',
  commercial_remix: 'commercial',
  ai_training: 'ai_training',
};

const ICON: Record<CulturalState, string> = { permitted: '✓', not_permitted: '✕', unspecified: '?' };
const WORD: Record<CulturalState, string> = { permitted: 'permitted', not_permitted: 'not permitted', unspecified: 'not stated' };
const CLS: Record<CulturalState, string> = { permitted: 'ok', not_permitted: 'no', unspecified: 'ask' };
const cap = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

export function InteractiveReuseGlance({
  recordId,
  recordTitle,
  licence,
  permissions,
  attributionRequired,
  sensitivity,
  credit,
  hasSteward,
  initialUse = 'print_merch',
  initialOpen = false,
}: Props) {
  const [selectedUse, setSelectedUse] = useState<Use>(initialUse);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [showTooltip, setShowTooltip] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Current capability corresponding to selected use
  const activeCap = USE_TO_CAP[selectedUse] || 'commercial';

  // Evaluate verdict for current use
  const out = evaluate({
    use: selectedUse,
    licence,
    cultural: permissions,
    attributionRequired,
    sensitivity,
  });

  const lic = LICENCES[licence];

  // Listen for clicks on hero "Check Reuse in Reuse Studio" or anchor navigation
  useEffect(() => {
    const handleOpenStudio = (e: Event) => {
      const customEvent = e as CustomEvent<{ use?: Use; capability?: Capability }>;
      if (customEvent.detail?.use) {
        setSelectedUse(customEvent.detail.use);
      } else if (customEvent.detail?.capability) {
        setSelectedUse(CAP_TO_USE[customEvent.detail.capability] || 'print_merch');
      }
      setIsOpen(true);
      setTimeout(() => {
        drawerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    };

    window.addEventListener('mudra:open-reuse', handleOpenStudio);

    // If page loaded with #studio-h or ?ask=1 or ?use=
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const urlUse = params.get('use') as Use;
      if (urlUse && USE_IDS.includes(urlUse)) {
        setSelectedUse(urlUse);
        setIsOpen(true);
      } else if (hash === '#studio-h' || hash === '#reuse-interactive' || params.get('ask') === '1') {
        setIsOpen(true);
      }
    }

    return () => window.removeEventListener('mudra:open-reuse', handleOpenStudio);
  }, []);

  const handleBadgeClick = (c: Capability) => {
    const mappedUse = CAP_TO_USE[c] || 'print_merch';
    if (isOpen && activeCap === c) {
      // Toggle collapse if clicking the same open badge
      setIsOpen(false);
    } else {
      setSelectedUse(mappedUse);
      setIsOpen(true);
      setTimeout(() => {
        drawerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  const handleUseChange = (u: Use) => {
    setSelectedUse(u);
    setIsOpen(true);
  };

  return (
    <div className="reuse-glance-interactive-container" id="studio-h">
      {/* ---------- Status Badges Bar (Reuse at a Glance) ---------- */}
      <div className="pp-glance" role="group" aria-label="Reuse at a glance status">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2>
            <span>Reuse at a Glance</span>
            <button
              type="button"
              className="pp-info-ico pp-info-toggle"
              aria-label="Explain how cultural reuse is decided"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
              style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
            >
              <Icon name="info" size={16} />
            </button>
          </h2>
          <span className="badge-hint hide-sm" style={{ fontSize: '.78rem', color: 'var(--pp-muted)', fontStyle: 'italic' }}>
            (Click any badge to check rules or request consent)
          </span>
        </div>

        {/* Interactive Badges List */}
        <div className="reuse-pills" role="tablist" aria-label="Interactive reuse badges">
          {CAPABILITIES.map((c) => {
            const state = permissions[c];
            const isSelected = isOpen && activeCap === c;
            const tone = CLS[state];

            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-expanded={isSelected}
                className={`rpill ${tone} rpill-interactive ${isSelected ? 'is-active' : ''}`}
                onClick={() => handleBadgeClick(c)}
                title={`Click to inspect ${CAP_PHRASE[c]} permission and details`}
              >
                <span className="rpill-ico" aria-hidden="true">{ICON[state]}</span>
                <span>{cap(CAP_PHRASE[c])}: {WORD[state]}</span>
                <span className="rpill-toggle-arrow" aria-hidden="true">
                  <Icon name={isSelected ? 'chevDown' : 'chevron'} size={12} className={isSelected ? 'open' : ''} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Dynamically Expanded Reuse & Request Panel ---------- */}
      {isOpen && (
        <div
          ref={drawerRef}
          className="reuse-interactive-drawer"
          id="reuse-interactive"
          aria-live="polite"
          style={{
            marginTop: 14,
            padding: '24px 26px',
            borderRadius: 20,
            border: '1.5px solid var(--pp-edge)',
            background: 'var(--pp-card)',
            boxShadow: '0 20px 48px rgba(0, 0, 0, .45), 0 0 0 1px rgba(255, 255, 255, .08) inset',
            animation: 'menuFadeDown .22s cubic-bezier(.2, .7, .2, 1) both',
          }}
        >
          {/* Drawer Top Navigation & Close Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', paddingBottom: 16, borderBottom: '1px solid var(--pp-edge)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`rpill ${CLS[permissions[activeCap]]}`} style={{ minHeight: 30, padding: '4px 12px', fontSize: '.84rem' }}>
                <Icon name={permissions[activeCap] === 'permitted' ? 'checkCircle' : permissions[activeCap] === 'not_permitted' ? 'cross' : 'help'} size={14} />
                <span>{cap(CAP_PHRASE[activeCap])}</span>
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                Reuse Rule: {USES[selectedUse].label}
              </h3>
            </div>

            <button
              type="button"
              className="btn secondary"
              onClick={() => setIsOpen(false)}
              aria-label="Collapse reuse explanation"
              style={{ minHeight: 34, padding: '0 14px', fontSize: '.85rem', borderRadius: 999 }}
            >
              <span>✕ Close explanation</span>
            </button>
          </div>

          {/* =========================================================================
              CLARIFY DUAL-LAYER CONCEPT EARLY (AT THE VERY TOP OF THE REUSE SECTION)
              Explains why users must ask to use a file that is freely accessible online.
              ========================================================================= */}
          <div className="dual-layer-early-card" style={{ marginTop: 20, marginBottom: 22, padding: '20px 22px', borderRadius: 16, background: 'rgba(0, 0, 0, .2)', border: '1px solid var(--pp-edge)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.78rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--pp-accent)', fontWeight: 700 }}>
                  <Icon name="layers" size={15} />
                  <span>The Mudra Dual-Layer Protocol</span>
                </span>
                <h4 style={{ margin: '6px 0 0', fontSize: '1.18rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Why must I ask if this file is free on the internet?</span>
                  <button
                    type="button"
                    className="tooltip-info-btn"
                    onClick={() => setShowTooltip(!showTooltip)}
                    aria-label="Read traditional knowledge protection note"
                    aria-expanded={showTooltip}
                    style={{ background: 'transparent', border: 0, color: 'var(--pp-accent)', cursor: 'pointer', display: 'inline-flex', padding: 2 }}
                  >
                    <Icon name="info" size={18} />
                  </button>
                </h4>
              </div>

              <div style={{ fontSize: '.84rem', color: 'var(--pp-muted)' }}>
                <span>Rule: <strong>More protective layer always wins</strong></span>
              </div>
            </div>

            {/* Traditional Knowledge Protection Tooltip Explainer */}
            <div
              className="tk-tooltip-box"
              style={{
                marginTop: 12,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(232, 147, 90, .14)',
                border: '1px solid rgba(232, 147, 90, .35)',
                fontSize: '.92rem',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--pp-accent)', flex: 'none', marginTop: 2, display: 'inline-flex' }}>
                  <Icon name="shield" size={18} />
                </span>
                <div>
                  <p style={{ margin: 0 }}>
                    <strong>Protection of Living Cultural Knowledge:</strong> A digital image licence (such as Creative Commons or Wikimedia) only covers the digital photograph file taken by a camera. It does not grant permission to exploit or commodify the sacred traditions, generational handloom designs, or living art forms belonging to the community.
                  </p>
                  <p style={{ margin: '6px 0 0', color: 'var(--pp-muted)', fontSize: '.86rem' }}>
                    Mudra checks what the tradition bearers and communities stated alongside copyright laws, ensuring cultural heritage is treated with respect.
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-Side Dual-Layer Cards */}
            <div className="dual-layers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 16 }}>
              {/* Cultural Layer */}
              <div className="layer-col layer-cultural" style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(0, 0, 0, .25)', border: '1px solid var(--pp-edge)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--pp-accent)', display: 'inline-flex' }}>
                      <Icon name="users" size={18} />
                    </span>
                    <strong style={{ fontSize: '.96rem' }}>1. Cultural Layer (Heritage)</strong>
                  </div>
                  <span className={`rpill ${CLS[permissions[activeCap]]}`} style={{ minHeight: 24, padding: '2px 10px', fontSize: '.78rem' }}>
                    {cap(permissions[activeCap])}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--pp-ink)', lineHeight: 1.45 }}>
                  {out.cultural.statement}
                </p>
              </div>

              {/* File Licence Layer */}
              <div className="layer-col layer-licence" style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(0, 0, 0, .25)', border: '1px solid var(--pp-edge)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--pp-accent)', display: 'inline-flex' }}>
                      <Icon name="scale" size={18} />
                    </span>
                    <strong style={{ fontSize: '.96rem' }}>2. File Licence (Copyright)</strong>
                  </div>
                  <span className="rpill ok" style={{ minHeight: 24, padding: '2px 10px', fontSize: '.78rem' }}>
                    {lic.label.split(' ')[0]}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--pp-ink)', lineHeight: 1.45 }}>
                  {out.licence.statement} {lic.url && <a href={lic.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pp-accent)', textDecoration: 'underline' }}>View licence terms ↗</a>}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Purpose Switcher */}
          <div style={{ marginBottom: 18 }}>
            <span className="muted" style={{ display: 'block', fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
              Check another purpose:
            </span>
            <nav aria-label="Choose a use">
              <ul className="uses" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                {USE_IDS.map((u) => (
                  <li key={u}>
                    <a
                      href={`/r/${recordId}?use=${u}#studio-h`}
                      className={`use-btn ${u === selectedUse ? 'is-active' : ''}`}
                      aria-current={u === selectedUse ? 'true' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        handleUseChange(u);
                        if (typeof window !== 'undefined') {
                          window.history.replaceState(null, '', `/r/${recordId}?use=${u}#studio-h`);
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        minHeight: 36,
                        padding: '6px 14px',
                        borderRadius: 999,
                        border: '1px solid var(--pp-edge)',
                        background: u === selectedUse ? 'var(--pp-ember, #8c2c25)' : 'rgba(0, 0, 0, .15)',
                        color: u === selectedUse ? '#fff' : 'var(--pp-ink)',
                        font: '600 .88rem var(--font-ui, system-ui)',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {USES[u].label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Verdict Card */}
          <div style={{ marginTop: 14 }}>
            <VerdictCard
              verdict={out.verdict}
              useLabel={USES[selectedUse].label}
              guidance={out.guidance}
            />
          </div>

          {/* Permission Request Form (Expands directly if Ask First) */}
          {out.verdict === 'ask_first' && (
            <div className="dynamic-request-section" style={{ marginTop: 20 }}>
              <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(232, 147, 90, .1)', border: '1px solid var(--pp-edge)', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--pp-accent)' }}>
                  Request Permission from {hasSteward ? 'Tradition Steward' : 'Community Contact'}
                </h4>
                <p className="hint" style={{ margin: '4px 0 0', fontSize: '.88rem' }}>
                  Submit this brief request to receive a cryptographically recorded grant. When submitted, the form will close and you can monitor the status in the <strong>Request Status</strong> tab.
                </p>
              </div>

              <RequestPermissionForm
                recordId={recordId}
                recordTitle={recordTitle}
                useKey={selectedUse}
                hasSteward={hasSteward}
                onSuccess={() => {
                  // After submission, user is notified and tab is switched
                }}
              />
            </div>
          )}

          {/* Sensitivity Notes */}
          {out.notes.map((n) => (
            <p key={n} className="notice" style={{ marginTop: 14 }}>{n}</p>
          ))}

          {/* Consolidated Credit Widget */}
          <CreditWidget credit={credit} creditRequired={out.creditRequired} />

          {/* Footer problem report */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--pp-edge)', flexWrap: 'wrap' }}>
            <span className="muted" style={{ fontSize: '.84rem' }}>
              <strong>Next step:</strong> {out.nextAction}
            </span>
            <a className="btn secondary" href={`/r/${recordId}/report`} style={{ minHeight: 36, padding: '0 14px', fontSize: '.84rem' }}>
              Report a problem
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
