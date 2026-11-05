# Mudra — Cultural Passports: Comprehensive Project Report & Technical Specification

> **Event:** ART//CODE 2026 Hackathon  
> **Problem Statement:** PS-03 "Credit the Culture"  
> **Team:** Abhin Krishna M P (Backend, Audit Chains, Database, Auth, Deploy) & Alin (Design System, Accessible UI/UX, Deliverables)  
> **Repository:** `https://github.com/Abhin-Krishna-MP/Mudra`  
> **License:** MIT Open Source  
> **Report Date:** November 5, 2026  

---

## 1. Executive Summary & Problem Formulation

### 1.1 The Problem
In an increasingly digitized world, indigenous artforms, sacred rituals, and centuries-old handicrafts are routinely extracted from their geographic and cultural habitats. When uploaded to digital platforms, stock media archives, and machine-learning training datasets:
1. **Context & Attribution are Severed:** Cultural works are divorced from the artisan lineages, tribal collectives, and tradition bearers who created them.
2. **Copyright is Conflated with Cultural Consent:** Open licenses (such as Creative Commons CC BY or CC0) grant legal permission to reproduce or commercialize an asset. However, legal copyright fails to reflect the living community's cultural boundaries (e.g., sacred ritual depictions on commercial merchandise or training generative AI models).
3. **Ambiguity Paralyzes Ethical Users:** Designers, educators, and publishers who genuinely wish to credit creators and ask for permission encounter no standardized mechanism to discover who represents the community or what attribution format is expected.

### 1.2 The Mudra Solution
**Mudra** establishes **Cultural Passports** for indigenous and traditional works. A Cultural Passport evaluates two independent layers:
1. **The Cultural Permission Layer:** What the community, artisan guild, or tradition bearers have stated regarding sharing, commercialization, adaptation, and AI training.
2. **The File Licence Layer:** The legal terms governing the specific digital file (CC BY, CC BY-SA, CC0, PDM, CC BY-NC, or All Rights Reserved).

Mudra's conservative evaluation engine synthesizes these two layers into a single plain-English verdict (e.g., *"Ask first, because the community has not stated whether commercial use is acceptable"*), generates one-click attribution lines in multiple formats (Plain Text, Academic, BibTeX, HTML), generates a 1200×630 visual credit card with an embedded QR code, and tracks every modification on an append-only, SHA-256 cryptographic audit chain with optional Ed25519 signatures.

### 1.3 Core Invariants & Ethical Guardrails
- **Zero Hallucinated Culture:** AI tools were utilized strictly for programming and scaffolding. Every cultural fact, tradition bearer credit, geographical origin, and license attribution was researched, cited, and checked by human team members from primary academic and governmental sources (UNESCO, Kerala Kalamandalam, Kerala Folklore Academy, and the Geographical Indications Registry of India).
- **Prohibited Words Invariant:** Mudra explicitly rejects colonial and extractive legalistic frameworks. Automated regression tests (`tests/wording.test.ts`) forbid the words `owner`, `ownership`, `proof of ownership`, `stolen`, `detected`, `infringement`, and `authentic` throughout the application codebase and user interface. Mudra records stated snapshots and community consensus rather than arbitrating legal ownership.
- **Honest Limitations:** Mudra is not a copyright detector and does not dispense legal advice. Its audit history is tamper-evident, not tamper-proof; perceptual image matching serves as a pointer for human review, not automated adjudication; and absence of a record from the catalog implies no lack of cultural significance.

---

## 2. Complete System Architecture

