# Mudra — Cultural Passports: Comprehensive Project Report & Technical Specification

> **Event:** ART//CODE 2026 Hackathon  
> **Problem Statement:** PS-03 "Credit the Culture"  
> **Team:** Abhin Krishna M P (Backend, Cryptographic Grants, Database, Machine Layer, Deploy, Performance Engineering) & Alin (Design System, Editorial Museum UI/UX, Accessible Client Flows, Deliverables)  
> **Repository:** `https://github.com/Abhin-Krishna-MP/Mudra`  
> **Live Production URL:** `https://mudra-one-ivory.vercel.app`  
> **License:** MIT Open Source  
> **Report Date:** November 7, 2026 (v2.0 Living Heritage Edition)  

---

## 1. Executive Summary & Problem Formulation

### 1.1 The Problem
In an increasingly digitized world, indigenous artforms, sacred rituals, and centuries-old handicrafts are routinely extracted from their geographic and cultural habitats. When uploaded to digital platforms, stock media archives, and machine-learning training datasets:
1. **Context & Attribution are Severed:** Cultural works are divorced from the artisan lineages, tribal collectives, and tradition bearers who created them.
2. **Copyright is Conflated with Cultural Consent:** Open licenses (such as Creative Commons CC BY or CC0) grant legal permission to reproduce or commercialize an asset. However, legal copyright fails to reflect the living community's cultural boundaries (e.g., sacred ritual depictions on commercial merchandise or training generative AI models).
3. **"Ask First" Was a Dead End:** Registries traditionally stop at telling the user to "Ask first". Reusers are left with no standardized way to ask, stewards have no structured way to answer, and platforms have no way to verify whether consent was granted.

### 1.2 The Mudra Solution
**Mudra** turns *"ask first"* into a recorded, verifiable answer, and publishes it in a form that both people and machines can read.

Mudra establishes **Cultural Passports** for indigenous and traditional works through a structured 3-act core loop:
$$\mathbf{Check} \quad\longrightarrow\quad \mathbf{Ask} \quad\longrightarrow\quad \mathbf{On\ Record}$$

1. **Check:** Reusers look up or upload imagery via perceptual dHash matching. Mudra evaluates two independent layers:
   - **The Cultural Permission Layer:** What the community, artisan guild, or tradition bearers have stated regarding sharing, commercialization, adaptation, and AI training.
   - **The File Licence Layer:** The legal terms governing the specific digital file (CC BY, CC BY-SA, CC0, PDM, CC BY-NC, or All Rights Reserved).
   Mudra synthesizes both layers into a conservative plain-language verdict (e.g., *"Ask first, because the community has not stated whether commercial use is acceptable"*).
2. **Ask (The Consent Engine):** When a use requires permission, reusers submit a 4-field structured request (name, private contact, project scope, duration). Reusers receive a private status link (`/request/[token]`).
3. **On Record (Cryptographic Grants):** Named cultural stewards review requests in their console and issue cryptographically signed grants (Ed25519 over RFC 8785 canonical JSON) with custom conditions and validity windows. Anyone can verify the grant online (`/g/[grantId]`) or completely offline using a standalone CLI verifier (`scripts/verify-grant.mjs`).

For platforms and AI dataset builders, Mudra introduces a **Machine-Readable Layer** featuring W3C TDMRep signals (`/.well-known/tdmrep.json`), schema.org `CreativeWork` JSON-LD, signed manifests (`/api/v1/manifest.json`), and a privacy-preserving hash-only lookup API (`POST /api/v1/lookup`).

In v2.0, Mudra introduces a **Traditional Kerala Padippura Master Navbar**, a full **Progressive Web App (PWA)** offline engine, a **Live Registry Notification Center**, a branded **Cultural Splash Loader**, dual-theme **3D Heritage Stages**, and **Zero-Heat GPU Performance Engineering**.

### 1.3 Core Invariants & Ethical Guardrails
- **The 4 Principles of Credible Consent:**
  1. *Mudra never grants permission on behalf of a community:* Only named, verified stewards linked to that record can decide. Mudra reviewers moderate and verify evidence; they do not consent.
  2. *No steward, no grant:* For records without an active steward (such as compiled public records), requests are transparently marked and logged as *forwarded to the listed contact*, never as *granted*.
  3. *Grants are recorded statements, not legal contracts:* A grant documents what a steward stated at a point in time for a defined scope. Mudra does not make legal claims beyond the reviewer's evidence note.
  4. *Privacy by default:* Requester contact details are kept strictly private and are **never** leaked into public audit diffs, public JSON APIs, or signed grant artifacts.
- **Zero Hallucinated Culture:** AI tools were utilized strictly for programming and scaffolding. Every cultural fact, tradition bearer credit, geographical origin, and license attribution was researched, cited, and checked by human team members from primary academic and governmental sources (UNESCO, Kerala Kalamandalam, Kerala Folklore Academy, and the Geographical Indications Registry of India).
- **Prohibited Words Invariant:** Mudra explicitly rejects extractive legalistic frameworks. Automated regression tests (`tests/wording.test.ts`) forbid the words `owner`, `ownership`, `proof of ownership`, `stolen`, `detected`, `infringement`, and `authentic` throughout the application codebase and user interface. Mudra records stated snapshots and community consensus rather than arbitrating legal claims.
- **Honest Limitations:** Mudra is not an automated copyright filter and does not dispense legal advice. Its audit history is tamper-evident, not tamper-proof; perceptual image matching serves as a pointer for human review, not automated adjudication; TDMRep is a Community Group report that crawlers respect voluntarily; and absence of a record from the catalog implies no lack of cultural significance.

---

## 2. Complete System Architecture

