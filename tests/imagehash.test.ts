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

test('processImage hashes bytes, rejects non-images and oversize', async () => {
  const buf = await pattern(5);
  const p = await processImage(buf);
  assert.equal(p.sha256.length, 64); assert.equal(p.dhash.length, 16); assert.equal(p.mime, 'image/png');
  await assert.rejects(() => processImage(Buffer.from('not an image')));
  assert.equal(hamming('0000000000000000', 'ffffffffffffffff'), 64);
});