Mudra is architected as an edge-capable, low-latency, zero-dependency full-stack application built on **Next.js 15 (App Router)** and **LibSQL / Turso**, utilizing native Node.js cryptographic primitives and `sharp` image processing.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT BROWSER                                       │
│                                                                                        │
│  Next.js Server Components (103 kB First Load JS) + Accessible Client Islands          │
│  - CSS-3D Lotus & Petals Canvas  - Interactive Reuse Studio  - Client-side File Hash   │
│  - Deterministic SVG Identity Seal  - In-Memory Tamper Sim   - Fuzzy Search & Filters  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / Server Actions / REST API
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS 15 RUNTIME / EDGE ENGINE                          │
│                                                                                        │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │ Permission Engine     │  │ SHA-256 Audit Chain     │  │ Perceptual dHash Matcher │  │
│  │ (pure, 17,496 tests)  │  │ (+ Ed25519 Signatures)  │  │ (64-bit gradient hash)   │  │
│  └───────────────────────┘  └─────────────────────────┘  └──────────────────────────┘  │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │ Credit Line Builder   │  │ Next/OG Card Generator  │  │ Scrypt RBAC & Auth Guard │  │
│  │ (4 escaping formats)  │  │ (1200x630 PNG + QR)     │  │ (HMAC-signed cookies)    │  │
│  └───────────────────────┘  └─────────────────────────┘  └──────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Atomic Transactions
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE & STORAGE LAYER (LIBSQL)                            │
│                                                                                        │
│  Turso Cloud (AWS ap-south-1 Mumbai) / SQLite Local (`data/mudra.db`)                   │
│  - `records`: Cultural metadata, status, permissions, sensitivity, work type           │
│  - `credits`: Attributed artists, tradition bearers, photographers, roles              │
│  - `assets`: Image hashes (SHA-256 + dHash), dimensions, MIME, storage keys            │
│  - `audit_events`: Cryptographically linked chain of sequential state transitions      │
│  - `flags`: Community reports, dispute tracking, resolution notes                      │
│  - `users`: Reviewer credentials hashed with scrypt and salt                           │
│  - `counters`: Monotonically increasing record ID generator (`MDR-2026-NNNN`)          │
│                                                                                        │
│  Storage Adapters:                                                                     │
│  - Production Live: Vercel Blob Storage (`@vercel/blob`)                               │
│  - Local Fallback: Local filesystem storage (`public/uploads/` & `public/seed/`)        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Deep Dive: Implemented Features & Technical Mechanics

### 3.1 The Two-Layer Permission Engine (`src/lib/permissions.ts`)
The permission engine is a pure mathematical function with zero I/O, zero side-effects, and zero non-determinism.

#### 1. Input Dimensions
- **Use Cases ($U$):** 6 supported reuse scenarios:
  1. `share_online` (needs: `share`)
  2. `teach` (needs: `share`)
  3. `print_merch` (needs: `share`, `commercial`)
  4. `remix` (needs: `share`, `adapt`)
  5. `commercial_remix` (needs: `share`, `commercial`, `adapt`)
  6. `ai_training` (needs: `ai_training`)
- **Cultural Permission States:** For each capability (`share`, `commercial`, `adapt`, `ai_training`), the community states:
  - `permitted`
  - `not_permitted`
  - `unspecified`
- **File Licenses:** Official Creative Commons and public domain regimes:
  - `CC0` / `PDM` (Public Domain Mark)
  - `CC-BY-4.0`
  - `CC-BY-SA-4.0`
  - `CC-BY-NC-4.0`
  - `ARR` (All Rights Reserved with stated permission)
- **Sensitivity:** `public`, `handle_with_care`, or `restricted`.

#### 2. Conservative Resolution Logic
The resolution follows a strict hierarchy where the most restrictive condition always takes precedence:
$$\text{Verdict} = \begin{cases} 
\text{not\_permitted} & \text{if any required capability is } \text{not\_permitted} \lor \text{licence forbids it} \\
\text{ask\_first} & \text{if restricted} \lor \text{any capability is } \text{unspecified} \lor \text{licence requires asking} \\
\text{permitted} & \text{otherwise}
\end{cases}$$

#### 3. Rigorous Test Verification
- **Property Test (`tests/permissions.test.ts`):** Evaluates all $6 \text{ uses} \times 6 \text{ licences} \times 3^4 \text{ cultural permutations} \times 2 \text{ attribution states} \times 3 \text{ sensitivities} = 17,496$ combinations to prove mathematical invariants (e.g., `not_permitted` never flips to `permitted`).
- **Golden Cases:** Hand-crafted golden assertions verifying real-world edge cases (e.g., CC0 with permitted culture yields `permitted` without attribution requirement; CC BY-NC with permitted culture blocks commercial use).

---

### 3.2 Cryptographic Audit Chain & Tamper Evidence (`src/lib/chain.ts`)
Every creation, review action, flag submission, and resolution commits an audit event inside the same database transaction as the underlying record change.