Mudra is architected as an edge-capable, low-latency, zero-dependency full-stack application built on **Next.js 15 (App Router)** and **LibSQL / Turso**, utilizing native Node.js cryptographic primitives, `sharp` image processing, and a service-worker offline engine.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT BROWSER                                       │
│                                                                                        │
│  Next.js Server Components + Progressive Web App (PWA) + Service Worker (Offline Cache)│
│  - Traditional Kerala Padippura Master Artwork Navbar (Light & Dark 2087x436 Artworks) │
│  - Live Registry Notification Bell & Filtered Popover (Real-time DB Events)            │
│  - Cultural Splash Loader with Malayalam Calligraphy (Session-aware boot sequence)     │
│  - Dual-Theme 3D Stage (Kathakali Sunset vs Panchuruli Theyyam Night)                  │
│  - Museum Layout & Theme Toggle    - Interactive Reuse Studio  - Client-side File Hash │
│  - Deterministic SVG Identity Seal - In-Memory Tamper Sim      - Phonetic Fuzzy Search │
│  - 4-Field Request Form            - Private Status Page       - Public Grant Verifier │
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
│  │ Ed25519 Grant Engine  │  │ Next/OG Card Generator  │  │ Scrypt RBAC & Auth Guard │  │
│  │ (RFC 8785 Canonical)  │  │ (1200x630 PNG + QR)     │  │ (HMAC-signed cookies)    │  │
│  └───────────────────────┘  └─────────────────────────┘  └──────────────────────────┘  │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │ W3C TDMRep AI Signals │  │ Hash-Only Lookup API    │  │ Signed Manifest API      │  │
│  │ (tdm-reservation: 1)  │  │ (POST /api/v1/lookup)   │  │ (GET /api/v1/manifest)   │  │
│  └───────────────────────┘  └─────────────────────────┘  └──────────────────────────┘  │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │ Live Notification API │  │ Web App Manifest Route  │  │ Zero-Heat Sprite Engine  │  │
│  │ (/api/notifications)  │  │ (/manifest.webmanifest) │  │ (Hardware Blit & Sleep)  │  │
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
│  - `verifications`: Academic & governmental citations recorded by reviewers            │
│  - `users`: Reviewer & steward credentials hashed with scrypt and salt                 │
│  - `counters`: Monotonically increasing record ID generator (`MDR-2026-NNNN`)          │
│  - `record_stewards`: Mapping linking authorized cultural stewards to specific records │
│  - `permission_requests`: Scoped reuse requests, private tokens, notes, conditions     │
│  - `grants`: Ed25519 digital signatures and signed canonical JSON payloads             │
│                                                                                        │
│  Storage Adapters:                                                                     │
│  - Production Live: Vercel Blob Storage (`@vercel/blob`)                               │
│  - Local Fallback: Local filesystem storage (`public/uploads/` & `public/seed/`)        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Complete Database Schema Specification

The database is defined in `src/lib/db/schema.ts` and runs across both local SQLite and Turso LibSQL at edge:

| Table Name | Primary Key | Foreign Keys | Key Columns & Types | Purpose |
|---|---|---|---|---|
| `counters` | `name TEXT` | None | `value INTEGER` | Atomically generates unique monotonic IDs (`MDR-2026-NNNN`). |
| `records` | `id TEXT` | None | `title`, `work_type`, `region`, `category`, `cultural_context`, `sensitivity`, `licence`, `perm_share`, `perm_commercial`, `perm_adapt`, `perm_ai_training`, `custodian`, `status`, `revision_note`, `author_id` | Core cultural passport entity; stores community permission stances, file licence, and revision notes. |
| `credits` | `id INTEGER AUTO` | `record_id -> records(id)` | `name TEXT`, `role TEXT`, `collective INTEGER`, `position INTEGER` | Attributed tradition bearers, lineages, artist cooperatives, and photographers. |
| `assets` | `id TEXT` | `record_id -> records(id)` | `location TEXT`, `mime TEXT`, `sha256 TEXT`, `dhash TEXT`, `width INTEGER`, `height INTEGER`, `bytes INTEGER` | Digital asset metadata, exact SHA-256 digest, and 64-bit perceptual dHash. |
| `audit_events` | `id INTEGER AUTO` | None | `record_id TEXT`, `seq INTEGER`, `actor_role TEXT`, `actor_name TEXT`, `action TEXT`, `diff_json TEXT`, `prev_hash TEXT`, `hash TEXT`, `signature TEXT`, `key_id TEXT` | Append-only SHA-256 cryptographic audit chain with optional Ed25519 signatures. |
| `flags` | `id TEXT` | `record_id -> records(id)` | `type TEXT`, `text TEXT`, `reporter_contact TEXT`, `status TEXT`, `resolution_note TEXT` | Community reports, correction requests, and dispute tracking. |
| `verifications` | `id INTEGER AUTO` | `record_id -> records(id)` | `source TEXT`, `url TEXT`, `note TEXT`, `reviewer TEXT` | Reviewer citations linking records to academic and governmental registries. |
| `users` | `id INTEGER AUTO` | None | `email TEXT UNIQUE`, `name TEXT`, `role TEXT DEFAULT 'author'`, `region TEXT`, `category TEXT`, `password_hash TEXT` | Authors, reviewers, cultural stewards, and admins with salted scrypt passwords. |
| `record_stewards`| `id INTEGER AUTO` | `record_id -> records(id)`, `user_id -> users(id)` | `UNIQUE(record_id, user_id)` | Authorizes specific cultural stewards to decide requests for specific records. |
| `permission_requests` | `id TEXT` | `record_id -> records(id)` | `use_key TEXT`, `scope_json TEXT`, `requester_name TEXT`, `requester_contact TEXT`, `status TEXT`, `decision_note TEXT`, `conditions_json TEXT`, `credit_text TEXT`, `valid_from TEXT`, `valid_until TEXT`, `token_hash TEXT` | Inbound reuse requests guarded by private token hashes and status lifecycle. |
| `grants` | `id TEXT` | `request_id -> permission_requests(id)`, `record_id -> records(id)` | `payload_json TEXT`, `signature TEXT`, `key_id TEXT`, `created_at TEXT` | Digitally signed Ed25519 grant certificates referencing record audit head. |
| `drafts` | `id TEXT` | `user_id -> users(id)` | `title TEXT`, `region TEXT`, `category TEXT`, `data_json TEXT`, `status TEXT DEFAULT 'pending'`, `revision_note TEXT`, `record_id TEXT` | Author draft storage for pending submissions and revision loops. |
| `steward_applications` | `id INTEGER AUTO` | `user_id -> users(id)` | `id_document_url TEXT`, `region TEXT`, `category TEXT`, `status TEXT DEFAULT 'pending'`, `created_at TEXT`, `reviewed_at TEXT` | KYC identity verification documents for authors applying to become stewards. |

### 2.2 Codebase Directory Map

