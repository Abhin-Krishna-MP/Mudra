'use client';
import { useState } from 'react';
type Res = { exact?: { id: string; title: string }; possible: Array<{ id: string; title: string; distance: number; band: string; primaryCredit: string }> };
export default function CheckClient() {
  const [res, setRes] = useState<Res | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function go(f: File | undefined) {
    if (!f) return; setBusy(true); setErr(''); setRes(null);
    const fd = new FormData(); fd.append('file', f);
    try {
      const r = await fetch('/api/match', { method: 'POST', body: fd });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not check this image.'); setRes(j);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div className="panel ui">
      <label htmlFor="img">Choose an image (JPEG, PNG or WebP)</label>
      <input id="img" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => go(e.target.files?.[0])} />
      <div role="status" aria-live="polite" style={{ marginTop: 12 }}>
        {busy && <p>Checking…</p>}
        {err && <p className="err">{err}</p>}
        {res && !res.exact && res.possible.length === 0 && <p>No match found. That does not mean the image is free to reuse: heavy crops, mirroring and edits are not matched, and not every work has a record.</p>}
        {res?.exact && <p className="verdict permitted"><strong>Exact file match with record <a href={`/r/${res.exact.id}`}>{res.exact.id}</a></strong> {res.exact.title}. For human review.</p>}
        {res?.possible.map((p) => (<p key={p.id} className="verdict ask_first"><strong>{p.band === 'strong' ? 'Strong possible match' : 'Possible match'} with record <a href={`/r/${p.id}`}>{p.id}</a>, for human review.</strong> {p.title}{p.primaryCredit ? ` — credit: ${p.primaryCredit}` : ''} (difference score {p.distance} of 64).</p>))}
      </div>
    </div>
  );
}