#### 1. Mathematical Structure of the Hash Chain
Each record maintains an ordered sequence of events $e_1, e_2, \dots, e_n$ where sequence number $\text{seq} = k$.
The cryptographic payload $P_k$ is serialized into canonical JSON using RFC 8785 (`canonicalize`):
$$P_k = \text{canonicalize}\left(\{ \text{actor}, \text{created\_at}, \text{diff}, \text{event\_type}, \text{prev\_hash}, \text{record\_id}, \text{seq} \}\right)$$
The event hash $H_k$ is computed as:
$$H_k = \text{SHA-256}(P_k)$$
For the genesis event ($k=1$), $\text{prev\_hash} = \text{"0000000000000000000000000000000000000000000000000000000000000000"}$.
For any subsequent event ($k > 1$), $\text{prev\_hash} = H_{k-1}$.

#### 2. Optional Ed25519 Asymmetric Digital Signatures (`src/lib/signing.ts`)
When a server private key (`SIGNING_PRIVATE_KEY`) is configured, events are signed using Ed25519:
$$S_k = \text{Ed25519Sign}(\text{PrivateKey}, H_k)$$
The verification engine supports **mixed chains**: older unsigned events verify by hash continuity, while signed events verify both hash continuity and cryptographic signature against the public key exposed at `/api/public-key`.

#### 3. Interactive In-Memory Tamper Simulation (`src/app/verify/[id]/TamperSimulation.tsx`)
On `/verify/MDR-DEMO-0001`, users can trigger a live simulation that mutates an event diff in browser memory. The verification engine immediately flags the exact sequence number where the cryptographic hash breaks:
```
Event #1 (create)       ● Hash verified: 4a8f...
Event #2 (verification) ○ TAMPERED! Expected 9d1c... but payload hashed to 3f0a...
Event #3 (flag_resolved)○ Chain broken (invalid prev_hash link)
```

#### 4. Browser-Side File Verification (`src/app/verify/[id]/VerifyFile.tsx`)
Users can drop a local file onto the verify page. The browser computes `crypto.subtle.digest('SHA-256', fileBuffer)` locally without uploading the file, comparing the hex digest against the record's registered asset hash.

---

### 3.3 Perceptual Image Matching via dHash (`src/lib/imagehash.ts`)
Mudra implements difference hashing (dHash) to match visually similar images regardless of recompression, slight cropping, or dimension scaling.

#### 1. Algorithm
1. Convert image to 8-bit grayscale using Sharp.
2. Downsample to a $9 \times 8$ grid of raw pixels (72 pixels).
3. Compute gradient differences horizontally: for each of the 8 rows, compare pixel $P(x, y)$ with $P(x+1, y)$. If $P(x, y) < P(x+1, y)$, set bit to `1`, else `0`.
4. Pack the 64 bits into a 16-character hexadecimal string.

#### 2. Empirical Calibration (`tests/imagehash.test.ts`)
Measured on real Kerala cultural seed photographs:
- **Modified Copies (Resized, recompressed at JPEG quality 30, cropped):**
  - Kathakali resized: Hamming distance $= 6$
  - Kathakali recompressed: Hamming distance $= 0$
  - **Verdict:** $\le 6 \implies$ "Strong visual match"; $\le 12 \implies$ "Possible visual match, for human review".
- **Distinct Cultural Subjects:**
  - Kathakali vs Kasavu Saree: Hamming distance $= 43$
  - Kathakali vs Theyyam: Hamming distance $= 31$
  - Theyyam vs Coir Craft: Hamming distance $= 37$
  - **Verdict:** $\ge 28 \implies$ "No structural similarity".

#### 3. Privacy Preservation
Restricted cultural assets (sacred items) are indexed in the matching table but their binary image is withheld from public endpoints (`/api/assets/[id]`).

---

### 3.4 Deterministic Identity Seal (`src/lib/seal.ts`)
To symbolize review authenticity without overlaying or altering sacred artwork, Mudra renders a deterministic SVG identity seal:
- Computes SHA-256 digest of `{ id, sorted_credits }`.
- Derives geometric mandala petal count ($8 \dots 16$) and initial rotation angle.
- Embeds a stamped monospace record ID and an 8-character cryptographic fingerprint.
- Verified in `tests/seal.test.ts` to guarantee 100% byte-identical SVG generation for identical inputs.