```
mudra/
├── data/
│   ├── seed/                     # 15 real cultural heritage records + 1 sandbox demo
│   └── sources.md                # Human-verified citations from GI Registry, Kerala Kalamandalam
├── docs/
│   ├── PROJECT_REPORT.md         # Comprehensive technical specification (this document)
│   ├── decisions.md              # Chronological architectural decision log (Nov 3 - Nov 7)
│   ├── permissions-model.md      # Dual-layer permissions & W3C TDMRep specification
│   ├── slides.md                 # 10-slide presentation deck matching full v2.0 architecture
│   ├── video-script.md           # 4:30 demo video walkthrough script (v2.0)
│   └── screenshots/              # Alternating Light/Dark theme production captures (01-09)
├── public/
│   ├── fonts/                    # Self-hosted OFL fonts (Playfair Display, Inter, Noto Serif)
│   ├── icons/                    # PWA heritage icons (16px to 512px, maskable, apple-touch)
│   ├── mudra/                    # Kerala heritage artwork (Padippura navbars, Theyyam, Kathakali)
│   │   ├── navbar-full.png       # Light theme master Padippura artwork (2087x436)
│   │   ├── navbar-full.webp      # Light theme master WebP artwork (2087x436)
│   │   ├── navbar-dark.png       # Dark theme master Padippura artwork (2087x436 crisp)
│   │   ├── navbar-dark.webp      # Dark theme master WebP artwork (2087x436 crisp)
│   │   └── theyyam.webp          # 3D Panchuruli Theyyam figure plate
│   ├── manifest.json             # Static web app manifest fallback
│   ├── sw.js                     # Progressive Web App offline caching Service Worker
│   └── seed/                     # Cultural heritage seed imagery
├── scripts/
│   ├── capture-screenshots.mjs   # Headless browser automated screenshot capture
│   ├── check-licences.ts         # Licence floor compliance validator (15 target records)
│   ├── check-secrets.mjs         # Pre-commit hook preventing accidental secret leaks
│   ├── contrast.mjs              # WCAG AA contrast ratio compliance checker
│   ├── create-admin.ts           # Reviewer & steward account provisioning tool
│   ├── db.ts                     # LibSQL schema migration runner
│   ├── gen-key.ts                # Production Ed25519 keypair generator
│   ├── install-hooks.mjs         # Git pre-commit hook installer
│   ├── seed.ts                   # Seed script populating 15 cultural works
│   ├── tamper-demo.ts            # CLI tamper simulation demonstrator
│   └── verify-grant.mjs          # Standalone offline CLI verifier for signed grants
├── src/
│   ├── app/                      # Next.js 15 App Router (28 routes & endpoints)
│   │   ├── .well-known/tdmrep.json/route.ts  # W3C TDMRep reservation route
│   │   ├── api/v1/lookup/route.ts            # Hash-only batch lookup endpoint
│   │   ├── api/v1/manifest.json/route.ts     # Signed dataset snapshot endpoint
│   │   ├── api/assets/[id]/route.ts          # Image streaming with TDMRep headers
│   │   ├── api/notifications/route.ts        # Live registry notification stream
│   │   ├── api/public-key/route.ts           # Ed25519 public key endpoint
│   │   ├── api/records/[id]/card.png/route.tsx # Edge-rendered 1200x630 visual card
│   │   ├── api/records/[id]/verify/route.ts  # Audit verification API
│   │   ├── api/records/route.ts              # Public catalog search API
│   │   ├── catalogue/page.tsx                # Museum catalog with fuzzy search
│   │   ├── check/page.tsx                    # Perceptual image matcher UI
│   │   ├── developers/page.tsx               # Machine layer & API documentation
│   │   ├── g/[grantId]/page.tsx              # Public signed grant verification page
│   │   ├── manifest.ts                       # Dynamic Next.js PWA Web App Manifest
│   │   ├── r/[id]/page.tsx                   # Cultural Passport & schema.org JSON-LD
│   │   ├── r/[id]/report/page.tsx            # Community dispute and flag submission
│   │   ├── request/[token]/page.tsx          # Requester private status tracking page
│   │   ├── reuse/page.tsx                    # Standalone interactive Reuse Studio
│   │   ├── review/page.tsx                   # Protected reviewer & steward console
│   │   ├── submit/page.tsx                   # Heritage submission form
│   │   ├── verify/[id]/page.tsx              # Cryptographic audit chain & tamper sim
│   │   ├── verify/page.tsx                   # Instant integrity lookup by record ID
│   │   ├── layout.tsx                        # Root layout (PWA, PadippuraNav, Loader)
│   │   └── page.tsx                          # Editorial homepage & TopSectionDark
│   ├── components/               # Accessible UI components
│   │   ├── PadippuraNavbar.tsx   # Master Padippura navbar & hotspot interaction
│   │   ├── NotificationPopover.tsx # Live database notification popover & filtering
│   │   ├── MudraLoader.tsx       # Cultural splash loader with session persistence
│   │   ├── PwaRegister.tsx       # PWA Service Worker register & custom install banner
│   │   ├── TopSectionDark.tsx    # Dual-theme 3D stage coordinator
│   │   ├── HeroMotion.tsx        # High-efficiency zero-heat Theyyam controller
│   │   ├── HeroKerala.tsx        # Optimized Kathakali light-theme controller
│   │   ├── VerdictCard.tsx       # 2-layer permission verdict visualizer
│   │   └── RecordTile.tsx        # Responsive uncropped catalog tile
│   └── lib/                      # Core business logic and cryptographic primitives
│       ├── auth.ts               # Scrypt hashing and RBAC permission checks
│       ├── chain.ts              # SHA-256 RFC 8785 canonical hash chain engine
│       ├── credit.ts             # 4 credit formatters (Plain, Academic, BibTeX, HTML)
│       ├── db/                   # LibSQL / SQLite database client and schema
│       ├── grant.ts              # Ed25519 canonical Grant Engine
│       ├── imagehash.ts          # 64-bit gradient difference hashing (dHash)
│       ├── permissions.ts        # Pure 2-layer conservative resolution engine
│       ├── repo-grants.ts        # Repository for permission requests, stewards & grants
│       ├── repo.ts               # Repository for records, credits, assets & audit events
│       ├── seal.ts               # Procedural deterministic SVG mandala seal
│       ├── search.ts             # Malayalam transliteration alias fuzzy search
│       ├── session.ts            # HMAC-SHA256 cookie session manager
│       ├── signing.ts            # Ed25519 key manager and automatic in-memory fallback
│       └── wording.ts            # Prohibited extractive wording dictionary
└── tests/                        # Automated test suites (34 tests passing)
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
Every creation, review action, steward grant, flag submission, and resolution commits an audit event inside the same database transaction as the underlying record change.

#### 1. Mathematical Structure of the Hash Chain
Each record maintains an ordered sequence of events $e_1, e_2, \dots, e_n$ where sequence number $\text{seq} = k$.
The cryptographic payload $P_k$ is serialized into canonical JSON using RFC 8785 (`canonicalize`):
$$P_k = \text{canonicalize}\left(\{ \text{action}, \text{actor\_name}, \text{actor\_role}, \text{created\_at}, \text{diff}, \text{record\_id}, \text{seq} \}\right)$$
The event hash $H_k$ is computed as:
$$H_k = \text{SHA-256}(\text{prev\_hash} \parallel P_k)$$
For the genesis event ($k=1$), $\text{prev\_hash} = \text{"0000000000000000000000000000000000000000000000000000000000000000"}$.
For any subsequent event ($k > 1$), $\text{prev\_hash} = H_{k-1}$.

#### 2. Optional Ed25519 Asymmetric Digital Signatures (`src/lib/signing.ts`)
Events and grants are signed using Ed25519:
$$S_k = \text{Ed25519Sign}(\text{PrivateKey}, H_k)$$
The verification engine supports **mixed chains**: older unsigned events verify by hash continuity, while signed events verify both hash continuity and cryptographic signature against the public key exposed at `/api/public-key`.

#### 3. Guaranteed Key Provisioning & Fallback
If `SIGNING_PRIVATE_KEY` is not provided in host environment variables, Mudra's key provider automatically initializes and caches an in-memory fallback Ed25519 keypair. This ensures that permission grants and audit events are never blocked or left unsigned in development, preview, or judging environments.

#### 4. Interactive In-Memory Tamper Simulation (`src/app/verify/[id]/TamperSimulation.tsx`)
On `/verify/MDR-DEMO-0001`, users can trigger a live simulation that mutates an event diff in browser memory. The verification engine immediately flags the exact sequence number where the cryptographic hash breaks:
```
Event #1 (create)       ● Hash verified: 4a8f...
Event #2 (verification) ○ TAMPERED! Expected 9d1c... but payload hashed to 3f0a...
Event #3 (flag_resolved)○ Chain broken (invalid prev_hash link)
```

#### 5. Browser-Side File Verification (`src/app/verify/[id]/VerifyFile.tsx`)
Users can drop a local file onto the verify page. The browser computes `crypto.subtle.digest('SHA-256', fileBuffer)` locally without uploading the file, comparing the hex digest against the record's registered asset hash.

---

### 3.3 The Ask → Grant Consent Workflow (`src/lib/grant.ts`, `src/lib/repo-grants.ts`)
Transforms "Ask first" from a passive message into an actionable, verifiable consent lifecycle.

#### 1. Request Submission (`/r/[id]`, `/reuse`)
When a verdict evaluates to `ask_first`, an interactive form allows reusers to submit:
- Requester Name
- Private Contact (email or phone)
- What you will make (specific product/medium scope)
- Where and how long (distribution geography and time window)
- Anti-bot honeypot (`website`) to discard automated submissions silently
- In-memory rate limiting (max 10 open requests per record)

#### 2. Private Requester Token Tracking (`/request/[token]`)
Upon submission, Mudra generates a high-entropy 64-character token and stores its SHA-256 hash in `permission_requests.token_hash`. The user is redirected to a private status tracking link:
- Status displays in real-time: `open` $\rightarrow$ `granted` $\rightarrow$ `declined` $\rightarrow$ `forwarded` $\rightarrow$ `revoked` $\rightarrow$ `expired`.
- Displays reviewer notes, custom conditions, and required credit lines.
- When granted, provides a direct link to the public signed grant (`/g/[grantId]`).

#### 3. Steward Governance & Console (`/review`)
Authorized reviewers and stewards manage requests in the **Permission Requests** section:
- Review request scope alongside record context.
- Set custom conditions (one per line).
- Define mandatory credit text.
- Set `valid_from` and optional `valid_until` dates.
- Issue signed grants or decline requests with explanatory notes.
- Revoke previously issued grants if terms are breached.
- Link verified stewards to any record via the **Assign steward** dropdown.

#### 4. The Cryptographic Grant Artifact
The grant payload is constructed by a single deterministic function (`buildGrantPayload`) used identically for signing and verification:
```typescript
interface GrantPayload {
  v: 1;
  grant_id: string;
  record_id: string;
  record_audit_head: string; // Hash of record audit chain at moment of grant
  use_key: string;
  scope: Record<string, string>;
  conditions: string[];
  credit_text: string;
  valid_from: string;
  valid_until: string | null;
  steward_display: string;
  steward_verification: string;
  issued_at: string;
  key_id: string;
}
```
The payload is canonicalized using RFC 8785, SHA-256 hashed, and signed with Ed25519.

Sample signed grant artifact (`grant.json`):
```json
{
  "v": 1,
  "grant_id": "a5ce1e3c-e627-4eae-96ea-81a3b91a1417",
  "record_id": "MDR-2026-0001",
  "record_audit_head": "a3b91c84f228d712e09b1f...",
  "use_key": "print_merch",
  "scope": {
    "intended_product": "Exhibition tote bags and cultural prints",
    "distribution_duration": "12 months, South India"
  },
  "conditions": [
    "Include credit line visibly on all prints and product tags.",
    "Do not alter or caricature the sacred Kathakali facial makeup.",
    "Proceeds must not be used for derogatory or defamatory campaigns."
  ],
  "credit_text": "Cultural heritage: Kathakali classical dance-drama. Recorded steward: Kerala Kalamandalam. Verified via Mudra.",
  "valid_from": "2026-11-06",
  "valid_until": "2027-11-06",
  "steward_display": "Kerala Kalamandalam Deemed University",
  "steward_verification": "Accredited State Cultural Institution (Government of Kerala)",
  "issued_at": "2026-11-06T05:12:00.000Z",
  "key_id": "k1"
}
```

#### 5. Public Verification (`/g/[grantId]`) & Offline CLI (`scripts/verify-grant.mjs`)
- **Online:** `/g/[grantId]` verifies the cryptographic signature live, confirms the validity window, links to the record's audit head, and displays conditions.
- **Offline CLI:** Platforms and print shops can verify grants completely offline with zero network connectivity:
  ```bash
  node scripts/verify-grant.mjs grant.json public-key.pem
  ```

---

### 3.4 Machine-Readable Layer for Platforms & Responsible AI
Equips Mudra with standardized protocols for automated ingestion by design tools, marketplaces, and AI dataset builders.

#### 1. schema.org JSON-LD Structured Data
Every passport page (`/r/[id]`) embeds a `<script type="application/ld+json">` document compliant with schema.org `CreativeWork` and `ImageObject`:
- `@id`: Permanent canonical record URL (`https://mudra-one-ivory.vercel.app/r/MDR-2026-0001`)
- `name`: Cultural work title
- `description`: Curated cultural context
- `creator`: Array of attributed tradition bearers and artisan collectives (`Person` / `Organization`)
- `creditText`: Formatted plain-text attribution string
- `license`: Canonical Creative Commons URL
- `acquireLicensePage`: Anchor linking directly to the request permission flow (`#request-permission`)
- `usageInfo`: Anchor linking to the interactive Reuse Studio

