import { LotusMark } from './Ornaments';

/** A stamped seal with rotating lettering. Shown on verified passports; the words are the project's own tagline. */
export function Seal({ label = 'Verified by a reviewer' }: { label?: string }) {
  return (
    <div className="seal" role="img" aria-label={label}>
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <defs><path id="seal-ring" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" /></defs>
        <circle cx="60" cy="60" r="57" className="seal-bg" />
        <circle cx="60" cy="60" r="54" className="seal-line" />
        <circle cx="60" cy="60" r="31" className="seal-line" />
        <g className="seal-text"><text><textPath href="#seal-ring" startOffset="0">MUDRA · CREDIT THE CULTURE · VERIFIED ·</textPath></text></g>
      </svg>
      <span className="seal-core"><LotusMark size={36} /></span>
    </div>
  );
}
