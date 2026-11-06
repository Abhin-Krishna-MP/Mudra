# Mudra — Cultural Passports: Comprehensive Project Report & Technical Specification

> **Event:** ART//CODE 2026 Hackathon  
> **Problem Statement:** PS-03 "Credit the Culture"  
> **Team:** Abhin Krishna M P (Backend, Cryptographic Grants, Database, Machine Layer, Deploy) & Alin (Design System, Editorial Museum UI/UX, Accessible Client Flows, Deliverables)  
> **Repository:** `https://github.com/Abhin-Krishna-MP/Mudra`  
> **Live Production URL:** `https://mudra-one-ivory.vercel.app`  
> **License:** MIT Open Source  
> **Report Date:** November 6, 2026 (v1.1 Upgrade Edition)  

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

Mudra is architected as an edge-capable, low-latency, zero-dependency full-stack application built on **Next.js 15 (App Router)** and **LibSQL / Turso**, utilizing native Node.js cryptographic primitives and `sharp` image processing.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT BROWSER                                       │
│                                                                                        │
│  Next.js Server Components (103 kB First Load JS) + Accessible Client Islands          │
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
| `records` | `id TEXT` | None | `title`, `work_type`, `region`, `cultural_context`, `sensitivity`, `licence`, `perm_share`, `perm_commercial`, `perm_adapt`, `perm_ai_training`, `custodian`, `status` | Core cultural passport entity; stores community permission stances and file licence. |
| `credits` | `id INTEGER AUTO` | `record_id -> records(id)` | `name TEXT`, `role TEXT`, `collective INTEGER`, `position INTEGER` | Attributed tradition bearers, lineages, artist cooperatives, and photographers. |
| `assets` | `id TEXT` | `record_id -> records(id)` | `location TEXT`, `mime TEXT`, `sha256 TEXT`, `dhash TEXT`, `width INTEGER`, `height INTEGER`, `bytes INTEGER` | Digital asset metadata, exact SHA-256 digest, and 64-bit perceptual dHash. |
| `audit_events` | `id INTEGER AUTO` | None | `record_id TEXT`, `seq INTEGER`, `actor_role TEXT`, `actor_name TEXT`, `action TEXT`, `diff_json TEXT`, `prev_hash TEXT`, `hash TEXT`, `signature TEXT`, `key_id TEXT` | Append-only SHA-256 cryptographic audit chain with optional Ed25519 signatures. |
| `flags` | `id TEXT` | `record_id -> records(id)` | `type TEXT`, `text TEXT`, `reporter_contact TEXT`, `status TEXT`, `resolution_note TEXT` | Community reports, correction requests, and dispute tracking. |
| `verifications` | `id INTEGER AUTO` | `record_id -> records(id)` | `source TEXT`, `url TEXT`, `note TEXT`, `reviewer TEXT` | Reviewer citations linking records to academic and governmental registries. |
| `users` | `id INTEGER AUTO` | None | `email TEXT UNIQUE`, `name TEXT`, `role TEXT`, `password_hash TEXT` | Reviewers and cultural stewards with salted scrypt passwords. |
| `record_stewards`| `id INTEGER AUTO` | `record_id -> records(id)`, `user_id -> users(id)` | `UNIQUE(record_id, user_id)` | Authorizes specific cultural stewards to decide requests for specific records. |
| `permission_requests` | `id TEXT` | `record_id -> records(id)` | `use_key TEXT`, `scope_json TEXT`, `requester_name TEXT`, `requester_contact TEXT`, `status TEXT`, `decision_note TEXT`, `conditions_json TEXT`, `credit_text TEXT`, `valid_from TEXT`, `valid_until TEXT`, `token_hash TEXT` | Inbound reuse requests guarded by private token hashes and status lifecycle. |
| `grants` | `id TEXT` | `request_id -> permission_requests(id)`, `record_id -> records(id)` | `payload_json TEXT`, `signature TEXT`, `key_id TEXT`, `created_at TEXT` | Digitally signed Ed25519 grant certificates referencing record audit head. |

