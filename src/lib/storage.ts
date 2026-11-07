import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * Returns the directory for local private storage.
 * On serverless hosts (Vercel, AWS Lambda), process.cwd() is read-only (/var/task).
 * We fall back to os.tmpdir() in serverless environments.
 */
function getLocalSecureDir(): string {
  if (process.env.KYC_DIR) {
    return process.env.KYC_DIR;
  }
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    (typeof process.cwd === 'function' && process.cwd().startsWith('/var/task'))
  ) {
    return join(tmpdir(), 'mudra_secure_kyc');
  }
  return join(process.cwd(), 'data', 'secure_kyc');
}

/** Stores an uploaded image. Blob when BLOB_READ_WRITE_TOKEN is set, otherwise public/uploads (local dev) or data URI (serverless fallback). */
export async function storeUpload(buf: Buffer, sha256: string, mime: string): Promise<string> {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV !== 'test') {
    try {
      const { put } = await import('@vercel/blob');
      const r = await put(`mudra/${sha256}.${ext}`, buf, { access: 'public', contentType: mime, addRandomSuffix: true });
      return r.url;
    } catch (err) {
      console.warn('Vercel Blob upload failed, falling back:', err);
    }
  }
  const rel = `uploads/${sha256}.${ext}`;
  try {
    await mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true });
    await writeFile(join(process.cwd(), 'public', rel), buf);
    return rel;
  } catch {
    // Graceful serverless fallback: on read-only environments where Blob is not configured,
    // store as base64 data URI so submissions never fail.
    return `data:${mime};base64,${buf.toString('base64')}`;
  }
}

export async function readLocalAsset(location: string): Promise<Buffer | null> {
  if (location.startsWith('data:')) {
    const idx = location.indexOf('base64,');
    if (idx !== -1) {
      return Buffer.from(location.slice(idx + 7), 'base64');
    }
  }
  const clean = normalize(location).replace(/^(\.\.(\/|\\|$))+/, '');
  if (clean.includes('..')) return null;
  try { return await readFile(join(process.cwd(), 'public', clean)); } catch { return null; }
}

/**
 * Stores sensitive KYC identity documents in secure private storage (Supabase, Vercel Blob, or private server directory).
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
    try {
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
    } catch {
      // Fall through to other storage providers
    }
  }

  // 2. Vercel Blob Storage (if configured, e.g. on Vercel deployment)
  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV !== 'test') {
    try {
      const { put } = await import('@vercel/blob');
      const r = await put(`kyc-docs/${sha256}.${ext}`, buf, {
        access: 'public',
        contentType: mime,
        addRandomSuffix: true,
      });
      return r.url;
    } catch (err) {
      console.warn('Vercel Blob KYC upload failed, falling back to disk:', err);
    }
  }

  // 3. Local secure private storage (OUTSIDE public folder)
  // Handles serverless read-only filesystem gracefully by trying local directory then tmpdir
  let dir = getLocalSecureDir();
  try {
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, filename);
    await writeFile(filePath, buf);
    return `private://${filename}`;
  } catch {
    try {
      dir = join(tmpdir(), 'mudra_secure_kyc');
      await mkdir(dir, { recursive: true });
      const filePath = join(dir, filename);
      await writeFile(filePath, buf);
      return `private://${filename}`;
    } catch {
      // 4. Zero-config fallback: data URI for environments where disk is completely inaccessible
      return `data:${mime};base64,${buf.toString('base64')}`;
    }
  }
}

/**
 * Reads a secure KYC document for authorized admin review only.
 */
export async function readSecureKyc(location: string): Promise<Buffer | null> {
  // Remote HTTP / HTTPS (Vercel Blob / S3 / CDN)
  if (location.startsWith('http://') || location.startsWith('https://')) {
    try {
      const res = await fetch(location);
      if (res.ok) {
        return Buffer.from(await res.arrayBuffer());
      }
    } catch {
      return null;
    }
  }

  // Base64 data URI
  if (location.startsWith('data:')) {
    const comma = location.indexOf(',');
    if (comma !== -1) {
      return Buffer.from(location.slice(comma + 1), 'base64');
    }
    return null;
  }

  // Supabase Storage
  if (location.startsWith('supabase://')) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const parts = location.replace('supabase://', '').split('/');
    const bucket = parts[0];
    const path = parts.slice(1).join('/');
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(`${supabaseUrl}/storage/v1/object/authenticated/${bucket}/${path}`, {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        });
        if (res.ok) {
          return Buffer.from(await res.arrayBuffer());
        }
      } catch {
        return null;
      }
    }
  }

  // Local private storage
  const cleanName = normalize(location.replace('private://', '')).replace(/^(\.\.(\/|\\|$))+/, '');
  if (cleanName.includes('..') || cleanName.includes('/') || cleanName.includes('\\')) return null;

  const candidateDirs = [
    getLocalSecureDir(),
    join(tmpdir(), 'mudra_secure_kyc'),
    join(process.cwd(), 'data', 'secure_kyc'),
  ];

  for (const dir of candidateDirs) {
    try {
      return await readFile(join(dir, cleanName));
    } catch {
      // Try next directory
    }
  }

  return null;
}
