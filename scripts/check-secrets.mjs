// Fails if anything that looks like a secret is in the working tree. Runs in predeploy and as a git pre-commit hook.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const SKIP = new Set(['node_modules', '.next', '.git', 'test-results', 'playwright-report']);
const SKIP_FILES = new Set(['scripts/check-secrets.mjs', 'package-lock.json']);
const RULES = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key id'],
  [/\bghp_[A-Za-z0-9]{30,}\b/, 'GitHub token'],
  [/\bvercel_blob_rw_[A-Za-z0-9_]{10,}/, 'Vercel Blob token'],
  [/\bsk-[A-Za-z0-9]{32,}\b/, 'API secret key'],
  [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, 'JWT-like token (e.g. Turso auth token)'],
  [/^(?:SESSION_SECRET|DATABASE_AUTH_TOKEN|BLOB_READ_WRITE_TOKEN|SIGNING_PRIVATE_KEY)=(?!dev-only|\s*$).+$/m, 'real value for a secret env var'],
];
const hits = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    if (SKIP.has(f)) continue;
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) { walk(p); continue; }
    if (s.size > 1_000_000 || SKIP_FILES.has(p) || /\.(png|jpe?g|webp|ico|woff2?|ttf|otf|zip|pdf)$/i.test(p)) continue;
    if (/(^|\/)\.env(\..*)?$/.test(p) && !p.endsWith('.env.example')) { hits.push(`${p}: env file present (must be git-ignored; delete before sharing/zipping)`); continue; }
    const text = readFileSync(p, 'utf8');
    for (const [re, label] of RULES) if (re.test(text)) hits.push(`${p}: ${label}`);
  }
})('.');
if (hits.length) { console.error('check-secrets FAILED:\n' + hits.join('\n')); process.exit(1); }
console.log('check-secrets OK');
