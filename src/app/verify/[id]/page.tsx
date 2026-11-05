import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getRecordView, verifyRecord, auditRows } from '@/lib/repo';
import { publicKeys, signingKey } from '@/lib/signing';
import { PageSheet } from '@/components/PageSheet';
import { Icon } from '@/components/Icons';
import VerifyFile from './VerifyFile';
import TamperSimulation from './TamperSimulation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verify a record' };

export default async function Verify({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const v = await getRecordView(db, id);
  if (!v) notFound();
  const res = await verifyRecord(db, id, publicKeys());
  const rows = await auditRows(db, id);
  const asset = v.sensitivity === 'restricted' ? null : (await db.execute('SELECT sha256 FROM assets WHERE record_id = ?', [id])).rows[0]?.sha256 as string | undefined;
  const signed = rows.filter((r) => r.signature).length;
  return (
    <div className="wrap page">
      <PageSheet title={<>Verify {v.title}</>} lede={<>Record {id}. Two independent checks you can run yourself.</>}>
        <section className="panel" aria-labelledby="c1" style={{ marginTop: 0 }}>
          <h2 id="c1" style={{ marginTop: 0 }}><span className="step-no" aria-hidden="true">1</span>History chain</h2>
          <div className={`verdict ${res.ok ? 'permitted' : 'not_permitted'}`} role="status">
            <strong><Icon name={res.ok ? 'checkCircle' : 'cross'} size={20} className="inline" /> {res.ok ? `Chain intact (${res.events.length} events)` : `Chain broken at event #${res.brokenAt}`}</strong>
            <span>{res.ok ? 'Every event links to the one before it and no event was changed or removed.' : `Reason: ${res.reason}. Events before #${res.brokenAt} still check out.`}</span>
          </div>
          <p className="hint">Latest hash: <code>{res.ok ? res.latest : rows.at(-1)?.hash}</code></p>
          <p className="ui">Signatures: {signingKey() ? `${signed} of ${rows.length} events are signed (Ed25519). Public key at ` : 'signing is off on this deployment; events are hash-linked only. Key endpoint: '}<a href="/api/public-key">/api/public-key</a>.</p>
          <ol className="timeline">{rows.map((r) => <li key={r.seq} data-dot={res.events.find((e) => e.seq === r.seq) ? '●' : '○'}>#{r.seq} · {r.action} · {r.actor_role} · <code>{r.hash.slice(0, 12)}…</code> {r.signature ? '· signed' : '· unsigned'}</li>)}</ol>
          <p className="hint"><strong>What this shows:</strong> the history was not altered after the fact on this server. <strong>What it does not show:</strong> that the claims in the record are true, or who owns the work. The history is tamper-evident, not tamper-proof: an edit is revealed, not prevented.</p>
        </section>

        <section className="panel" aria-labelledby="c2"><h2 id="c2" style={{ marginTop: 0 }}><span className="step-no" aria-hidden="true">2</span>Does my file match the registered image?</h2>
          <VerifyFile registeredSha={asset ?? null} />
        </section>

        {v.isDemo && <TamperSimulation recordId={v.id} />}
        <p><a href={`/r/${v.id}`}>← Back to the passport</a></p>
      </PageSheet>
    </div>
  );
}
