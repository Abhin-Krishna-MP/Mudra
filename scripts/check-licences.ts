/** Fails on any gap in data/seed/records.json (plan 10, 14). `--min=N` also requires N non-demo records. */
import { readFileSync, existsSync } from 'node:fs';
import { LICENCE_IDS } from '../src/lib/permissions';
const min = Number((process.argv.find((a) => a.startsWith('--min=')) ?? '--min=0').split('=')[1]);
const recs = JSON.parse(readFileSync('data/seed/records.json', 'utf8')) as any[];
const bad: string[] = [];
const ids = new Set<string>();
for (const r of recs) {
  const who = r.id ?? r.title;
  const need = (c: unknown, msg: string) => { if (!c) bad.push(`${who}: ${msg}`); };
  need(r.id && !ids.has(r.id), 'missing or duplicate id'); ids.add(r.id);
  need(LICENCE_IDS.includes(r.licence), `licence must be one of ${LICENCE_IDS.join(', ')}`);
  need(r.licenceSourceNote?.trim(), 'licenceSourceNote (where the image + licence come from)');
  need(r.image?.file && existsSync(`public/${r.image.file}`), 'image file missing under public/');
  need(r.image?.alt?.trim(), 'image alt text');
  need(Array.isArray(r.credits) && r.credits.length, 'at least one credited party');
  need(r.culturalContext?.trim().length >= 20, 'culturalContext');
  if (!r.isDemo) need((r.contextSources?.length ?? 0) >= 1 || r.sourceUrl, 'at least one cited source');
  if (!r.isDemo && r.submissionBasis === 'compiled_from_public_sources') need(r.contextSources?.length, 'compiled record needs contextSources');
}
const real = recs.filter((r) => !r.isDemo).length;
if (real < min) bad.push(`only ${real} real records, need ${min}`);
if (bad.length) { console.error('check-licences FAILED:\n' + bad.map((b) => ' - ' + b).join('\n')); process.exit(1); }
console.log(`check-licences OK (${recs.length} records, ${real} real${min ? `, floor ${min} met` : ''}). Only ${real}/15 target records so far.`);
