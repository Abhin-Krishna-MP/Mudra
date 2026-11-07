# Mudra — Presentation Deck (10 Slides)
> **Event:** ART//CODE 2026 · **Problem Statement:** PS-03 "Credit the Culture"  
> **Team:** Abhin Krishna M P & Alin  
> **Live Production:** `https://mudra-one-ivory.vercel.app`  

---

## Slide 1: Title & Vision
**Mudra — Cultural Passports**  
*Turning "Ask First" into a Recorded, Verifiable Answer for People and Machines*

- **The Challenge:** ART//CODE 2026 — PS-03: "Credit the Culture"
- **The Team:** Abhin Krishna M P (Backend, Cryptographic Grants, Machine Layer, Deploy, Performance) & Alin (Design System, Editorial Museum UI/UX, Accessible Client Flows)
- **Live Deployment:** `https://mudra-one-ivory.vercel.app` (Next.js 15 App Router + Turso LibSQL Edge Database)
- **Core Philosophy:** *Don't just take the imagery. Credit the culture.*

---

## Slide 2: The Problem
**"Ask First" Was a Dead End — Cultural Heritage Lost in Digital Translation**

- **Severed Attribution:** Digital platforms and stock archives strip indigenous traditions of their geographical origins, artisan lineages, and living custodians.
- **Copyright ≠ Cultural Consent:** A permissive open licence (like CC BY or CC0) only governs legal copyright. It fails to convey community wishes regarding sacred ritual depictions or commercial merchandising.
- **The Dead End:** Registries stop at telling users to "Ask first"—leaving creators with no standardized protocol to ask, stewards with no structured channel to answer, and platforms with no way to verify consent.

---

## Slide 3: The Solution in One Flow
**Check → Ask → On Record**

```
  [ 1. Check ]  ──► Reuser checks motif via perceptual dHash on /check or /catalogue.
                    Dual-layer engine explains why: "Commercial merch: Ask first".
                     │
  [ 2. Ask ]    ──► Reuser submits 4-field request (scope, medium, private contact).
                    Named cultural steward reviews request and defines custom terms.
                     │
  [ 3. On Record ] ──► Mudra signs an Ed25519 Grant certificate (RFC 8785 canonical JSON).
                       Verifiable online (/g/[id]) or completely offline (verify-grant.mjs).
```

---

## Slide 4: Living Cultural Experience & Padippura Master Navbar
**Traditional Kerala Architectural Heritage Meets Precision Modern UI**

- **Padippura Master Navbar:** Handcrafted Kerala entrance gateway (*Padippura*) featuring an intricately carved pitched terracotta roof, brass *kettuvallam* boat, hanging *nilavilakku* lamp, and golden *gopuram* pediment.
- **Subpixel Typography Synthesis:** Inpainted blurry raster areas and re-composited razor-sharp vector typography in warm ivory cream (`#fff8ee`) and Kerala temple gold (`#f2ce73`), eliminating blur on high-DPI Retina screens.
- **Dual-Theme 3D Heritage Stage:** Parting velvet stage curtain revealing the daylit Kerala backwaters Kathakali stage in light theme, and the midnight temple Panchuruli Theyyam stage in dark theme.
- **Ergonomic Hotspot Mapping:** Pixel-perfect percentage coordinate mapping ($2087 \times 436$ aspect ratio) with live active pill indicators, gold diamond end-caps, and touch-responsive mobile drawer.

---

## Slide 5: Move 1 — The Ask → Grant Consent Engine
**Cryptographically Verifiable Permission Without Central Authority**

- **Structured 4-Field Request Form:** Requester submits scope, medium, duration, and private contact info (honeypot-protected and rate-limited).
- **Privacy by Default:** Requester contact details are kept strictly private—never leaked to public audit diffs, JSON APIs, or signed grant certificates.
- **Decentralized Steward Governance:** Only verified cultural stewards linked to a record can issue grants. Unclaimed records transparently forward requests to listed community contacts.
- **Ed25519 Canonical Grant Artifact:** Digital signature over RFC 8785 canonical JSON referencing the record's current audit head hash.
- **Offline CLI Verification:** Verifiable offline with `node scripts/verify-grant.mjs grant.json public-key.pem` (1-byte alteration breaks signature).

