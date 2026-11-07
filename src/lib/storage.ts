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

/**
 * Stores sensitive KYC identity documents in secure private storage (S3, Supabase, or private server directory).
 * NEVER stored in public folder.
 */
export async function storeSecureKyc(buf: Buffer, sha256: string, mime: string): Promise<string> {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'application/pdf' ? 'pdf' : 'jpg';
  const filename = `${sha256}.${ext}`;

  // 1. Supabase Storage (if configured)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseBucket = process.env.SUPABASE_KYC_BUCKET || 'private-kyc';
  if (supabaseUrl && supabaseKey) {
    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${supabaseBucket}/${filename}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': mime,
        'x-upsert': 'true',
      },
      body: new Uint8Array(buf),
    });
    if (uploadRes.ok) {
      return `supabase://${supabaseBucket}/${filename}`;
    }
  }

  // 2. Local secure private storage: strictly in data/secure_kyc (OUTSIDE public folder)
  const dir = join(process.cwd(), 'data', 'secure_kyc');
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, filename);
  await writeFile(filePath, buf);
  return `private://${filename}`;
}

/**
 * Reads a secure KYC document for authorized admin review only.
 */
export async function readSecureKyc(location: string): Promise<Buffer | null> {
  if (location.startsWith('supabase://')) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const parts = location.replace('supabase://', '').split('/');
    const bucket = parts[0];
    const path = parts.slice(1).join('/');
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/${bucket}/${path}`, {
        headers: { 'Authorization': `Bearer ${supabaseKey}` },
      });
      if (res.ok) {
        return Buffer.from(await res.arrayBuffer());
      }
    }
  }

  const cleanName = normalize(location.replace('private://', '')).replace(/^(\.\.(\/|\\|$))+/, '');
  if (cleanName.includes('..') || cleanName.includes('/') || cleanName.includes('\\')) return null;
  const filePath = join(process.cwd(), 'data', 'secure_kyc', cleanName);
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}
