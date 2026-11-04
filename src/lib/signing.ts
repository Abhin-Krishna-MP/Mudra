import { createPublicKey, generateKeyPairSync } from 'node:crypto';

/** Returns the signing key from the environment, or null (events stay unsigned). */
export function signingKey(): { id: string; privPem: string } | null {
  const pem = process.env.SIGNING_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!pem || !pem.includes('BEGIN')) return null;
  return { id: process.env.SIGNING_KEY_ID || 'k1', privPem: pem };
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