---

## Slide 6: Move 2 — Machine-Readable Layer for Platforms & Responsible AI
**Standardized Protocols for Automated Ingestion & Consent Enforcement**

- **W3C TDMRep Opt-Out Signals:** Publishes dynamic `/.well-known/tdmrep.json` and `tdm-reservation: 1` HTTP asset headers for records where community AI training consent has not been granted.
- **Hash-Only Platform Lookup API (`POST /api/v1/lookup`):** Platforms check batches of up to 50 SHA-256 and perceptual dHash digests without uploading user images.
- **Signed Dataset Manifest (`GET /api/v1/manifest.json`):** Cryptographically signed snapshot of all registered cultural works, hashes, and AI stances for dataset auditors.
- **Semantic Structured Data:** schema.org `CreativeWork` and `ImageObject` JSON-LD embedded on every passport page linking to licensing and reuse terms.

---

## Slide 7: Progressive Web App & Real-Time Notification Center
**Offline Reliability Meets Community Engagement**

- **Progressive Web App (PWA):** Fully installable standalone web application across desktop and mobile with adaptive heritage icons (`16px` to `512px`).
- **Offline Service Worker (`public/sw.js`):** Cache-first strategy for heavy WebP artworks, static assets, and OFL webfonts; network-first with offline cache fallback for catalog records.
- **Live Registry Notification Center:** Database-backed feed (`/api/notifications`) streaming real-time audit events, reviewer verifications, and steward grants directly to an interactive popover with unread badge pulses.

---

## Slide 8: Zero-Heat GPU Performance & Thermal Engineering
**Eliminating Laptop Overheating Without Sacrificing Visual Splendor**

- **The Problem:** The ember particle canvas was re-allocating 70 dynamic `CanvasGradient` objects every frame ($>1,000\text{ gradients/sec}$), hammering the GPU and V8 garbage collector.
- **Offscreen Sprite Solution:** Pre-rendered a single $64\times 64$ ember sprite offscreen once, drawing particles via hardware-accelerated `drawImage` texture blits. Radial gradient creations dropped from **3,278 in 3s down to 1** (**99.97% reduction**).
- **Tab Background Sleep Lifecycle:** Added `visibilitychange` listeners to completely sleep animation loops when the tab is hidden or minimized (**0% CPU / 0% GPU in background**).
- **DOM Mutation Deduping:** String caching for CSS custom properties (`--mx`, `--my`, `--tpx`, `--tpy`, `--torch-op`) to eliminate continuous mask re-evaluations during idle states.

---

## Slide 9: Cryptographic Trust & Tamper Evidence
**Provable Provenance Without Blockchain Waste**

- **Sequential SHA-256 Audit Chains:** Every creation, approval, steward grant, and flag resolution appends to an atomic cryptographic hash chain ($H_k = \text{SHA-256}(H_{k-1} \parallel P_k)$).
- **Asymmetric Ed25519 Signatures:** Audit events and grants signed with Ed25519, supporting mixed chains with public key verification at `/api/public-key`.
- **In-App Tamper Simulation (`/verify/[id]`):** Live in-memory simulation demonstrating exactly which sequence number breaks if stored data is tampered with.
- **Deterministic SVG Identity Seal:** Byte-identical mandala seal derived from SHA-256 of record ID and attributed credits.

---

## Slide 10: Ethical Guardrails, Standards & Market Impact
**Rigorous Discipline and Traditional Cultural Respect**

- **Mudra Never Consents for a Community:** Reviewers moderate evidence; only named, authorized stewards decide permissions.
- **Zero Hallucinated Culture:** All 15 Kerala records were compiled and cross-verified by humans from primary academic and governmental sources (UNESCO, Kerala Kalamandalam, Kerala Folklore Academy, and GI Registry of India).
- **Zero Prohibited Buzzwords:** Automated test suite (`tests/wording.test.ts`) forbids extractive words (`owner`, `ownership`, `stolen`, `infringement`, `authentic`).
- **WCAG AA Accessibility:** 10/10 contrast compliance (14.95:1 ink-on-paper), full `prefers-reduced-motion` support, and zero bloated UI frameworks.
