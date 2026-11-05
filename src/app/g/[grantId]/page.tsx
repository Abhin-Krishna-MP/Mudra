import { getDb } from '@/lib/db';
import { getGrant } from '@/lib/repo-grants';
import { verifyGrant } from '@/lib/grant';
import { publicKeys } from '@/lib/signing';
import { PageSheet } from '@/components/PageSheet';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Grant Verification' };

const STATUS_MSG: Record<string, { label: string; color: string; desc: string }> = {
  active: { label: '✓ Active', color: 'yes', desc: 'This grant is valid and the signature checks out.' },
  expired: { label: '⚠ Expired', color: 'ask', desc: 'This grant was valid but has now passed its validity window.' },
  revoked: { label: '✗ Revoked', color: 'no', desc: 'This grant has been revoked by the steward or reviewer.' },
};

export default async function GrantPage({ params }: { params: Promise<{ grantId: string }> }) {
  const { grantId } = await params;
  const db = await getDb();
  const grant = await getGrant(db, grantId);
  if (!grant) notFound();

  const pubKeys = publicKeys();
  const verifyResult = verifyGrant(grant.signed, pubKeys);
  const statusInfo = STATUS_MSG[grant.status] ?? STATUS_MSG['expired'];
  const p = grant.signed.payload;

  return (
    <div className="wrap page">
      <PageSheet
        title="Permission Grant"
        lede="This is a recorded statement of permission. It is not a legal contract. It says what the steward stated, when, and for what scope."
      >
        {/* Status banner */}
        <div className={`verdict-card ${statusInfo.color}`} style={{ marginBottom: 28 }}>
          <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{statusInfo.label}</p>
          <p className="muted" style={{ margin: '4px 0 0' }}>{statusInfo.desc}</p>
          {!verifyResult.ok && (
            <p style={{ color: 'var(--ink-warn)', margin: '8px 0 0', fontWeight: 600 }}>
              ⚠ Signature verification failed: {verifyResult.reason}
            </p>
          )}
          {verifyResult.ok && (
            <p style={{ margin: '8px 0 0', fontSize: '0.85rem' }}>Signature verified against key <code>{p.key_id}</code></p>
          )}
        </div>

        {/* Grant details */}
        <div className="panel ui" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Grant Details</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><th style={thStyle}>Grant ID</th><td style={tdStyle}><code style={{ fontSize: '0.8rem' }}>{p.grant_id}</code></td></tr>
              <tr><th style={thStyle}>Record</th><td style={tdStyle}><a href={`/r/${p.record_id}`}>{p.record_id}</a></td></tr>
              <tr><th style={thStyle}>Permitted use</th><td style={tdStyle}>{p.use_key.replace(/_/g, ' ')}</td></tr>
              <tr><th style={thStyle}>What</th><td style={tdStyle}>{p.scope?.whatYouWillMake ?? '—'}</td></tr>
              <tr><th style={thStyle}>Where / duration</th><td style={tdStyle}>{p.scope?.whereAndHowLong ?? '—'}</td></tr>
              <tr><th style={thStyle}>Valid from</th><td style={tdStyle}>{new Date(p.valid_from).toLocaleDateString('en-IN', { dateStyle: 'long' })}</td></tr>
              <tr><th style={thStyle}>Valid until</th><td style={tdStyle}>{p.valid_until ? new Date(p.valid_until).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'No end date stated'}</td></tr>
              <tr><th style={thStyle}>Steward</th><td style={tdStyle}>{p.steward_display}</td></tr>
              <tr><th style={thStyle}>Steward note</th><td style={tdStyle}>{p.steward_verification}</td></tr>
              <tr><th style={thStyle}>Issued at</th><td style={tdStyle}>{new Date(p.issued_at).toLocaleString('en-IN')}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Conditions */}
        {p.conditions.length > 0 && (
          <div className="panel ui" style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0 }}>Conditions</h3>
            <ul style={{ margin: 0 }}>{p.conditions.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
        )}

        {/* Credit text */}
        {p.credit_text && (
          <div className="panel ui" style={{ marginBottom: 24 }}>
            <h3 style={{ marginTop: 0 }}>Required credit line</h3>
            <p style={{ fontFamily: 'monospace', background: 'var(--paper)', padding: '8px 12px', borderRadius: 6, margin: 0 }}>{p.credit_text}</p>
          </div>
        )}

        {/* Raw payload for offline verification */}
        <details className="panel" style={{ marginBottom: 24 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Signed JSON payload (for offline verification)</summary>
          <pre style={{ marginTop: 12, overflowX: 'auto', fontSize: '0.75rem' }}>{JSON.stringify(grant.signed, null, 2)}</pre>
          <p className="hint">Run <code>node scripts/verify-grant.mjs &lt;grant.json&gt; &lt;public-key.pem&gt;</code> to verify offline.</p>
        </details>

        {/* Revoke notice */}
        {grant.status === 'revoked' && grant.revoked_at && (
          <p className="notice" style={{ color: 'var(--ink-warn)' }}>
            Revoked on {new Date(grant.revoked_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}.
          </p>
        )}

        <p className="hint" style={{ marginTop: 24 }}>
          Audit head at time of grant: <code style={{ fontSize: '0.75rem' }}>{p.record_audit_head.slice(0, 16)}…</code> —
          confirms which version of the record this permission was given on.
        </p>
      </PageSheet>
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '6px 12px 6px 0', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top', width: '30%' };
const tdStyle: React.CSSProperties = { padding: '6px 0', verticalAlign: 'top' };
