import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { AVOID } from '../src/lib/wording';

function walk(d: string): string[] {
  return readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx|css)$/.test(p) ? [p] : []; });
}
test('UI source never uses avoided words (legal text is allow-listed with // wording-allow)', () => {
  const bad: string[] = [];
  for (const f of walk('src')) {
    if (f.endsWith('wording.ts')) continue;
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (line.includes('wording-allow')) return;
      for (const w of AVOID) if (new RegExp(`\\b${w}\\b`, 'i').test(line)) bad.push(`${f}:${i + 1} "${w}"`);
    });
  }
  assert.deepEqual(bad, []);
});
