'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icons';
import { similarityPercent } from '@/lib/ui';

type Match = { id: string; title: string; distance: number; band: string; primaryCredit: string; thumbUrl?: string | null };
type Res = { exact?: { id: string; title: string; thumbUrl?: string | null }; possible: Match[] };

export default function CheckClient() {
  const [res, setRes] = useState<Res | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false); const [preview, setPreview] = useState<string | null>(null); const [fname, setFname] = useState('');
  async function go(f: File | undefined) {
    if (!f) return; setBusy(true); setErr(''); setRes(null); setFname(f.name);
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
    const fd = new FormData(); fd.append('file', f);
    try {
      const r = await fetch('/api/match', { method: 'POST', body: fd });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not check this image.'); setRes(j);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  const nothing = res && !res.exact && res.possible.length === 0;
  return (
    <div className="studio ui" style={{ marginTop: 18 }}>
      <div>
        <div className={`dropzone${over ? ' over' : ''}`} onDragEnter={() => setOver(true)} onDragLeave={() => setOver(false)} onDrop={() => setOver(false)}>
          {preview ? <img className="preview" src={preview} alt={`Preview of ${fname}`} /> : <Icon name="upload" size={40} className="up" />}
          <label htmlFor="img">{preview ? <>Selected: <strong>{fname}</strong>. <span className="choose">Choose another</span></> : <>Drop an image here or <span className="choose">choose a file</span></>}</label>
          <span className="formats">JPEG, PNG or WebP</span>
          <input id="img" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => go(e.target.files?.[0])} />
        </div>
      </div>
      <div role="status" aria-live="polite">
        {busy && <div className="panel" style={{ margin: 0 }}><p>Checking…</p></div>}
        {err && <p className="err"><span aria-hidden="true">✕ </span>{err}</p>}
        {nothing && <div className="panel" style={{ margin: 0 }}><h3>No match found</h3><p>That does not mean the image is free to reuse: heavy crops, mirroring and edits are not matched, and not every work has a record.</p></div>}
        {res?.exact && (
          <div className="panel" style={{ margin: 0 }}>
            <p className="eyebrow-line"><span aria-hidden="true">✓ </span>Exact file match</p>
            <div className="match" style={{ marginTop: 10 }}>
              <div className="thumb" style={res.exact.thumbUrl ? { backgroundImage: `url("${res.exact.thumbUrl}")` } : undefined}>{!res.exact.thumbUrl && <Icon name="image" size={26} />}</div>
              <div><h3>{res.exact.title}</h3><p className="meta">{res.exact.id} · for human review</p></div>
            </div>
            <div className="btn-row" style={{ marginTop: 14 }}><a className="btn" href={`/r/${res.exact.id}`}>View Record <Icon name="arrow" size={18} /></a></div>
          </div>
        )}
        {res?.possible.map((p) => (
          <div key={p.id} className="panel" style={{ margin: res.exact ? '12px 0 0' : 0 }}>
            <p className="eyebrow-line"><span aria-hidden="true">? </span>{p.band === 'strong' ? 'Strong possible match' : 'Possible match found'}</p>
            <div className="match" style={{ marginTop: 10 }}>
              <div className="thumb" style={p.thumbUrl ? { backgroundImage: `url("${p.thumbUrl}")` } : undefined}>{!p.thumbUrl && <Icon name="image" size={26} />}</div>
              <div>
                <h3>{p.title}</h3>
                <p className="meta">{p.id}{p.primaryCredit ? ` · credit: ${p.primaryCredit}` : ''}</p>
                <p className="meta">Similarity: <span className="sim">{similarityPercent(p.distance)}%</span> <span className="hint">(difference score {p.distance} of 64)</span></p>
              </div>
            </div>
            <p className="hint">A pointer for human review, not a finding about anyone.</p>
            <div className="btn-row" style={{ marginTop: 10 }}><a className="btn" href={`/r/${p.id}`}>View Record <Icon name="arrow" size={18} /></a></div>
          </div>
        ))}
      </div>
    </div>
  );
}
