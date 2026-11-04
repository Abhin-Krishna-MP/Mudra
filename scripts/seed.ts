/**
 * Wipe-and-reseed the database from data/seed/records.json.
 * Every record's text, sources and licences are written by people (plan section 10); this script only loads them.
 * Usage: npm run seed
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { scriptDb } from './db';
import { createRecord } from '../src/lib/repo';
import { processImage } from '../src/lib/imagehash';
import { signingKey } from '../src/lib/signing';
import { hashPassword } from '../src/lib/auth';

async function ensureSandboxImage() {
  mkdirSync('public/seed', { recursive: true });
  const p = 'public/seed/demo-0001.png';
  if (existsSync(p)) return;
  // Abstract, invented, CC0: concentric blocks. No cultural claim.
  const w = 640, h = 480;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#efe7d8"/>
  ${[0,1,2,3,4].map((i) => `<rect x="${60 + i * 40}" y="${40 + i * 30}" width="${520 - i * 80}" height="${400 - i * 60}" fill="none" stroke="${['#2f4a3a','#8a3b2a','#c9a24a','#2f4a3a','#8a3b2a'][i]}" stroke-width="14"/>`).join('')}</svg>`;
  writeFileSync(p, await sharp(Buffer.from(svg)).png().toBuffer());
}

async function main() {
  await ensureSandboxImage();
  const db = await scriptDb();
  for (const t of ['verifications','flags','audit_events','assets','credits','records','counters']) await db.execute(`DELETE FROM ${t}`);

  const records = JSON.parse(readFileSync('data/seed/records.json', 'utf8')) as any[];
  const key = signingKey();
  const seeder = { role: 'system', name: 'Seed import' };
  let n = 0;
  for (const r of records) {
    const imgPath = join('public', r.image.file);
    const p = await processImage(readFileSync(imgPath));
    const res = await createRecord(db, {
      ...r, attributionRequired: r.attributionRequired ?? true, contextSources: r.contextSources ?? [],
      asset: { location: r.image.file, mime: p.mime, alt: r.image.alt, sourceNote: r.image.sourceNote ?? '', sha256: p.sha256, dhash: p.dhash, width: p.width, height: p.height, bytes: p.bytes },
    }, seeder, { key, id: r.id, isDemo: !!r.isDemo, publishAs: { role: 'reviewer', name: 'Seed import' } });
    if (!res.ok) throw new Error(`${r.id ?? r.title}: ${JSON.stringify(res.fieldErrors ?? res.error)}`);
    n++;
  }
  // keep the ID counter ahead of imported MDR-2026-NNNN ids
  const max = Math.max(0, ...records.map((r) => /^MDR-2026-(\d+)$/.exec(r.id ?? '')?.[1]).filter(Boolean).map(Number));
  if (max) await db.execute("INSERT INTO counters (name, value) VALUES ('record', ?)", [max]);

  if (process.env.DEMO_REVIEWER_PASSWORD) {
    await db.execute('DELETE FROM users WHERE email = ?', ['reviewer@mudra.demo']);
    await db.execute('INSERT INTO users (email,name,role,password_hash) VALUES (?,?,?,?)', ['reviewer@mudra.demo', 'Demo reviewer', 'reviewer', hashPassword(process.env.DEMO_REVIEWER_PASSWORD)]);
    console.log('Demo reviewer: reviewer@mudra.demo (throwaway password from DEMO_REVIEWER_PASSWORD)');
  }
  console.log(`Seeded ${n} record(s). Signing: ${key ? 'on' : 'off (events unsigned)'}.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