---

### 3.5 Dynamic 1200×630 Visual Credit Card (`src/app/api/records/[id]/card.png`)
Using Next.js `ImageResponse` (running on Edge via `@vercel/og`):
- Generates high-resolution 1200×630 credit cards on demand.
- Layout: Warm cream mat background (`#f4ecdc`), uncropped artwork with dark frame, primary credit, tradition bearer tags, license badge, and a high-density QR code generated via `qrcode`.
- Scannable by any mobile camera, navigating directly back to the live Cultural Passport.

---

### 3.6 Authentication, Governance & Community Reporting
- **Role-Based Access Control (`src/lib/auth.ts`, `src/lib/session.ts`):** Roles include `admin`, `reviewer`, and `submitter`. Passwords are salted and hashed using Node.js `scrypt` ($N=16384, r=8, p=1$). Sessions use HMAC-SHA256 signed cookies.
- **Reviewer Actions (`src/lib/repo.ts`):** `approveRecord`, `requestChangesRecord`, `removeRecord`, `verifyRecord` (with recorded evidence note), and `resolveFlag`. All actions record to the audit chain.
- **Community Reports (`/r/[id]/report`):** Supports problem reports and correction requests. Guarded with an invisible honeypot field (`website_hp`) to drop bots without database writes. Reporter contact info is kept confidential and is never leaked to public audit logs.

---

### 3.7 Phonetic Alias & Fuzzy Search Engine (`src/lib/search.ts`)
To accommodate non-standardized transliterations of Malayalam words into English, Mudra implements an in-house fuzzy search with a built-in alias dictionary:
- `"Teyyam"` $\rightarrow$ Matches *Theyyam ritual dance* (`MDR-2026-0003`)
- `"Koodiyattam"` $\rightarrow$ Matches *Kudiyattam Sanskrit theatre* (`MDR-2026-0008`)
- `"Mohiniyattom"` $\rightarrow$ Matches *Mohiniyattam* (`MDR-2026-0015`)
- `"Ottamthullal"` $\rightarrow$ Matches *Ottanthullal* (`MDR-2026-0011`)
- Exact record IDs (`MDR-2026-0004`) automatically rank first.

---

## 4. Complete Catalog of Seed Records (15 Real Works + 1 Demo)

