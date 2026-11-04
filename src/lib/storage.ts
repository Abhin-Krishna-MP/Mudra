import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';

/** Stores an uploaded image. Blob when BLOB_READ_WRITE_TOKEN is set, otherwise public/uploads (local dev). */
export async function storeUpload(buf: Buffer, sha256: string, mime: string): Promise<string> {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const r = await put(`mudra/${sha256}.${ext}`, buf, { access: 'public', contentType: mime, addRandomSuffix: true });
    return r.url;
  }
  const rel = `uploads/${sha256}.${ext}`;
  try {
    await mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true });
    await writeFile(join(process.cwd(), 'public', rel), buf);
  } catch {
    throw new Error('Uploads are switched off on this deployment (no storage configured).');
  }
  return rel;
}

export async function readLocalAsset(location: string): Promise<Buffer | null> {
  const clean = normalize(location).replace(/^(\.\.(\/|\\|$))+/, '');
  if (clean.includes('..')) return null;
  try { return await readFile(join(process.cwd(), 'public', clean)); } catch { return null; }
}