### 2.2 Codebase Directory Map

```
mudra/
├── data/
│   ├── seed/                     # 15 real cultural heritage records + 1 sandbox demo
│   └── sources.md                # Human-verified citations from GI Registry, Kerala Kalamandalam
├── docs/
│   ├── PROJECT_REPORT.md         # Comprehensive technical specification (this document)
│   ├── slides.md                 # 9-slide presentation deck matching 3-act narrative
│   └── video-script.md           # 4:20 demo video walkthrough script
├── public/
│   ├── fonts/                    # Self-hosted OFL fonts (Playfair Display, Inter, Noto Serif)
│   └── seed/                     # Seed image assets
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
│   ├── app/                      # Next.js 15 App Router (24 routes)
│   │   ├── .well-known/tdmrep.json/route.ts  # W3C TDMRep reservation route
│   │   ├── api/v1/lookup/route.ts            # Hash-only batch lookup endpoint
│   │   ├── api/v1/manifest.json/route.ts     # Signed dataset snapshot endpoint
│   │   ├── api/assets/[id]/route.ts          # Image streaming with TDMRep headers
│   │   ├── api/public-key/route.ts           # Ed25519 public key endpoint
│   │   ├── api/records/[id]/card.png/route.tsx # Edge-rendered 1200x630 visual card
│   │   ├── api/records/[id]/verify/route.ts  # Audit verification API
│   │   ├── api/records/route.ts              # Public catalog search API
│   │   ├── catalogue/page.tsx                # Museum catalog with fuzzy search
│   │   ├── check/page.tsx                    # Perceptual image matcher UI
│   │   ├── developers/page.tsx               # Machine layer & API documentation
│   │   ├── g/[grantId]/page.tsx              # Public signed grant verification page
│   │   ├── r/[id]/page.tsx                   # Cultural Passport & schema.org JSON-LD
│   │   ├── r/[id]/report/page.tsx            # Community dispute and flag submission
│   │   ├── request/[token]/page.tsx          # Requester private status tracking page
│   │   ├── reuse/page.tsx                    # Standalone interactive Reuse Studio
│   │   ├── review/page.tsx                   # Protected reviewer & steward console
│   │   ├── submit/page.tsx                   # Heritage submission form
│   │   ├── verify/[id]/page.tsx              # Cryptographic audit chain & tamper sim
│   │   ├── verify/page.tsx                   # Instant integrity lookup by record ID
│   │   └── page.tsx                          # Editorial homepage & featured records
│   ├── components/               # Accessible UI components (VerdictCard, RequestPermissionForm, etc.)
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
Move 1 transforms "Ask first" from a passive message into an actionable, verifiable consent lifecycle.

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
- **CLI Output:**
  ```text
  ✓ Grant signature is VALID (Ed25519)
    Grant ID: a5ce1e3c-e627-4eae-96ea-81a3b91a1417
    Record: MDR-2026-0001
    Use: print_merch
    Steward: Kerala Kalamandalam Deemed University
    Validity: 2026-11-06 to 2027-11-06 (ACTIVE)
    Audit Head: a3b91c84f228...
    Conditions:
      1. Include credit line visibly on all prints and product tags.
      2. Do not alter or caricature the sacred Kathakali facial makeup.
      3. Proceeds must not be used for derogatory or defamatory campaigns.
  ```
- **Altered Byte Test:** Changing a single character in the grant conditions or payload causes the offline verifier and unit test suite (`tests/grant.test.ts`) to immediately reject the grant with a cryptographic signature mismatch.

---

### 3.4 Machine-Readable Layer for Platforms & Responsible AI
Move 2 equips Mudra with standardized protocols for automated ingestion by design tools, marketplaces, and AI dataset builders.

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
- **`/.well-known/tdmrep.json`:** Serves a dynamic JSON document listing `tdm-reservation: 1` for all published records where community consent for AI training has not been explicitly granted:
  ```json
  {
    "tdm-reservation": 1,
    "tdm-policy": "https://mudra-one-ivory.vercel.app/developers#tdm-policy",
    "comment": "Mudra reserves text and data mining rights for all registered cultural records where community consent for AI training has not been explicitly granted.",
    "reserved_records": [
      "MDR-2026-0001",
      "MDR-2026-0003",
      "MDR-2026-0004"
    ]
  }
  ```
- **HTTP Asset Headers:** Every image served at `/api/assets/[id]` emits:
  ```http
  tdm-reservation: 1
  tdm-policy: /developers#tdm-policy
  ```
- **Standards Framing:** Mudra transparently discloses on `/developers` that TDMRep is a Community Group report designed around EU opt-out law (DSM Directive Art. 4). Mudra publishes the community's stated preference; it does not enforce it.

#### 3. Privacy-Preserving Hash-Only Lookup API (`POST /api/v1/lookup`)
Platforms and dataset curators can check cultural registration and stated AI positions in batches of up to 50 items **without uploading user imagery**:

**Request:**
```bash
curl -X POST https://mudra-one-ivory.vercel.app/api/v1/lookup \
  -H "Content-Type: application/json" \
  -d '[
    { "sha256": "4a8fe3c...", "dhash": "a1b2c3d4e5f60718" },
    { "sha256": "9b1c2d3..." }
  ]'