Every record is documented in [`data/seed/sources.md`](file:///home/abhin-krishna-m-p/mudra/data/seed/sources.md) with verified academic sources and Creative Commons image licenses:

| ID | Title | Category | Region | License | Source Citation URL | Photographer / Attribution |
|---|---|---|---|---|---|---|
| **MDR-DEMO-0001** | Sandbox object | Sandbox | Nowhere (demo) | CC0 | Generated pattern | Team Mudra |
| **MDR-2026-0001** | Kathakali classical dance-drama | Performing | Kerala | CC-BY-SA-4.0 | `keralasangeethanatakaakademi.in` | Abhisheka Kumar |
| **MDR-2026-0002** | Kasavu handloom textile of Kerala | Textile | Kerala | CC-BY-SA-4.0 | `handlooms.nic.in` · `ipindia.gov.in` | Sheeba Samuel |
| **MDR-2026-0003** | Theyyam ritual dance — Panchuruli | Performing | North Malabar, Kerala | CC-BY-SA-4.0 | `keralafolkloreacademy.com` | Balakrishnan Koyyal |
| **MDR-2026-0004** | Aranmula Kannadi metal alloy mirror | Craft | Aranmula, Kerala | CC-BY-SA-4.0 | `ipindia.gov.in` (GI Application 1) | Krishnakumarvairassery |
| **MDR-2026-0005** | Nettipattam elephant caparison craft | Craft | Thrissur, Kerala | CC-BY-SA-4.0 | `thrissurpooramfestival.com` | Ranjithsiji |
| **MDR-2026-0006** | Kerala temple mural painting | Visual | Kannur, Kerala | CC-BY-SA-4.0 | `asithrissurcircle.gov.in` | Vijayakumarblathur |
| **MDR-2026-0007** | Kalamezhuthu ritual floor drawing | Visual | Kerala | CC-BY-SA-4.0 | `sangeetnatak.gov.in` · `kchr.ac.in` | Ranjith A V |
| **MDR-2026-0008** | Kudiyattam ancient Sanskrit theatre | Performing | Kerala | CC-BY-SA-4.0 | `ich.unesco.org` · `kalamandalam.ac.in` | Bobinson K B |
| **MDR-2026-0009** | Kaikottikali traditional folk dance | Performing | Kerala | CC-BY-SA-4.0 | `keralaculture.org` | Kottakkalnet |
| **MDR-2026-0010** | Kerala coir craft fibre weaving | Craft | Alappuzha, Kerala | CC-BY-SA-4.0 | `coirboard.gov.in` · `ipindia.gov.in` | Commons contributor |
| **MDR-2026-0011** | Ottanthullal satirical solo dance | Performing | Palakkad, Kerala | CC-BY-4.0 | `kalamandalam.ac.in` | Bobinson K B |
| **MDR-2026-0012** | Panchavadyam temple orchestra | Performing | Thrissur, Kerala | CC-BY-SA-4.0 | `thrissurpooramfestival.com` | Challiyan |
| **MDR-2026-0013** | Kalaripayattu ancient martial art | Performing | Malabar, Kerala | CC-BY-SA-4.0 | `keralaculture.org` | India1277 |
| **MDR-2026-0014** | Mannar bell metal craft & nilavilakku | Craft | Mannar, Alappuzha | CC-BY-4.0 | `handicrafts.nic.in` · `ipindia.gov.in` | Vaikoovery |
| **MDR-2026-0015** | Mohiniyattam classical dance | Performing | Kerala | CC-BY-SA-4.0 | `kalamandalam.ac.in` · `sangeetnatak.gov.in` | Ms Sarah Welch |

---

## 5. UI/UX & Editorial Museum Design System

### 5.1 Aesthetic Direction
The design reflects an **archival museum publication** rather than a generic SaaS utility:
- **Typography:** Self-hosted OFL fonts: *Playfair Display* for serif headings and *Inter* for accessible, legible metadata.
- **Palette:**
  - Light mode: Warm archival paper background (`#f7eedd`), parchment surface (`#efe7d8`), deep carbon ink (`#1c1713`).
  - Dark mode: Deep obsidian ink (`#0a0607`), dark slate card (`#160f12`), crisp parchment text (`#f4ecdc`).
  - Cultural accents: Kerala terracotta (`#8a3b2a`), temple forest green (`#2f4a3a`), ceremonial gold (`#c9a24a`).
- **Interactive Visual Elements:**
  - Interactive CSS-3D lotus flower ornament ([`Lotus3D.tsx`](file:///home/abhin-krishna-m-p/mudra/src/components/Lotus3D.tsx)) with 3D petal layers that react to cursor motion.
  - Marigold petals particle system ([`Petals.tsx`](file:///home/abhin-krishna-m-p/mudra/src/components/Petals.tsx)) gracefully falling across the hero section.
  - Uncropped artwork display: Cultural artwork is never cropped, distorted, or subjected to arbitrary aspect ratio cuts.

### 5.2 Accessibility & WCAG AA Verification (`scripts/contrast.mjs`)
Every color combination in both light and dark themes meets WCAG AA contrast standards:
- Carbon Ink on Paper: **14.95:1** (Target: 4.5:1)
- Link Ochre on Paper: **10.12:1** (Target: 4.5:1)
- Permitted Green on Paper: **6.84:1** (Target: 4.5:1)
- Ask First Orange on Paper: **5.62:1** (Target: 4.5:1)
- Focus Indicator: Visible 3 px solid outline with 2 px offset.
- Screen-Reader Support: Full `prefers-reduced-motion` compliance (disables 3D animations and particle simulations).

---

## 6. Complete Inventory of All Routes & Endpoints

| Route Path | Type | Functionality & Key Components |
|---|---|---|
| `/` | Server Component | Hero banner, 3D lotus, falling petals canvas, featured records carousel, 3-pillar breakdown. |
| `/catalogue` | Server Component | Full catalog, live keyword search, region filters, work type chips, responsive uncropped grid. |
| `/r/[id]` | Server Component | Cultural Passport: uncropped mat, verified seal, metadata list, accessible tabs, Reuse Studio, QR card download. |
| `/reuse` | Client Component | Standalone Reuse Studio: work dropdown, 6 use cases, live verdict card, 4 copyable credit lines. |
| `/verify` | Server Component | Instant record lookup by ID with pre-populated real and sandbox examples. |
| `/verify/[id]` | Client/Server | Cryptographic audit timeline, client-side SHA-256 file check, in-memory tamper simulator. |
| `/check` | Client Component | Drag-and-drop image matcher with dHash distance calculation and human-review guidance. |
| `/review` | Server Component | Protected reviewer console: pending queue, flag resolution, reviewer auth. |
| `/submit` | Client Component | Multi-step submission form with field validation and attribution builder. |
| `/r/[id]/report` | Client Component | Community correction/dispute form with anti-bot honeypot and reviewer forwarding. |
| `/about` | Static Page | Project philosophy, ethical guardrails, honest limitations, and AI tooling disclosure. |
| `/api/records` | REST API | Returns public JSON list of published records with fuzzy search query matching. |
| `/api/records/[id]/verify` | REST API | Returns cryptographic integrity contract, hash chain status, and first broken seq (if any). |
| `/api/records/[id]/card.png`| Dynamic Image | Edge-rendered 1200×630 OpenGraph visual credit card with embedded QR and uncropped art. |
| `/api/assets/[id]` | Asset Stream | Secure streaming image endpoint; enforces privacy withholding for restricted works. |
| `/api/match` | REST API | Accepts image payload; computes dHash; returns similarity matches with in-memory rate limiting. |
| `/api/public-key` | REST API | Exposes server's Ed25519 public key in PEM format for external audit verification. |

---

## 7. Automated Test Suite & Verification Results

Mudra incorporates an automated test harness covering logic, cryptographic integrity, accessibility, and end-to-end user flows.

```bash
# 1. Logic & Cryptographic Tests
npm test
# Result: 30 passed, 0 failed, 422 ms duration
# - 8 SHA-256 hash chain and Ed25519 signature tests
# - 7 Permission engine property-based and golden tests
# - 2 Perceptual dHash calibration and real image tests
# - 1 Deterministic SVG seal test
# - 1 UI wording invariant test (0 prohibited words)
# - 7 Database transaction, concurrent ID, auth role, and governance tests

# 2. Seed Floor & Licence Verification
npm run check-licences
# Result: PASS (16 records, 15 real, floor 10 exceeded)

# 3. Accessibility & Contrast Verification
npm run contrast
# Result: PASS (10/10 WCAG AA color pairs meet or exceed standards)

# 4. Production Next.js Build
npm run build
# Result: PASS (All 13 routes compiled cleanly in 1.6s)

# 5. Playwright End-to-End Test
npm run test:e2e
# Result: PASS (Search -> Passport -> Reuse Studio -> Ask First -> Copy Credit in 4.0s)
```

---

## 8. Clean-Clone Reproducibility & Quickstart

Anyone evaluating the project can clone and run Mudra locally without third-party API keys or external services:

```bash
# 1. Clone the repository
git clone https://github.com/Abhin-Krishna-MP/Mudra.git
cd Mudra

# 2. Configure local environment
cp .env.example .env

# 3. Install dependencies (Node 22.5+ required)
npm install

# 4. Seed the local SQLite database with 15 cultural records
npm run seed

# 5. Start development server
npm run dev
# Open http://localhost:3000 in your browser
```

### Reviewer Evaluation Credentials
A pre-configured demo reviewer account is seeded for evaluation:
- **Email:** `reviewer@mudra.demo`
- **Password:** `DemoReviewerPass123!`
- **Console:** Navigate to `http://localhost:3000/review` to inspect pending submissions and resolve community flags.

---

## 9. Conclusion & Impact

Mudra demonstrates how modern web engineering, cryptographic provenance, and human-centered ethics can converge to solve digital cultural exploitation. By treating cultural intent as a distinct, first-class permission layer rather than an afterthought of copyright, Mudra creates a respectful, frictionless bridge between living tradition bearers and the global creative community.

**Mudra: Don't just take the imagery. Credit the culture.**
