/** Prints an Ed25519 keypair. Put the PRIVATE key in your host's env vars (SIGNING_PRIVATE_KEY). Never commit it. */
import { generateKeyPem } from '../src/lib/signing';
const { priv, pub } = generateKeyPem();
console.log('--- SIGNING_PRIVATE_KEY (secret; paste into Vercel env, newlines as \\n) ---');
console.log(priv.trim().replace(/\n/g, '\\n'));
console.log('\n--- public key (safe to publish; also served at /api/public-key) ---');
console.log(pub.trim());