```

**Response:**
```json
{
  "total_queries": 2,
  "results": [
    {
      "query_index": 0,
      "registered": true,
      "match_type": "exact",
      "record_id": "MDR-2026-0001",
      "title": "Kathakali classical dance-drama",
      "region": "Kerala",
      "work_type": "Performing",
      "licence": "CC-BY-SA-4.0",
      "permissions": {
        "share": "permitted",
        "commercial": "ask_first",
        "adapt": "permitted",
        "ai_training": "not_permitted"
      },
      "url": "https://mudra-one-ivory.vercel.app/r/MDR-2026-0001",
      "acquire_license_url": "https://mudra-one-ivory.vercel.app/r/MDR-2026-0001#request-permission"
    },
    {
      "query_index": 1,
      "registered": false,
      "match_type": "none"
    }
  ]
}
```
Rate-limited to 60 requests per minute per IP address.

#### 4. Signed Dataset Manifest (`GET /api/v1/manifest.json`)
Dataset auditors can pin a signed cryptographic snapshot of all registered works:
```json
{
  "manifest": {
    "v": 1,
    "generated_at": "2026-11-06T00:00:00.000Z",
    "site_url": "https://mudra-one-ivory.vercel.app",
    "records_count": 16,
    "records": [
      {
        "id": "MDR-2026-0001",
        "title": "Kathakali classical dance-drama",
        "sha256": "7a3f8...",
        "dhash": "3c3c666666663c3c",
        "licence": "CC-BY-SA-4.0",
        "perm_commercial": "ask_first",
        "perm_ai_training": "not_permitted",
        "audit_head": "4a8fe...",
        "url": "https://mudra-one-ivory.vercel.app/r/MDR-2026-0001"
      }
    ]
  },
  "signature": "base64EncodedEd25519Signature...",
  "key_id": "k1"
}
```

#### 5. Developer Portal (`/developers`)
Interactive documentation featuring copy-paste `curl` examples targeting production (`https://mudra-one-ivory.vercel.app`), manifest links, offline verification commands, and honest limits disclosures.

---

### 3.5 Perceptual Image Matching via dHash (`src/lib/imagehash.ts`)
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

### 3.6 Deterministic Identity Seal (`src/lib/seal.ts`)
To symbolize review integrity without overlaying or altering sacred artwork, Mudra renders a deterministic SVG identity seal:
- Computes SHA-256 digest of `{ id, sorted_credits }`.
- Derives geometric mandala petal count ($8 \dots 16$) and initial rotation angle.
- Embeds a stamped monospace record ID and an 8-character cryptographic fingerprint.
- Verified in `tests/seal.test.ts` to guarantee 100% byte-identical SVG generation for identical inputs.

---

