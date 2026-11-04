'use client';
import { useState } from 'react';
import { simulateTamperAction } from '@/app/actions';

interface EventStatus { seq: number; hashOk: boolean; sigOk: boolean | null }
interface VerifyData {
  ok: boolean;
  brokenAt?: number;
  reason?: string;
  latest?: string;
  events: EventStatus[];
}

export default function TamperSimulation({ recordId }: { recordId: string }) {
  const [tampered, setTampered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<VerifyData | null>(null);

  async function toggle(makeTamper: boolean) {
    setBusy(true);
    try {
      const res = await simulateTamperAction(recordId, makeTamper);
      if (res.ok) {
        setTampered(makeTamper);
        setData(res.result as VerifyData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="sim-h" style={{ marginTop: 24, borderStyle: 'dashed' }}>
      <h2 id="sim-h" style={{ marginTop: 0 }}>Interactive tamper simulation (Sandbox only)</h2>
      <p className="muted">
        Try editing an event in memory. The database is never modified. Observe how any changed byte immediately breaks the cryptographic hash chain.
      </p>

      {data && (
        <div className={`verdict ${data.ok ? 'permitted' : 'not_permitted'}`} role="status" style={{ marginBottom: 12 }}>
          <strong>
            <span aria-hidden="true">{data.ok ? '✓ ' : '✕ '}</span>
            {data.ok ? `Chain intact (${data.events.length} events)` : `Chain broken at event #${data.brokenAt}`}
          </strong>
          <span>
            {data.ok
              ? 'Every event links to the one before it and no event was changed or removed.'
              : `Reason: ${data.reason}. Events before #${data.brokenAt} still check out.`}
          </span>
        </div>
      )}

      <p>
        {!tampered ? (
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() => toggle(true)}
          >
            {busy ? 'Simulating…' : 'Simulate direct database edit on event #2'}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => toggle(false)}
          >
            {busy ? 'Restoring…' : 'Restore original history'}
          </button>
        )}
      </p>

      <p className="hint">
        <strong>Tamper-evident, not tamper-proof:</strong> an edit is revealed, not prevented. This simulation runs in memory and never writes to the database.
      </p>
    </section>
  );
}
