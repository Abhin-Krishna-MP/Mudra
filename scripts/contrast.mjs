// WCAG contrast of the colour pairs declared in src/app/globals.css (plan 14.2). Targets: 4.5 text, 3.0 large text/UI.
import { readFileSync } from 'node:fs';
const css = readFileSync('src/app/globals.css', 'utf8');
const v = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PAIRS = [['ink', 'paper', 4.5], ['ink', 'mat', 4.5], ['muted', 'paper', 4.5], ['link', 'paper', 4.5], ['ok', 'ok-bg', 4.5], ['ask', 'ask-bg', 4.5], ['no', 'no-bg', 4.5], ['focus', 'paper', 3.0], ['line', 'paper', 3.0], ['paper', 'ink', 4.5]];
let fail = 0;
for (const [f, b, min] of PAIRS) {
  if (!v[f] || !v[b]) { console.log(`skip ${f}/${b} (not defined)`); continue; }
  const r = ratio(v[f], v[b]); const ok = r >= min; if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${f} on ${b}: ${r.toFixed(2)}:1 (need ${min})`);
}
process.exit(fail ? 1 : 0);
