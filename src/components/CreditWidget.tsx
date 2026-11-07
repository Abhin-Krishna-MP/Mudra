'use client';

import { useState } from 'react';
import { CopyButton } from './CopyButton';
import { Icon } from './Icons';

export interface CreditFormats {
  plain: string;
  markdown: string;
  html: string;
  short: string;
}

interface Props {
  credit: CreditFormats;
  creditRequired?: boolean;
  className?: string;
}

type FormatKey = 'plain' | 'markdown' | 'html' | 'short';

const FORMATS: Array<{ key: FormatKey; label: string; desc: string }> = [
  { key: 'plain', label: 'Plain Text', desc: 'Standard attribution text for articles, prints, or captions.' },
  { key: 'markdown', label: 'Markdown', desc: 'Formatted markdown with clickable links for GitHub, docs, or blogs.' },
  { key: 'html', label: 'HTML', desc: 'Ready-to-paste HTML snippet with anchor tags for web pages.' },
  { key: 'short', label: 'Short Caption', desc: 'Compact one-line caption for social media or photo credits.' },
];

export function CreditWidget({ credit, creditRequired = true, className = '' }: Props) {
  const [format, setFormat] = useState<FormatKey>('plain');
  const currentText = credit[format] || credit.plain;
  const currentMeta = FORMATS.find((f) => f.key === format) || FORMATS[0];

  return (
    <div className={`credit-widget-consolidated ${className}`} style={{ marginTop: 20 }}>
      <div className="cw-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="quote" size={17} />
            <span>Copy Credit Line</span>
          </h4>
          <p className="hint" style={{ margin: '3px 0 0', fontSize: '.86rem' }}>
            {creditRequired
              ? 'Credit is required by licence or cultural custom.'
              : 'Credit is recommended by cultural protocol.'}
          </p>
        </div>

        {/* Format Selector: Internal Tabs / Dropdown */}
        <div className="cw-format-nav" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div className="cw-tabs" role="tablist" aria-label="Select credit format" style={{ display: 'flex', gap: 4, background: 'rgba(0, 0, 0, .2)', padding: 3, borderRadius: 10 }}>
            {FORMATS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={format === f.key}
                className={`cw-tab-btn ${format === f.key ? 'is-active' : ''}`}
                onClick={() => setFormat(f.key)}
                style={{
                  minHeight: 32,
                  padding: '4px 12px',
                  borderRadius: 7,
                  border: 0,
                  background: format === f.key ? 'var(--pp-ember, #8c2c25)' : 'transparent',
                  color: format === f.key ? '#fff' : 'var(--pp-muted, #cdb8a0)',
                  font: '600 .84rem var(--font-ui, system-ui)',
                  cursor: 'pointer',
                  transition: 'all .15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick mobile dropdown fallback */}
          <select
            className="cw-dropdown hide-md"
            value={format}
            onChange={(e) => setFormat(e.target.value as FormatKey)}
            aria-label="Credit format selector"
            style={{ display: 'none' }}
          >
            {FORMATS.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Code Text Box Display */}
      <div className="cw-body" style={{ position: 'relative', borderRadius: 12, border: '1.5px solid var(--pp-edge)', background: 'rgba(12, 7, 5, .65)', overflow: 'hidden' }}>
        <pre
          className="credit cw-pre"
          tabIndex={0}
          aria-label={`${currentMeta.label} credit text`}
          style={{
            margin: 0,
            padding: '16px 20px',
            fontSize: '.9rem',
            lineHeight: 1.55,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            color: 'var(--pp-ink)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 150,
            overflowY: 'auto',
          }}
        >
          {currentText}
        </pre>

        {/* Action bar inside widget */}
        <div
          className="cw-actions-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid var(--pp-edge)',
            background: 'rgba(0, 0, 0, .25)',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span className="muted" style={{ fontSize: '.82rem' }}>
            {currentMeta.desc}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <CopyButton
              text={currentText}
              label={format === 'plain' ? 'Copy plain text' : `Copy ${currentMeta.label}`}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

