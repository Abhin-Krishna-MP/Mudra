#!/usr/bin/env node
/**
 * Offline Grant Verification Script
 *
 * Verifies a signed grant artifact offline using standard Ed25519 signature checks
 * over RFC 8785 canonical JSON. No network access or database connection required.
 *
 * Usage:
 *   node scripts/verify-grant.mjs <grant.json> <public-key.pem>
 */
import { readFileSync } from 'node:fs';
import { createHash, verify, createPublicKey } from 'node:crypto';
import canonicalize from 'canonicalize';

function main() {
  const [grantPath, pubKeyPath] = process.argv.slice(2);

  if (!grantPath || !pubKeyPath) {
    console.error('Usage: node scripts/verify-grant.mjs <grant.json> <public-key.pem>');
    process.exit(2);
  }

  let grantRaw, pubKeyPem;
  try {
    grantRaw = JSON.parse(readFileSync(grantPath, 'utf8'));
  } catch (err) {
    console.error(`Error reading grant file "${grantPath}": ${err.message}`);
    process.exit(1);
  }

  try {
    pubKeyPem = readFileSync(pubKeyPath, 'utf8');
  } catch (err) {
    console.error(`Error reading public key file "${pubKeyPath}": ${err.message}`);
    process.exit(1);
  }

  const { payload, signature } = grantRaw;
  if (!payload || !signature) {
    console.error('Invalid grant format: missing payload or signature field.');
    process.exit(1);
  }

  // 1. Canonicalize payload using RFC 8785
  const canonical = canonicalize(payload);
  if (!canonical) {
    console.error('Could not canonicalize payload.');
    process.exit(1);
  }

  // 2. Compute SHA-256 hash of canonical JSON
  const hash = createHash('sha256').update(canonical).digest();

  // 3. Verify signature with Ed25519 public key
  let valid = false;
  try {
    const key = createPublicKey(pubKeyPem);
    const sigBuf = Buffer.from(signature, 'base64');
    valid = verify(null, hash, key, sigBuf);
  } catch (err) {
    console.error(`Signature verification error: ${err.message}`);
    process.exit(1);
  }

  if (!valid) {
    console.error('\nFAIL: Cryptographic signature does not match payload.');
    console.error('The grant content has been altered or signed by a different key.');
    process.exit(1);
  }

  // 4. Check time validity
  const now = new Date();
  const validFrom = new Date(payload.valid_from);
  const validUntil = payload.valid_until ? new Date(payload.valid_until) : null;

  console.log('\n--- Mudra Grant Offline Verification ---');
  console.log(`Grant ID:         ${payload.grant_id}`);
  console.log(`Record ID:        ${payload.record_id}`);
  console.log(`Use:              ${payload.use_key}`);
  console.log(`What:             ${payload.scope?.whatYouWillMake || '—'}`);
  console.log(`Where / duration: ${payload.scope?.whereAndHowLong || '—'}`);
  console.log(`Steward:          ${payload.steward_display}`);
  console.log(`Key ID:           ${payload.key_id}`);
  console.log(`Issued:           ${payload.issued_at}`);
  console.log(`Valid From:       ${payload.valid_from}`);
  console.log(`Valid Until:      ${payload.valid_until || 'No expiration stated'}`);

  if (payload.conditions?.length) {
    console.log('Conditions:');
    payload.conditions.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  }

  if (now < validFrom) {
    console.log('\nSTATUS: PENDING (Grant validity period has not started yet)');
  } else if (validUntil && now > validUntil) {
    console.log('\nSTATUS: EXPIRED (Grant validity period has ended)');
  } else {
    console.log('\nSTATUS: ACTIVE (Signature is cryptographically valid and in force)');
  }
}

main();