### 3.7 Dynamic 1200×630 Visual Credit Card (`src/app/api/records/[id]/card.png`)
Using Next.js `ImageResponse` (running on Edge via `@vercel/og`):
- Generates high-resolution 1200×630 credit cards on demand.
- Layout: Warm cream mat background (`#f4ecdc`), uncropped artwork with dark frame, primary credit, tradition bearer tags, license badge, and a high-density QR code generated via `qrcode`.
- Scannable by any mobile camera, navigating directly back to the live Cultural Passport.

---

### 3.8 Authentication, Governance & Community Reporting
- **Role-Based Access Control (`src/lib/auth.ts`, `src/lib/session.ts`):** Roles include `admin`, `reviewer`, and `steward`. Passwords are salted and hashed using Node.js `scrypt` ($N=16384, r=8, p=1$). Sessions use HMAC-SHA256 signed cookies.
- **Reviewer Actions (`src/lib/repo.ts`):** `approveRecord`, `requestChangesRecord`, `removeRecord`, `verifyRecord` (with recorded evidence note), and `resolveFlag`. All actions record to the audit chain.
- **Community Reports (`/r/[id]/report`):** Supports problem reports and correction requests. Guarded with an invisible honeypot field (`website_hp`) to drop bots without database writes. Reporter contact info is kept confidential and is never leaked to public audit logs.

---

### 3.9 Phonetic Alias & Fuzzy Search Engine (`src/lib/search.ts`)
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

### 5.1 Aesthetic Direction & De-Cluttering
The design reflects an **archival museum publication** rather than a generic SaaS utility:
- **Typography:** Self-hosted OFL fonts: *Playfair Display* for serif headings, *Inter* for legible metadata, and *Noto Serif Malayalam* for native Malayalam script tokens (മുദ്ര).
- **Palette:**
  - Light mode: Warm archival paper background (`#f7eedd`), parchment surface (`#efe7d8`), deep carbon ink (`#1c1713`).
  - Dark mode: Deep obsidian ink (`#0a0607`), dark slate card (`#160f12`), crisp parchment text (`#f4ecdc`).
  - Cultural accents: Kerala terracotta (`#8a3b2a`), temple forest green (`#2f4a3a`), ceremonial gold (`#c9a24a`).
- **De-Cluttered Navigation:** Navigation was refined to 5 essential destinations:
  $$\text{Home} \quad\cdot\quad \text{Catalogue} \quad\cdot\quad \text{Check} \quad\cdot\quad \text{For platforms} \quad\cdot\quad \text{About}$$
  Reviewer console and steward requests are accessed securely behind role sign-in; standalone reuse and verification are contextually linked from every passport.
- **Performance Polish:** Falling particle layers were removed from the homepage, preserving visual focus on living heritage and eliminating rendering lag on mobile devices.
- **Uncropped Artwork Display:** Cultural artwork is never cropped, distorted, or subjected to arbitrary aspect ratio cuts.

### 5.2 Accessibility & WCAG AA Verification (`scripts/contrast.mjs`)
Every color combination in both light and dark themes meets WCAG AA contrast standards:
- Carbon Ink on Paper: **14.95:1** (Target: 4.5:1)
- Link Ochre on Paper: **10.12:1** (Target: 4.5:1)
- Permitted Green on Paper: **6.84:1** (Target: 4.5:1)
- Ask First Orange on Paper: **5.62:1** (Target: 4.5:1)
- Focus Indicator: Visible 3 px solid outline with 2 px offset.
- Screen-Reader Support: Full `prefers-reduced-motion` compliance.

---

## 6. Complete Inventory of All Routes & Endpoints (24 Routes)

