import { createHash } from 'node:crypto';

export interface SealInput {
  id: string;
  credits?: { name: string; role?: string }[];
  label?: string;
}

/**
 * Deterministic SVG identity seal (Tier 2 #4, L13).
 * Computes a deterministic digest from the record ID and credited parties,
 * generating a byte-identical SVG seal for identical inputs.
 */
export function generateSealSvg({ id, credits = [], label = 'Verified by a reviewer' }: SealInput): string {
  // Canonical representation of input for hashing
  const payload = JSON.stringify({
    id,
    credits: [...credits].map((c) => ({ name: c.name, role: c.role ?? '' })).sort((a, b) => a.name.localeCompare(b.name)),
  });

  const hash = createHash('sha256').update(payload).digest('hex');
  const numPetals = 8 + (parseInt(hash.slice(0, 2), 16) % 9); // 8 to 16 petals deterministically
  const seedAngle = (parseInt(hash.slice(2, 6), 16) % 360);

  // Generate deterministic petals inside the seal core
  const petals: string[] = [];
  const cx = 60;
  const cy = 60;
  const r = 22;

  for (let i = 0; i < numPetals; i++) {
    const angle = (seedAngle + (i * 360) / numPetals) * (Math.PI / 180);
    const px = (cx + r * Math.cos(angle)).toFixed(2);
    const py = (cy + r * Math.sin(angle)).toFixed(2);
    petals.push(`<circle cx="${px}" cy="${py}" r="3.5" fill="currentColor" opacity="0.85" />`);
  }

  // Short hash fingerprint (first 8 hex chars)
  const fp = hash.slice(0, 8).toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${label}">
  <defs>
    <path id="seal-ring-${id}" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
  </defs>
  <circle cx="60" cy="60" r="57" class="seal-bg" />
  <circle cx="60" cy="60" r="54" class="seal-line" />
  <circle cx="60" cy="60" r="31" class="seal-line" />
  <g class="seal-petals">${petals.join('')}</g>
  <g class="seal-text">
    <text><textPath href="#seal-ring-${id}" startOffset="0">MUDRA · CREDIT THE CULTURE · ${fp} ·</textPath></text>
  </g>
  <circle cx="60" cy="60" r="14" class="seal-inner" fill="none" stroke="currentColor" stroke-width="1.2" />
  <text x="60" y="63" text-anchor="middle" font-size="6" font-family="monospace" letter-spacing="0.5" fill="currentColor">${id}</text>
</svg>`;
}
