# Mudra — Presentation Deck (9 Slides)
> ART//CODE 2026 · PS-03 "Credit the Culture" · Team: Abhin + Alin

---

## Slide 1: Title & Team
**Mudra — Cultural Passports**
*Turning "Ask First" into a Recorded, Verifiable Answer for People and Machines*
- **Challenge:** ART//CODE 2026 — PS-03: "Credit the Culture"
- **Team:** Abhin Krishna M P (Backend, Cryptographic Grants, Machine Layer, Deploy) & Alin (Design System, Editorial Museum UI/UX, Accessible Client Flows)
- **Live Deployment:** `https://mudra-one-ivory.vercel.app` (Next.js 15 + Turso LibSQL Edge Database)

---

## Slide 2: The Problem
**"Ask First" Was a Dead End — Cultural Heritage Lost in Digital Translation**
- **Loss of Origin:** Digital platforms propagate traditional and sacred motifs stripped of cultural context, tradition bearers, and community boundaries.
- **Copyright ≠ Cultural Consent:** A permissive open licence (like CC BY or Public Domain) does not represent living community consent.
- **The Dead End:** Existing registries stop at "Ask first"—leaving reusers with no structured way to ask, stewards with no structured way to answer, and platforms with no way to verify consent.

---

## Slide 3: The Solution in One Flow
**Check → Ask → On Record**
```
  [ 1. Check ]  ──► Designer checks motif on /check via perceptual dHash.
                    Cultural Passport explains why: "Commercial merch: Ask first".
                     │
  [ 2. Ask ]    ──► Designer taps "Request permission" (4 fields, private contact).
                    Steward reviews request context and grants with custom terms.
                     │
  [ 3. On Record ] ──► Mudra signs an Ed25519 grant (RFC 8785 canonical JSON).
                      Verifiable online (/g/[id]) or offline (verify-grant.mjs).
```

---

## Slide 4: Interactive Discovery & Dual-Layer Passports
**From Exploration to Plain-Language Terms in Seconds**
- **Editorial Museum Catalogue (`/catalogue`):** Typo-tolerant fuzzy search with phonetic Malayalam transliteration aliases, region filters, and work-type chips.
- **Cultural Passport (`/r/[id]`):** Uncropped artwork mat, tradition bearer credits, cited provenance, and deterministic SVG identity seal.
- **Pure Dual-Layer Engine:** Separates creator/community wishes from file licences (17,496 property test combinations passing; any "no" wins, then "ask", else "permitted").
- **Visual Credit Cards:** Dynamic 1200×630 OpenGraph cards with uncropped artwork, metadata, and scannable QR link.

---

## Slide 5: Move 1 — The Ask → Grant Consent Engine
**Cryptographically Verifiable Permission Without Central Authority**
- **4-Field Request Loop:** Requester submits scope, intended medium, duration, and private contact (rate-limited, honeypot protected).
- **Privacy by Default:** Requester contact details are kept strictly private—never leaked to public logs or blockchain-like diffs.
- **Steward Governance:** Only linked cultural stewards can decide. Unclaimed records transparently forward requests to listed contacts.
- **Signed Grant Artifact:** Ed25519 signature over RFC 8785 canonical JSON, tied to the record's current audit chain head.
- **Offline CLI Verification:** Verified with `node scripts/verify-grant.mjs grant.json public-key.pem` (1-byte alteration breaks signature).

---

## Slide 6: Move 2 — Machine-Readable Layer for Platforms & AI
**Responsible AI and Platform Interoperability Built In**
- **W3C TDMRep Opt-Out Signals:** `/.well-known/tdmrep.json` and `tdm-reservation: 1` HTTP headers published for all records where AI training is not explicitly permitted.
- **Hash-Only Platform API (`POST /api/v1/lookup`):** Platforms check batches of up to 50 SHA-256 and dHash values without uploading user images.
- **Signed Dataset Manifest (`GET /api/v1/manifest.json`):** Ed25519-signed snapshot of all registered works, hashes, and AI stances for training auditors.
- **Structured Data:** schema.org `CreativeWork` JSON-LD on every passport page linking directly to licence and reuse endpoints.

---

## Slide 7: Cryptographic Trust & Tamper Evidence
**Provable Provenance Without Blockchain Waste**
- **Sequential SHA-256 Audit Chains:** Every submission, approval, steward grant, and flag resolution appends to an atomic cryptographic hash chain.
- **Optional Ed25519 Audit Signing:** Keyed audit signing verifying service authority while supporting mixed chains.
- **In-App Tamper Simulation (`/verify/[id]`):** Live in-memory simulation demonstrating exactly which sequence number breaks if stored data is tampered with.
- **Browser-Side File Verification:** Verifies local image files against registered digests using `crypto.subtle`.

---

## Slide 8: Market & Feasibility
**Sustainable Adoption and Realistic Economics**
- **Who Feels the Pain?**
  - **Stewards:** Artisan cooperatives and performers asked repeatedly without structure.
  - **Reusers:** Designers, merchandise sellers, publishers wanting to do the right thing.
  - **Platforms & AI Builders:** Needing machine-readable consent signals to prevent community backlash.
- **Wedge:** One craft community (e.g. Aranmula metal mirrors or Theyyam custodians) + local Kerala designers.
- **Revenue Hypothesis:** Stewards and individual creators use Mudra free. B2B API tiers for platforms and AI dataset builders (batch lookups, signed manifests, change webhooks).
- **Moat:** The network of verified stewards and a permanent history of signed, verifiable grants.

---

## Slide 9: Culture, Safeguards & Honest Limits
**Rigorous Standards and Authentic Representation**
- **Mudra Never Consents for a Community:** Reviewers moderate and verify evidence; only named stewards decide permissions.
- **Grants are Recorded Statements:** Plain-language statements of what a steward said, not legal copyright transfers.
- **Zero AI-Generated Cultural Facts:** All 15 Kerala records were compiled and cross-verified by humans from cited academic and government sources.
- **Zero Prohibited Buzzwords:** Automated test suite (`wording.test.ts`) enforces clean, non-presumptive language throughout code and UI.
- **WCAG AA Accessibility:** 10/10 contrast compliance (14.95:1 ink-on-paper), fully responsive down to 320 px, zero bloated UI frameworks.