| Route Path | Type | Functionality & Key Components |
|---|---|---|
| `/` | Server Component | Editorial hero, 3D lotus ornament, featured records carousel, 3-pillar breakdown. |
| `/catalogue` | Server Component | Full catalog, live keyword search, region filters, work type chips, responsive uncropped grid. |
| `/r/[id]` | Server Component | Cultural Passport: uncropped mat, verified seal, metadata list, accessible tabs, Reuse Studio, QR card download, schema.org JSON-LD, request permission disclosure. |
| `/reuse` | Client Component | Standalone Reuse Studio: work dropdown, 6 use cases, live verdict card, 4 copyable credit lines, request permission trigger. |
| `/request/[token]` | Server Component | Requester's private status page: tracks open, granted, declined, forwarded, or revoked states, custom conditions, and signed grant link. |
| `/g/[grantId]` | Server Component | Public grant verification page: live cryptographic verification, steward label, audit head link, conditions, and downloadable JSON payload. |
| `/developers` | Static Page | Platform integration guide: curl examples for lookup, manifest, and TDMRep; offline verification script; honest limits disclosure. |
| `/check` | Client Component | Drag-and-drop image matcher with dHash distance calculation and human-review guidance. |
| `/verify` | Server Component | Instant record lookup by ID with pre-populated real and sandbox examples. |
| `/verify/[id]` | Client/Server | Cryptographic audit timeline, client-side SHA-256 file check, in-memory tamper simulator. |
| `/review` | Server Component | Protected reviewer & steward console: open reports, permission request decisions (grant/decline/revoke), steward assignment, pending record approvals. |
| `/submit` | Client Component | Multi-step submission form with field validation and attribution builder. |
| `/r/[id]/report` | Client Component | Community correction/dispute form with anti-bot honeypot and reviewer forwarding. |
| `/about` | Static Page | Project philosophy, ethical guardrails, honest limitations, and AI tooling disclosure. |
| `/.well-known/tdmrep.json` | JSON Route | W3C TDMRep specification endpoint publishing `tdm-reservation: 1` for records where AI training is not permitted. |
| `/api/v1/lookup` | REST API | Privacy-preserving batch hash lookup API (SHA-256 + dHash) returning commercial and AI stances without image uploads. |
| `/api/v1/manifest.json` | JSON Route | Signed dataset snapshot of all registered works, hashes, and AI stances with Ed25519 signature. |
| `/api/records` | REST API | Returns public JSON list of published records with fuzzy search query matching. |
| `/api/records/[id]/verify` | REST API | Returns cryptographic integrity contract, hash chain status, and first broken seq (if any). |
| `/api/records/[id]/card.png`| Dynamic Image | Edge-rendered 1200×630 OpenGraph visual credit card with embedded QR and uncropped art. |
| `/api/assets/[id]` | Asset Stream | Secure streaming image endpoint; enforces privacy withholding for restricted works; emits `tdm-reservation` headers. |
| `/api/match` | REST API | Accepts image payload; computes dHash; returns similarity matches with in-memory rate limiting. |
| `/api/public-key` | REST API | Exposes server's Ed25519 public key in PEM format for external audit verification. |
| `/_not-found` | Static Page | Custom 404 page styled with warm parchment palette. |

---

## 7. Automated Test Suite & Verification Results

Mudra incorporates an automated test harness covering logic, cryptographic integrity, accessibility, and end-to-end user flows.

```bash
# 1. Logic & Cryptographic Tests
npm test
# Result: 34 passed, 0 failed, 439 ms duration
# - 8 SHA-256 hash chain and Ed25519 signature tests
# - 4 Cryptographic grant tests (signing, 1-byte alteration failure, expiration, SQLite request-grant-revoke loop)
# - 7 Permission engine property-based and golden tests
# - 2 Perceptual dHash calibration and real image tests
# - 1 Deterministic SVG seal test
# - 1 UI wording invariant test (0 prohibited words across entire codebase)
# - 7 Database transaction, concurrent ID, auth role, and governance tests

# 2. Seed Floor & Licence Verification
npm run check-licences
# Result: PASS (16 records, 15 real, floor 10 exceeded)

# 3. Accessibility & Contrast Verification
npm run contrast
# Result: PASS (10/10 WCAG AA color pairs meet or exceed standards)

# 4. Production Next.js Build
npm run build
# Result: PASS (All 24 routes compiled cleanly in 2.5s)
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
