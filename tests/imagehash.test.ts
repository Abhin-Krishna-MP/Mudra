import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { dHash, hamming, processImage, classify } from '../src/lib/imagehash';

// Synthetic fixtures (real seed-image fixtures must be measured on Day 5, plan 14.3).
async function pattern(seed: number, w = 400, h = 300) {
  const px = Buffer.alloc(w * h * 3);
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  // blocky random layout so images differ structurally
  const blocks = Array.from({ length: 6 * 6 }, () => [rnd() * 255, rnd() * 255, rnd() * 255]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const b = blocks[Math.floor((y / h) * 6) * 6 + Math.floor((x / w) * 6)];
    const i = (y * w + x) * 3; px[i] = b[0]; px[i + 1] = b[1]; px[i + 2] = b[2];
  }
  return sharp(px, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
}

test('resized, recompressed and lightly cropped copies match; unrelated images do not', async () => {
  for (const seed of [11, 22, 33]) {
    const orig = await pattern(seed);
    const h0 = await dHash(orig);
    const resized = await sharp(orig).resize(200).png().toBuffer();
    const jpeg = await sharp(orig).jpeg({ quality: 40 }).toBuffer();
    const cropped = await sharp(orig).extract({ left: 8, top: 6, width: 384, height: 288 }).toBuffer();
    for (const v of [resized, jpeg, cropped]) assert.ok(hamming(h0, await dHash(v)) <= 12, `seed ${seed}`);
    assert.equal(classify(hamming(h0, await dHash(resized))) !== 'none', true);
  }
  const a = await dHash(await pattern(11));
  for (const other of [101, 202, 303]) assert.ok(hamming(a, await dHash(await pattern(other))) > 12, `unrelated ${other}`);
});

test('empirical dHash threshold verification on real seed photos (Day 5 / A17)', async () => {
  const { readFileSync } = await import('node:fs');
  const img1 = readFileSync('public/seed/kathakali-performer.jpg');
  const img2 = readFileSync('public/seed/theyyam.jpg');
  const img3 = readFileSync('public/seed/kasavu-saree.jpg');
  const img4 = readFileSync('public/seed/coir-craft.jpg');

  const h1 = await dHash(img1);
  const h2 = await dHash(img2);
  const h3 = await dHash(img3);
  const h4 = await dHash(img4);

  // 1. Resized and recompressed copies survive within match threshold (<= 12)
  const meta = await sharp(img1).metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 600;
  const resized = await sharp(img1).resize(300).toBuffer();
  const recompressed = await sharp(img1).jpeg({ quality: 30 }).toBuffer();
  const cropped = await sharp(img1).extract({ left: 10, top: 10, width: w - 20, height: h - 20 }).toBuffer();

  assert.ok(hamming(h1, await dHash(resized)) <= 12, 'resized copy must match');
  assert.ok(hamming(h1, await dHash(recompressed)) <= 12, 'recompressed copy must match');
  assert.ok(hamming(h1, await dHash(cropped)) <= 12, 'lightly cropped copy must match');
  assert.equal(classify(hamming(h1, await dHash(resized))) !== 'none', true);

  // 2. Unrelated seed photos have distinct structure (empirical distance >= 28)
  assert.ok(hamming(h1, h2) >= 28, 'Kathakali vs Theyyam');
  assert.ok(hamming(h1, h3) >= 28, 'Kathakali vs Kasavu');
  assert.ok(hamming(h2, h4) >= 28, 'Theyyam vs Coir');
});

test('processImage hashes bytes, rejects non-images and oversize', async () => {
  const buf = await pattern(5);
  const p = await processImage(buf);
  assert.equal(p.sha256.length, 64); assert.equal(p.dhash.length, 16); assert.equal(p.mime, 'image/png');
  await assert.rejects(() => processImage(Buffer.from('not an image')));
  assert.equal(hamming('0000000000000000', 'ffffffffffffffff'), 64);
});