#### 2. W3C TDMRep AI-Training Signals
Mudra implements the W3C Text and Data Mining Reservation Protocol (TDMRep) Community Group specification:
- **`/.well-known/tdmrep.json`:** Serves a dynamic JSON document listing `tdm-reservation: 1` for all published records where community consent for AI training has not been explicitly granted.
- **HTTP Asset Headers:** Every image served at `/api/assets/[id]` emits:
  ```http
  tdm-reservation: 1
  tdm-policy: /developers#tdm-policy
  ```

#### 3. Privacy-Preserving Hash-Only Lookup API (`POST /api/v1/lookup`)
Platforms and dataset curators can check cultural registration and stated AI positions in batches of up to 50 items **without uploading user imagery**.

#### 4. Signed Dataset Manifest (`GET /api/v1/manifest.json`)
Dataset auditors can pin a signed cryptographic snapshot of all registered works with an Ed25519 digital signature.

---

### 3.5 Perceptual Image Matching via dHash (`src/lib/imagehash.ts`)
Mudra implements difference hashing (dHash) to match visually similar images regardless of recompression, slight cropping, or dimension scaling.
- Evaluated on real Kerala cultural seed photographs: Hamming distance $\le 6 \implies$ "Strong visual match"; $\le 12 \implies$ "Possible visual match, for human review"; $\ge 28 \implies$ "No structural similarity".
- Sacred and restricted cultural assets are indexed in the matching table, but their binary image is withheld from public endpoints (`/api/assets/[id]`).

