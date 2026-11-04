import { createHash } from 'node:crypto';
import sharp from 'sharp';

export interface ProcessedImage {
  sha256: string; dhash: string; width: number; height: number; bytes: number; mime: string; buffer: Buffer;
}

/** 64-bit difference hash as 16 hex chars. Resize to 9x8 greyscale, compare neighbours. */
export async function dHash(buf: Buffer): Promise<string> {
  const { data } = await sharp(buf).rotate().greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  let bits = '';
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += data[y * 9 + x] > data[y * 9 + x + 1] ? '1' : '0';
  let hex = '';
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}

export function hamming(a: string, b: string): number {
  let x = BigInt('0x' + a) ^ BigInt('0x' + b);
  let n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
}

export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_BYTES = 8 * 1024 * 1024;

export async function processImage(buf: Buffer): Promise<ProcessedImage> {
  if (buf.length > MAX_BYTES) throw new Error('Image is larger than 8 MB.');
  const meta = await sharp(buf).metadata();
  const mime = meta.format === 'jpeg' ? 'image/jpeg' : meta.format === 'png' ? 'image/png' : meta.format === 'webp' ? 'image/webp' : '';
  if (!ALLOWED_MIME.includes(mime)) throw new Error('Only JPEG, PNG or WebP images are accepted.');
  return {
    sha256: createHash('sha256').update(buf).digest('hex'),
    dhash: await dHash(buf),
    width: meta.width ?? 0, height: meta.height ?? 0, bytes: buf.length, mime, buffer: buf,
  };
}

/** Thresholds are a starting point; measure on fixtures (plan 14.3) and write the result in About. */
export const STRONG = 6;
export const POSSIBLE = 12;
export const classify = (d: number): 'strong' | 'possible' | 'none' => (d <= STRONG ? 'strong' : d <= POSSIBLE ? 'possible' : 'none');
