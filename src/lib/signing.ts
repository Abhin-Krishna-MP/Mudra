import { createPublicKey, generateKeyPairSync } from 'node:crypto';

// In-memory fallback key for environments where SIGNING_PRIVATE_KEY is not set
let fallbackKey: { id: string; privPem: string } | null = null;

/** Returns the signing key from environment or fallback key. */
export function signingKey(): { id: string; privPem: string } {
  const pem = process.env.SIGNING_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (pem && pem.includes('BEGIN')) {
    return { id: process.env.SIGNING_KEY_ID || 'k1', privPem: pem };
  }
  if (!fallbackKey) {
    const { priv } = generateKeyPem();
    fallbackKey = { id: 'k1', privPem: priv };
  }
  return fallbackKey;
}
export function publicKeys(): Record<string, string> {
  const k = signingKey();
  if (!k) return {};
  return { [k.id]: createPublicKey(k.privPem).export({ type: 'spki', format: 'pem' }).toString() };
}
export function generateKeyPem() {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return {
    priv: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    pub: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}