---

### 3.6 Traditional Kerala Padippura Master Artwork Navbar (`src/components/PadippuraNavbar.tsx`)

In v2.0, the navigation bar was re-architected into a **Traditional Kerala Padippura** (traditional entrance gateway with gopuram roof):
- **Architectural Motif:** High-fidelity master artwork featuring an intricately carved pitched terracotta tile roof, an ornamental brass pediment with floral scrollwork, a traditional backwater kettuvallam boat, and an oil nilavilakku lamp hanging on brass links.
- **Dual-Theme High-Resolution Canvas:**
  - **Light Theme Canvas:** `public/mudra/navbar-full.png` and `.webp` ($2087 \times 436\text{px}$) featuring warm ivory paper fill and gold trim.
  - **Dark Theme Canvas:** `public/mudra/navbar-dark.png` and `.webp` ($2087 \times 436\text{px}$) featuring deep Kerala emerald green (`#011a13`) with polished gold trim.
- **Subpixel High-Resolution Typography Synthesis:**
  - Diagnosed that rasterizing from a 1024px source caused soft blurry text on 2× Retina screens.
  - Inpainted the blurry text regions with the seamless dark emerald background.
  - Extracted subpixel glyph masks at full $2087 \times 436$ resolution matching *Playfair Display* and *Inter*.
  - Composited razor-sharp ivory cream (`#fff8ee`) for brand and navigation links, and warm temple gold (`#f2ce73`) for `"CREDIT THE CULTURE"`, achieving complete legibility across all screen densities.
- **Pixel-Perfect Hotspot Geometry (`src/app/home-premium-plus.css`):**
  - Uses CSS percentage-based absolute positioning mapped to the exact artwork bounding boxes ($2087 \times 436$ aspect ratio):
    - Brand hotspot (`.spot-brand`): $5.56\% \dots 23\%$, height $20.64\%$
    - Navigation pills (`.spot-home`, `.spot-catalogue`, `.spot-reuse`, `.spot-about`): centered at $y = 55.96\%$, rendered as $62\text{px}$ pills with active emerald gradient, gold diamond end-caps, and italicized serif labels.
    - Action buttons (`.spot-search`, `.spot-theme`, `.spot-bell`, `.spot-avatar`): circular $72\text{px}$ diameter hotspot buttons with soft gold hover halos.
- **Mobile Responsive Drawer (`.padippura-mobile-bar`):**
  - Switches cleanly to an ergonomic mobile header bar below $991\text{px}$ with a touch-friendly slide-down menu sheet and zero layout collisions.

---

### 3.7 Full Progressive Web App (PWA) Implementation

Mudra is fully installable as a standalone Web App across Android, iOS, Windows, macOS, and Linux:
- **Dynamic Web App Manifest (`src/app/manifest.ts` & `public/manifest.json`):**
  - `name`: "Mudra — Kerala Living Heritage Registry"
  - `short_name`: "Mudra"
  - `display`: `standalone`
  - `start_url`: `/`
  - `theme_color`: `#0c3d33` (Light) / `#0a0607` (Dark)
  - `background_color`: `#0a0607`
  - Includes a comprehensive icon suite (`public/icons/`):
    - `favicon-16.png`, `favicon-32.png`
    - `icon-192.png`, `icon-512.png`
    - `icon-maskable-192.png`, `icon-maskable-512.png` (Android adaptive icon compliance)
    - `apple-touch-icon.png` ($180 \times 180$)
- **Offline Caching Service Worker (`public/sw.js`):**
  - Implements a **cache-first strategy** for static assets, Google/OFL webfonts, and heavy WebP illustrations (`/mudra/*`), allowing instant offline page loads.
  - Implements a **network-first strategy with offline cache fallback** for HTML document routes and dynamic catalog records.
  - Automatically clears stale caches on version activation.
- **In-App Heritage Install Prompt Banner (`src/components/PwaRegister.tsx`):**
  - Intercepts the browser's `beforeinstallprompt` event.
  - Presents an elegant, non-intrusive cultural banner with the golden lotus emblem and an "Install App" button.
  - Honors dismissal preferences via `localStorage.getItem('mudra_pwa_dismissed')`.

---

### 3.8 Live Registry Notification System (`src/app/api/notifications/route.ts`)

Mudra connects reusers and stewards with real-time database activity:
- **Live Database Aggregator:**
  - Queries `audit_events`, `grants`, and `records` to construct an immutable feed of recent cultural events:
    - `approved`: New records published to the cultural registry.
    - `verified`: Academic and governmental citations validated by reviewers.
    - `granted`: Ed25519 permission grants signed by cultural stewards.
    - `created`: Inbound submissions received for community review.
