import { getDb } from '@/lib/db';
import { getRequestByToken } from '@/lib/repo-grants';
import { PageSheet } from '@/components/PageSheet';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Permission Request Status' };

const STATUS_LABEL: Record<string, string> = {
  open: 'Pending — awaiting steward review',
  granted: 'Granted',
  declined: 'Declined',
  revoked: 'Revoked',
  forwarded: 'Forwarded to listed contact',
  expired: 'Expired',
};

const STATUS_COLOR: Record<string, string> = {
  open: 'muted', granted: 'yes', declined: 'no', revoked: 'no', forwarded: 'ask', expired: 'muted',
};

export default async function RequestStatusPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { token } = await params;
  const sp = await searchParams;
  const db = await getDb();
  const req = await getRequestByToken(db, token);
  if (!req) notFound();

  const statusLabel = STATUS_LABEL[req.status] ?? req.status;
  const statusColor = STATUS_COLOR[req.status] ?? 'muted';

  return (
    <div className="wrap page">
      <PageSheet title="Permission Request" lede="This is your private status page. Keep this link — it is the only way to check your request.">
        {sp.sent && <p className="notice" role="status">Your request has been submitted. We will update this page when a decision is made.</p>}

        <div className="panel ui" style={{ marginBottom: 24 }}>
          <p><strong>Record:</strong> <a href={`/r/${req.record_id}`}>{req.record_id}</a></p>
          <p><strong>Requested for:</strong> {req.use_key.replace(/_/g, ' ')}</p>
          <p><strong>What you will make:</strong> {req.scope?.whatYouWillMake}</p>
          <p><strong>Where and how long:</strong> {req.scope?.whereAndHowLong}</p>
          <p><strong>Submitted:</strong> {new Date(req.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>

        <div className={`verdict-card ${statusColor}`} style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Status: {statusLabel}</p>
          {req.decided_at && <p className="muted" style={{ margin: '4px 0 0' }}>Decided: {new Date(req.decided_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>}
        </div>

        {req.status === 'granted' && req.grantId && (
          <div className="panel ui">
            <p><strong>Your permission has been granted.</strong> You can verify it and share it with platforms.</p>
            <a className="btn" href={`/g/${req.grantId}`}>View Signed Grant →</a>
          </div>
        )}

        {req.status === 'granted' && req.conditions.length > 0 && (
          <div className="panel ui">
            <h3 style={{ marginTop: 0 }}>Conditions</h3>
            <ul>
              {req.conditions.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {req.status === 'granted' && req.credit_text && (
          <div className="panel ui">
            <h3 style={{ marginTop: 0 }}>Required credit line</h3>
            <p style={{ fontFamily: 'monospace', background: 'var(--paper)', padding: '8px 12px', borderRadius: 6 }}>{req.credit_text}</p>
          </div>
        )}

        {req.decision_note && (
          <div className="panel ui">
            <h3 style={{ marginTop: 0 }}>Note from reviewer</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{req.decision_note}</p>
          </div>
        )}

        {req.status === 'forwarded' && (
          <div className="panel ui">
            <h3 style={{ marginTop: 0 }}>What happens next</h3>
            <p>No steward is currently linked to this record. Your request has been forwarded to the listed contact on the record page. This may take time — please check back or contact them directly.</p>
            <a className="btn secondary" href={`/r/${req.record_id}`}>View record page →</a>
          </div>
        )}

        <p className="hint" style={{ marginTop: 32 }}>
          A grant is a recorded statement, not a legal contract. It says what the steward stated, when, and for what scope. Mudra does not verify legal authority beyond the reviewer's evidence note.
        </p>
      </PageSheet>
    </div>
  );
}
