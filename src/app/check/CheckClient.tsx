'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icons';
import { LotusLoader } from '@/components/LotusLoader';
import { similarityPercent } from '@/lib/ui';

type Match = { id: string; title: string; distance: number; band: string; primaryCredit: string; thumbUrl?: string | null };
type Res = { exact?: { id: string; title: string; thumbUrl?: string | null }; possible: Match[] };

const MAX_BYTES = 10 * 1024 * 1024;
const STEPS = [
  { icon: 'upload', title: 'Upload an image', text: 'Add a cultural image (JPEG, PNG or WebP).' },
  { icon: 'search', title: 'Find matches', text: 'We look for visually similar records in Mudra’s catalogue.' },
  { icon: 'checkCircle', title: 'View results', text: 'See possible matches with record details and credit information.' },
] as const;

export default function CheckClient() {
  const [res, setRes] = useState<Res | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false); const [preview, setPreview] = useState<string | null>(null); const [fname, setFname] = useState('');
  const [file, setFile] = useState<File | null>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    setRes(null); setErr('');
    if (f.size > MAX_BYTES) { setErr('That file is larger than 10 MB. Please choose a smaller image.'); return; }
    setFile(f); setFname(f.name);
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
  }
  async function check() {
    if (!file) { setErr('Choose an image first.'); return; }
    setBusy(true); setErr(''); setRes(null);
    const fd = new FormData(); fd.append('file', file);
    try {
      const r = await fetch('/api/match', { method: 'POST', body: fd });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Could not check this image.'); setRes(j);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  const nothing = res && !res.exact && res.possible.length === 0;
  return (
    <>
      <div className="ck-grid">
        <div className="ck-main">
          <p className="ck-intro"><strong>Found an image and want to know if Mudra has a record for it? Upload it here.</strong></p>
          <p className="ck-sub">The file is compared and not stored. A match is only a pointer for human review, never a finding about anyone.</p>

          <div className={`dropzone ck-drop${over ? ' over' : ''}${preview ? ' has-file' : ''}`} onDragEnter={() => setOver(true)} onDragLeave={() => setOver(false)} onDrop={() => setOver(false)}>
            {preview
              ? <img className="preview" src={preview} alt={`Preview of ${fname}`} />
              : <span className="ck-up" aria-hidden="true"><Icon name="image" size={64} className="ck-up-back" /><Icon name="upload" size={46} className="up" /></span>}
            <p className="ck-drop-title">{preview ? <>Selected: <strong>{fname}</strong></> : 'Drag & drop an image here'}</p>
            <p className="ck-or">{preview ? '' : 'or'}</p>
            <label htmlFor="img" className="ck-choose"><span className="choose">{preview ? 'choose another file' : 'choose a file'}</span></label>
            <span className="formats">JPEG, PNG or WebP · Max 10 MB</span>
            <input id="img" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
          </div>

          <button type="button" className="ck-go" onClick={check} disabled={busy}>
            {busy ? <LotusLoader size="xs" inline /> : <Icon name="search" size={22} />}
            {busy ? 'Checking…' : 'Check Image'}
          </button>
        </div>

        <aside className="ck-how" aria-labelledby="ck-how-h">
          <div className="ck-how-head"><span className="ck-how-ico"><Icon name="layers" size={26} /></span><h2 id="ck-how-h">How it Works</h2></div>
          <ol className="ck-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="ck-num" aria-hidden="true">{i + 1}</span>
                <span className="ck-step-ico" aria-hidden="true"><Icon name={s.icon} size={26} /></span>
                <div><h3>{s.title}</h3><p>{s.text}</p></div>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <div className="ck-results" role="status" aria-live="polite">
        {busy && (
          <div className="panel ck-loading-panel" style={{ padding: '36px 16px' }}>
            <LotusLoader size="md" label="Checking image against Kerala cultural registry…" />
          </div>
        )}
        {err && <p className="err"><span aria-hidden="true">✕ </span>{err}</p>}
        {nothing && <div className="panel"><h3>No match found</h3><p>That does not mean the image is free to reuse: heavy crops, mirroring and edits are not matched, and not every work has a record.</p></div>}
        {res?.exact && (
          <div className="panel">
            <p className="eyebrow-line"><span aria-hidden="true">✓ </span>Exact file match</p>
            <div className="match" style={{ marginTop: 10 }}>
              <div className="thumb" style={res.exact.thumbUrl ? { backgroundImage: `url("${res.exact.thumbUrl}")` } : undefined}>{!res.exact.thumbUrl && <Icon name="image" size={26} />}</div>
              <div><h3>{res.exact.title}</h3><p className="meta">{res.exact.id} · for human review</p></div>
            </div>
            <div className="btn-row" style={{ marginTop: 14 }}><a className="btn" href={`/r/${res.exact.id}`}>View Record <Icon name="arrow" size={18} /></a></div>
          </div>
        )}
        {res?.possible.map((p) => (
          <div key={p.id} className="panel">
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
    </>
  );
}