- **Interactive Notification Popover (`src/components/NotificationPopover.tsx`):**
  - Connected directly to the bell hotspot in the Padippura navbar.
  - Unread count badge with pulse animation when new events arrive.
  - Interactive category filtering tabs ("All", "Approvals", "Grants").
  - Relative timestamp formatting (e.g., "12m ago", "2h ago").
  - "Mark all as read" capability persisted to `localStorage`.
  - Accessible keyboard navigation and click-outside dismissal.

---

### 3.9 Cultural Splash Loader (`src/components/MudraLoader.tsx`)

Provides an atmospheric, immersive brand intro on first visit:
- **Visual Composition:** Radial aura with flickering oil lamp light, an illuminated golden lotus mark, floating ambient motes, and native Malayalam script typography (`മുദ്ര`).
- **Dynamic Progress Bar:** Eased progress percentage counter ($0\% \dots 100\%$) tracking document readystate.
- **Session Intelligence:** Stores `sessionStorage.setItem('mudraLoaderSeen', '1')` upon completion so that subsequent internal navigations load instantaneously with zero splash delay.

---

### 3.10 Dual-Theme 3D Stage & Parallax Architecture (`TopSectionDark.tsx`)

Seamlessly bridges traditional Kerala daytime aesthetics with midnight ritual performances:
- **Light Theme Stage (`HeroKerala.tsx`):**
  - Daylit backwaters sunset plate with Kerala lagoons and coconut groves.
  - Layered Kathakali cutout figure with animated eyes tracking pointer movement and performing traditional glances when idle.
  - Floating Kasavu silk cloth with dynamic lighting and oil lamp reflections.
- **Dark Theme Stage (`HeroMotion.tsx`):**
  - Night temple courtyard with traditional wooden architecture and flickering oil lamps inside temple windows (`.mx-win`).
  - Layered 3D Panchuruli Theyyam figure with interactive hardware-accelerated torchlight tracking the user's cursor.
  - Drifting atmospheric mist and floating glowing ember particles.
- **Full-Screen Stage Curtain (`.stage-curtain`):**
  - Deep maroon velvet curtains that part smoothly on initial load, revealing glowing golden Malayalam typography before fading gracefully.
- **Zero Layout Shift:** Content copy, typography, and CTA buttons are identical in DOM footprint across both themes, enabling instantaneous theme toggling with zero content jump.

---

### 3.11 Zero-Heat GPU Performance Engineering

During v2.0 benchmarking, a thermal anomaly was diagnosed where background tabs pegged the GPU and caused laptop fans to spin. Through profiling with Chrome GPU traces and Playwright telemetry, Mudra engineered a complete performance solution:
1. **The Canvas Radial Gradient Bottleneck:**
   - In `HeroMotion.tsx`, the ember particle loop was executing `g.createRadialGradient(...)` 70 times inside the inner loop **every single frame** at 60–120 FPS.
   - On a high-DPI display, this allocated **over 1,000+ radial gradient objects and 3,000+ color stops per second**, forcing the browser's 2D canvas GPU backend (Skia) into constant shader pipeline reconstruction.
2. **Offscreen Sprite Pre-rendering Solution:**
   - Pre-rendered a single $64 \times 64$ ember sprite offscreen once, featuring the exact same three-stop radial gradient (`rgba(255,214,140,1)` $\rightarrow$ `rgba(255,140,50,0.5)` $\rightarrow$ `rgba(255,100,20,0)`).
   - In the particle loop, particles are now drawn using hardware-accelerated `g.drawImage(spriteCanvas, ...)` texture blits with `g.globalAlpha = a`.
   - **Result:** Radial gradient creations dropped from **3,278 in 3 seconds down to 1** (**99.97% reduction**), while visual glow, color falloff, and particle twinkle remained 100% pixel-identical.
3. **Tab Background & Visibility Sleep Lifecycle:**
   - Added `visibilitychange` event listeners to both `HeroMotion.tsx` and `HeroKerala.tsx`.
   - When the user switches to another browser tab or minimizes the window (`document.hidden = true`), the animation frame loops **completely sleep**, consuming **0% CPU and 0% GPU**. Loops resume automatically upon tab return.
   - Combined with `IntersectionObserver` to halt animation loops whenever the hero is scrolled out of view.
4. **DOM Mutation Deduping:**
   - Cached previous string outputs for `--mx`, `--my`, `--msy`, `--tpx`, `--tpy`, and `--torch-op`.
   - Prevented continuous re-evaluation of CSS masks and gradients on `.mx-torch-glow` during idle states.
5. **GPU Compositor Layer Promotion:**
   - Promoted `.mx-mist` and `.mx-embers` with `transform: translateZ(0)` and `will-change: transform`, eliminating continuous CPU Gaussian blur re-rasterization.

### 3.12 Secure Author Submissions & Role-Based Access Control
1. **Author Sign-Up & Default Role:**
   - The public registration endpoint (`/login?mode=signup`) sets new account roles to `author` by default.
   - Authors register their target cultural domain (`category`) and geographical location (`region`).
2. **Two-Tier Submission Interception:**
   - **Edge Interception:** Next.js Edge Middleware (`src/middleware.ts`) intercepts any direct access to `/submit`. It decrypts and verifies the HMAC-signed session cookie. Requests without an active session or with non-author roles are immediately redirected to `/login?msg=Unauthorized`.
   - **Action-Level Database Verification:** When `createRecordAction` executes, it re-queries `users.role` directly from the database via `src/lib/authz.ts`. Demoted or suspended authors lose submission access immediately without relying on client-side state.

### 3.13 Specific Steward Routing via Cultural Tag Matching
1. **Required Tag Attributes:**
   - Author submissions require explicit specification of **Region** (e.g. `Kannur`, `Thrissur`, `Palakkad`, `Alappuzha`) and **Category** (e.g. `ritual`, `performing`, `handloom`, `craft`, `visual`).
2. **Database-Filtered Steward Dashboard (`/review`):**
   - Stewards do not pull an unpartitioned backlog of submissions.
   - When a user with the `steward` role loads `/review`, the database executes an exact-match query:
     ```sql
     SELECT id, status, title, region, category, revision_note
     FROM records
     WHERE status = 'pending'
       AND region = ?
       AND (category = ? OR work_type = ?)
     ORDER BY created_at DESC;
     ```
   - Only drafts matching the steward's assigned jurisdiction appear in their queue, preserving cultural context and regional expertise.

