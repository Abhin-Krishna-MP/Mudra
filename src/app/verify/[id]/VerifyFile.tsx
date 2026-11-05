'use client';
import { useState } from 'react';
import { Icon } from '@/components/Icons';
export default function VerifyFile({ registeredSha }: { registeredSha: string | null }) {
  const [hash, setHash] = useState<string | null>(null);
  const [name, setName] = useState('');
  async function onFile(f: File | undefined) {
    if (!f) return; setName(f.name);
    const buf = await f.arrayBuffer(); // hashed here in your browser; the file is never uploaded
    const d = await crypto.subtle.digest('SHA-256', buf);
    setHash([...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join(''));
  }
  return (
    <div className="ui">
      <div className="dropzone">
        <Icon name="upload" size={34} className="up" />
        <label htmlFor="vf">Drop a file here or <span className="choose">choose a file</span></label>
        <span className="formats">It is hashed in your browser and never uploaded.</span>
        <input id="vf" type="file" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {hash && (<div role="status" style={{ marginTop: 12 }}>
        <p>SHA-256 of <strong>{name}</strong>:<br /><code style={{ wordBreak: 'break-all' }}>{hash}</code></p>
        {registeredSha === null ? <p>The registered file hash is not shown for this record.</p>
          : hash === registeredSha ? <p className="verdict permitted"><strong><span aria-hidden="true">✓ </span>Exact match with the registered image file.</strong></p>
          : <p className="verdict ask_first"><strong><span aria-hidden="true">? </span>Not an exact match.</strong> It may be a resized or edited copy. Try <a href="/check">Check an image</a> for a possible match.</p>}
      </div>)}
    </div>
  );
}