### 3.14 Steward KYC Verification & Reviewer Governance Console
1. **Identity Document Upload (`/apply-steward`):**
   - Authors with demonstrated community standing can upload proof of identity (PNG, JPEG, WebP, or PDF) to apply for steward elevation.
2. **Private Storage Architecture (`src/lib/storage.ts`):**
   - KYC documents are **strictly forbidden** from being placed in public directories (`public/uploads`).
   - Supported storage backends:
     - **Supabase Storage:** Authenticated bucket upload via service role key (`supabase://private-kyc/...`).
     - **Vercel Blob Storage:** Cloud-persisted private blob storage via `BLOB_READ_WRITE_TOKEN`.
     - **Serverless / Local Storage:** Automatically switches to `os.tmpdir()` (`/tmp/mudra_secure_kyc`) in read-only serverless runtimes (`/var/task`), preventing `ENOENT` filesystem crashes, with in-memory data URI fallback.
3. **Reviewer Console Verification Area (`/review`):**
   - Reviewers and stewards directly inspect pending KYC submissions in the dedicated **Steward Verification Requests** section (`src/app/review/StewardApplicationsSection.tsx`) alongside a center-aligned real-time metrics box.
   - Authorized users view private documents via authenticated route `/api/admin/kyc-document/[id]`, and can approve or reject applicants with instant database role elevation and tag jurisdiction assignment (`region` + `category`).
4. **Admin Oversight (`/admin`):**
   - System administrators retain full governance visibility and management capabilities on the administrative route.

### 3.15 Active AI Shield (W3C TDMRep Protocol)
1. **Global Manifest (`/.well-known/tdmrep.json`):**
   - Static manifest served at the standardized W3C path asserting `tdm-reservation: 1` as the platform-wide legal declaration under EU Directive 2019/790 Article 4.
2. **Edge Header Injection on Image Uploads (`src/middleware.ts`):**
   - The Edge Middleware intercepts every HTTP request matching the image upload path (`/uploads/`).
   - Before serving the image bytes, the middleware attaches the HTTP response header:
     ```http
     tdm-reservation: 1
     ```
   - Any compliant crawler, AI training bot, or scraper attempting to harvest registry imagery receives the legally binding machine-readable opt-out signal.

### 3.16 Asynchronous Feedback & Revision Loop
1. **Replacing Synchronous Chat:**
   - Rather than requiring real-time presence, stewards click "Request Revision" directly on the review screen and enter detailed instructions (e.g. *"Please clarify the specific village temple lineage and provide academic reference"*).
2. **Status Transition & Persistence:**
   - The draft's status is set to `needs_revision`, and the notes are stored in `records.revision_note`.
3. **Author Dashboard (`/author/dashboard`):**
   - Authors log in to a dedicated dashboard displaying their submitted drafts.
   - Items with `needs_revision` are surfaced with a distinct alert banner displaying the steward's feedback.
4. **Edit & Resubmission Flow:**
   - Clicking "Edit Draft" reopens the pre-filled submission form at `/submit?edit=[id]`.
   - Modifying and submitting the draft updates the record, clears the revision note, and resets the status back to `pending`, returning it to the steward's review queue.

### 3.17 Serverless Artwork Submission Resilience & Next.js 10MB Body Limit
1. **10MB Server Action Body Limit:**
   - Next.js 15 App Router enforces a default 1MB request body limit on server actions. High-resolution mobile phone and DSLR camera artwork photos routinely range from 2MB to 8MB.
   - Configured `experimental: { serverActions: { bodySizeLimit: '10mb' } }` in `next.config.mjs` to eliminate HTTP 413 / 500 body-parser rejections before action dispatching.
2. **Serverless Storage Fallback:**
   - In cloud serverless runtimes (such as Vercel AWS Lambda `/var/task` read-only environments), local disk writes fail with `EROFS` if an external Blob storage token is not configured.
   - `storeUpload` and `readLocalAsset` in `src/lib/storage.ts` gracefully fall back to base64 `data:` URIs and `/tmp` storage, ensuring author submissions never crash due to storage infrastructure limitations.
3. **Top-Level Error Isolation:**
   - Wrapped `createRecordAction` in structured `try...catch` handling with `isRedirectError` detection.
   - Prevents unhandled exceptions from triggering production `error.tsx` 500 boundaries while allowing Next.js redirect exceptions (`/submit?done=...`) to execute normally.

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

### 5.1 Aesthetic Direction & Visual Ergonomics
The design reflects an **archival museum publication** rather than a generic utility:
- **Typography:** Self-hosted OFL fonts: *Playfair Display* for serif headings, *Inter* for metadata, and *Noto Serif Malayalam* for native Malayalam script tokens (മുദ്ര).
- **Color Palette:**
  - Light mode: Warm archival paper background (`#f7eedd`), parchment surface (`#efe7d8`), deep carbon ink (`#1c1713`).
  - Dark mode: Deep obsidian ink (`#0a0607`), dark slate card (`#160f12`), crisp parchment text (`#f4ecdc`).
  - Cultural accents: Kerala terracotta (`#8a3b2a`), temple forest green (`#2f4a3a`), ceremonial gold (`#c9a24a`).
- **Mobile Overlap Resolution:**
  - Resolved a mobile layout collision between the floating hero CTA buttons and the quick navigation menu (`.quick`) by adjusting top margins from `-56px` to `+18px` in mobile breakpoints, providing comfortable vertical breathing room on touch screens.
- **Uncropped Artwork Display:** Cultural artwork is never cropped, distorted, or subjected to arbitrary aspect ratio cuts.

### 5.2 Accessibility & WCAG AA Verification (`scripts/contrast.mjs`)
Every color combination in both light and dark themes meets or exceeds WCAG AA contrast standards:
- Carbon Ink on Paper: **14.95:1** (Target: 4.5:1)
- Link Ochre on Paper: **10.12:1** (Target: 4.5:1)
- Permitted Green on Paper: **7.00:1** (Target: 4.5:1)
- Ask First Orange on Paper: **8.15:1** (Target: 4.5:1)
- Focus Indicator: Visible 3px solid outline with 2px offset.
- Full screen-reader and `prefers-reduced-motion` compliance.

---

## 6. Complete Inventory of All Routes & Endpoints (33 Routes)

| Route Path | Type | Functionality & Key Components |
|---|---|---|
| `/` | Server Component | Editorial hero, TopSectionDark, 3D lotus ornament, featured records carousel, 3-pillar breakdown. |
| `/catalogue` | Server Component | Full catalog, live keyword search, region filters, work type chips, responsive uncropped grid. |
| `/r/[id]` | Server Component | Cultural Passport: uncropped mat, verified seal, metadata list, accessible tabs, Reuse Studio, QR card download, schema.org JSON-LD, request permission disclosure. |
| `/reuse` | Client Component | Standalone Reuse Studio: work dropdown, 6 use cases, live verdict card, 4 copyable credit lines, request permission trigger. |
| `/request/[token]` | Server Component | Requester's private status page: tracks open, granted, declined, forwarded, or revoked states, custom conditions, and signed grant link. |
| `/g/[grantId]` | Server Component | Public grant verification page: live cryptographic verification, steward label, audit head link, conditions, and downloadable JSON payload. |
| `/developers` | Static Page | Platform integration guide: curl examples for lookup, manifest, and TDMRep; offline verification script; honest limits disclosure. |
| `/check` | Client Component | Drag-and-drop image matcher with dHash distance calculation and human-review guidance. |
| `/verify` | Server Component | Instant record lookup by ID with pre-populated real and sandbox examples. |
| `/verify/[id]` | Client/Server | Cryptographic audit timeline, client-side SHA-256 file check, in-memory tamper simulator. |
| `/review` | Server Component | Protected reviewer & steward console: tag-matched steward queue (`region` + `category`), revision requests, flag resolution, grant issuance. |
| `/submit` | Client Component | Intercepted author submission form with region and category dropdowns, pre-fill editing, and attribution builder. |
| `/login` | Client/Server | Unified authentication with dual tabs: Sign In and Author Sign Up (with region and domain specialization). |
| `/author/dashboard` | Server Component | Author console: lists all submitted drafts, flags `needs_revision` items with steward feedback, and provides 1-click edit & resubmit. |
| `/apply-steward` | Client/Server | Steward KYC identity document upload form, verification guidelines, and pending status tracker. |
| `/admin` | Server Component | Hidden admin governance console: inspects pending steward applications, views identity proofs, and elevates author roles to steward. |
| `/api/admin/kyc-document/[id]` | Protected Asset | Secure streaming of KYC identity documents; restricted strictly to users with the admin role; private caching. |
| `/r/[id]/report` | Client Component | Community correction/dispute form with anti-bot honeypot and reviewer forwarding. |
| `/about` | Static Page | Project philosophy, ethical guardrails, honest limitations, and AI tooling disclosure. |
| `/.well-known/tdmrep.json` | JSON Route | W3C TDMRep specification endpoint publishing `tdm-reservation: 1` as global machine-readable AI opt-out. |
| `/api/v1/lookup` | REST API | Privacy-preserving batch hash lookup API (SHA-256 + dHash) returning commercial and AI stances without image uploads. |
| `/api/v1/manifest.json` | JSON Route | Signed dataset snapshot of all registered works, hashes, and AI stances with Ed25519 signature. |
| `/api/notifications` | REST API | Live registry notification endpoint streaming recent audit events, approvals, and steward grants with unread counts. |
| `/api/records` | REST API | Returns public JSON list of published records with fuzzy search query matching. |
| `/api/records/[id]/verify` | REST API | Returns cryptographic integrity contract, hash chain status, and first broken seq (if any). |
| `/api/records/[id]/card.png`| Dynamic Image | Edge-rendered 1200×630 OpenGraph visual credit card with embedded QR and uncropped art. |
| `/api/assets/[id]` | Asset Stream | Secure streaming image endpoint; enforces privacy withholding for restricted works; emits `tdm-reservation` headers. |
| `/api/match` | REST API | Accepts image payload; computes dHash; returns similarity matches with in-memory rate limiting. |
| `/api/public-key` | REST API | Exposes server's Ed25519 public key in PEM format for external audit verification. |
| `/manifest.webmanifest` | Next.js Manifest | Dynamic Progressive Web App manifest route generating standalone app config and heritage icons. |
| `/manifest.json` | Static Route | Static fallback Web App Manifest for legacy PWA crawlers. |
| `/sw.js` | Service Worker | Progressive Web App offline caching engine supporting cache-first static assets and network-first navigation. |
| `/_not-found` | Static Page | Custom 404 page styled with warm parchment palette. |

---

## 7. Automated Test Suite & Verification Results

Mudra incorporates an automated test harness covering logic, cryptographic integrity, accessibility, and end-to-end user flows.

```bash
# 1. Logic & Cryptographic Tests
npm test
# Result: 43 passed, 0 failed, 520 ms duration
# - 8 SHA-256 hash chain and Ed25519 signature tests
# - 4 Cryptographic grant tests (signing, 1-byte alteration failure, expiration, SQLite request-grant-revoke loop)
# - 7 Permission engine property-based and golden tests
# - 2 Perceptual dHash calibration and real image tests
# - 1 Deterministic SVG seal test
# - 1 UI wording invariant test (0 prohibited words across entire codebase)
# - 7 Database transaction, concurrent ID, auth role, and governance tests
# - 6 Author role, tag-matching steward routing, KYC private storage, serverless tmpdir, TDMRep header, and revision loop tests
# - 7 Credit line formatting, alias search, and login redirect security tests

# 2. Seed Floor & Licence Verification
npm run check-licences
# Result: PASS (16 records, 15 real, floor 10 exceeded)

# 3. Accessibility & Contrast Verification
npm run contrast
# Result: PASS (10/10 WCAG AA color pairs meet or exceed standards)

# 4. TypeScript Strict Compilation
npm run typecheck
# Result: PASS (0 type errors across entire codebase)

# 5. Playwright End-to-End User Journeys
npm run test:e2e
# Result: PASS (Complete search -> passport -> Reuse Studio commercial request -> copy credit line flow)
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
- **Console:** Navigate to `http://localhost:3000/review` to inspect pending submissions, manage permission requests, and resolve community reports.

### Standalone Offline Grant Verification
To verify any permission grant artifact offline without database or network access:
```bash
node scripts/verify-grant.mjs path/to/grant.json path/to/public-key.pem
```

---

## 9. Conclusion & Impact

Mudra demonstrates how modern web engineering, cryptographic provenance, and human-centered ethics can converge to solve digital cultural exploitation. By treating cultural intent as a distinct, first-class permission layer rather than an afterthought of copyright, and by turning *"ask first"* into a recorded, verifiable answer, Mudra creates a respectful, frictionless bridge between living tradition bearers and the global creative community.

**Mudra: Don't just take the imagery. Credit the culture.**
