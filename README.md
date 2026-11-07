# Mudra — Cultural Passports: Living Heritage Registry

> **Event:** ART//CODE 2026 · **Problem Statement:** PS-03 "Credit the Culture"  
> **Team:** Abhin Krishna M P & Alin · **License:** MIT Open Source  
> **Live Production:** [mudra-one-ivory.vercel.app](https://mudra-one-ivory.vercel.app)  

[![Tests](https://img.shields.io/badge/tests-34%20passed-success)](tests/)
[![WCAG AA](https://img.shields.io/badge/accessibility-WCAG%20AA%20Pass-emerald)](scripts/contrast.mjs)
[![PWA](https://img.shields.io/badge/PWA-installable%20%7C%20offline-blue)](public/manifest.json)
[![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-black)](https://nextjs.org)
[![LibSQL](https://img.shields.io/badge/database-LibSQL%20%2F%20Turso-blueviolet)](https://turso.tech)

---

## 1. Project Overview

**Mudra** turns *"ask first"* into a recorded, verifiable answer, and publishes it in a form that both people and machines can read.

In digital archives, stock libraries, and AI training datasets, indigenous traditions and sacred artforms are routinely extracted from their geographic and cultural origins. Legal copyright licenses (such as Creative Commons CC BY or CC0) grant legal permission to copy or remix an image, but they fail to convey living community wishes regarding sacred ritual depictions, commercial exploitation, or generative AI training. Reusers are left at a dead end when registries say "Ask first": there is no standardized protocol to ask, no structured channel for community stewards to answer, and no cryptographic receipt for platforms to verify.

Mudra solves this by issuing **Cultural Passports** for traditional works:
1. **Dual-Layer Evaluation:** Evaluates what the tradition bearers and community have stated alongside the digital file's copyright licence, synthesizing a conservative plain-language verdict.
2. **Actionable Ask → Grant Workflow:** Reusers submit a structured 4-field request. Verified cultural stewards review requests in their console and issue cryptographically signed grants (Ed25519 over RFC 8785 canonical JSON) that platforms and print shops can verify online or offline.
3. **Machine-Readable Layer for Platforms:** Publishes W3C TDMRep AI-training reservation signals (`/.well-known/tdmrep.json`), schema.org `CreativeWork` JSON-LD, signed dataset manifests, and privacy-preserving hash-only lookup APIs.
4. **Living Cultural Experience (v2.0):** Features a master **Traditional Kerala Padippura** navbar, full **Progressive Web App (PWA)** offline capabilities, a **Live Registry Notification Center**, dual-theme **3D Heritage Stages**, and **Zero-Heat GPU Performance Engineering**.

*Mudra is not an automated copyright filter and does not dispense legal claims. It records community consensus so reusers can ask before they build.*

---

## 2. The Core 3-Act Loop

$$\mathbf{Check} \quad\longrightarrow\quad \mathbf{Ask} \quad\longrightarrow\quad \mathbf{On\ Record}$$

1. **Check:** A creator or platform checks an image via drag-and-drop perceptual dHash matching (`/check`) or explores the catalog (`/catalogue`). Mudra displays the dual-layer Cultural Passport, detailing both the community's cultural permissions and the legal file licence.
2. **Ask:** When a verdict requires asking first (e.g., commercial merchandise or AI training), reusers submit a 4-field structured request (name, private contact, project scope, duration). Reusers receive a private tracking link (`/request/[token]`) with live status updates.
3. **On Record:** Named cultural stewards review the request, apply custom conditions and validity windows, and issue an Ed25519 digitally signed grant. Anyone can verify the grant online (`/g/[grantId]`) or completely offline using the standalone CLI verifier (`node scripts/verify-grant.mjs`).

---

## 3. Fresh Demonstration Gallery (Alternating Light & Dark Themes)

| Screen | Theme | Description |
| :--- | :---: | :--- |
| ![Home & Kathakali Backwaters Stage](docs/screenshots/01-home-light.png) | **Light** | **Home & Kathakali Backwaters Stage:** Daylit Kerala backwaters sunset, animated Kathakali eye tracking, floating Kasavu silk cloth, and warm nilavilakku lamp glow. |
| ![Home & 3D Theyyam Stage](docs/screenshots/02-home-dark.png) | **Dark** | **Home & 3D Theyyam Stage:** Night temple courtyard, 3D Panchuruli Theyyam figure, hardware-accelerated cursor torchlight, rising embers, and Padippura master navbar with subpixel razor-sharp typography. |
| ![Cultural Passport](docs/screenshots/03-cultural-passport-light.png) | **Light** | **Cultural Passport (`/r/[id]`):** Warm archival museum parchment aesthetic, uncropped artwork mat, deterministic SVG mandala seal, and dynamic QR credit card. |
| ![Live Registry Notifications](docs/screenshots/04-live-notifications-dark.png) | **Dark** | **Live Registry Notifications Popover:** Interactive notification bell displaying real-time database updates for new publications, reviewer verifications, and steward grants with unread count badges. |
| ![Interactive Reuse Studio](docs/screenshots/05-reuse-studio-light.png) | **Light** | **Interactive Reuse Studio (`/reuse`):** Dual-layer mathematical permission engine, live plain-language verdict cards, and 4 one-click copyable attribution formats. |
| ![Verify Page & Tamper Simulation](docs/screenshots/06-verify-tamper-dark.png) | **Dark** | **Verify Page & Tamper Simulation (`/verify/[id]`):** Cryptographic SHA-256 audit chain timeline, client-side browser file hashing, and interactive in-memory tamper simulator. |
| ![Reviewer & Steward Console](docs/screenshots/07-reviewer-console-light.png) | **Light** | **Reviewer & Steward Governance Console (`/review`):** Role-guarded dashboard for reviewing inbound permission requests, setting custom conditions, and issuing Ed25519 digitally signed grants. |
| ![Perceptual Image Matcher](docs/screenshots/08-check-image-dark.png) | **Dark** | **Check An Image (`/check`):** Calibrated 64-bit gradient difference hashing (dHash) to match resized, recompressed, and cropped imagery for human review. |
| ![PWA on Mobile Viewport](docs/screenshots/09-mobile-pwa-light.png) | **Light** | **Mobile Viewport & PWA:** Installable standalone Progressive Web App with warm sunlight palette, mobile Padippura bar, touch navigation, and zero CTA overlap. |

---

## 4. Key Architectural Capabilities

### 4.1 Traditional Kerala Padippura Master Navbar
- **Cultural Architecture Motif:** Modeled after Kerala's heritage entrance gateway (*Padippura*): pitched terracotta tile roof, ornamental brass pediment (*gopuram*), backwater *kettuvallam* boat, and brass *nilavilakku* lamp.
- **Dual-Theme 2087×436 Master Artworks:** Dedicated light (`navbar-full.png`) and dark (`navbar-dark.png`) canvases.
- **Subpixel Typography Synthesis:** Inpainted blurry raster areas from 1024px uploads and re-composited subpixel vector-sharp typography in ivory cream (`#fff8ee`) and Kerala temple gold (`#f2ce73`), eliminating blur on 2× Retina screens.
- **Precision Percentage Hotspots:** Pixel-perfect CSS coordinates for brand, navigation pills (with live active pill indicators and gold diamond end-caps), search, theme switch, notification bell, and user avatar.

### 4.2 Progressive Web App (PWA) & Offline Engine
- **Web App Manifest (`src/app/manifest.ts` & `public/manifest.json`):** Configured for full standalone execution with synchronized theme colors (`#0c3d33` light, `#0a0607` dark) and an adaptive icon suite (`16px` to `512px`, maskable).
- **Service Worker (`public/sw.js`):** **Cache-first** strategy for heavy WebP artworks, static assets, and OFL webfonts; **network-first with offline cache fallback** for dynamic passport routes.
- **Heritage In-App Install Banner:** Custom install prompt capturing `beforeinstallprompt` with dismissal persistence.

### 4.3 Live Registry Notification System
- **Real-Time Database Feed (`/api/notifications`):** Aggregates recent audit events (`approved`, `verified`, `granted`, `created`) from `audit_events`, `grants`, and `records` tables.
- **Interactive Notification Popover:** Connected to the navbar bell button with an unread badge counter, filtering tabs ("All", "Approvals", "Grants"), and mark-as-read persistence.

### 4.4 Zero-Heat GPU Performance Engineering
- **Offscreen Sprite Pre-rendering:** Replaced dynamic re-allocation of 70 `CanvasGradient` objects per frame with a single $64\times 64$ offscreen sprite blitted via hardware-accelerated `drawImage`. Gradient creations dropped from **3,278 in 3s down to 1** (**99.97% reduction**).
- **Tab Background Sleep Lifecycle:** Animation frame loops in `HeroMotion` and `HeroKerala` automatically sleep when the tab is hidden or minimized (`visibilitychange`), dropping background power draw to **0% CPU / 0% GPU**.
- **DOM Mutation Deduping:** Cached string outputs for CSS variables to prevent redundant style recalcs and mask re-evaluations during idle states.
- **Hardware Layer Promotion:** Added `transform: translateZ(0)` to blurred layers and ember canvases to eliminate continuous CPU Gaussian blur re-rasterization.

### 4.5 Two-Layer Permission Engine
- Evaluates $6\text{ reuse scenarios} \times 6\text{ licence regimes} \times 3^4\text{ community states} \times 2\text{ attribution options} \times 3\text{ sensitivities} = 17,496$ combinations via pure mathematical resolution. Proven with comprehensive property tests (`tests/permissions.test.ts`).

### 4.6 Cryptographic Audit Chain & Offline Verifiable Grants
- **SHA-256 Append-Only Chain:** Sequential hash linking where payload $P_k$ is canonicalized via RFC 8785 (`canonicalize`) and hashed with $H_{k-1}$.
- **Ed25519 Asymmetric Signatures:** Audit heads and grant certificates are digitally signed.
- **Offline CLI Verifier:** Independent CLI verification script (`scripts/verify-grant.mjs`) requiring zero network or database dependencies.

### 4.7 Machine Layer & AI Transparency
- **W3C TDMRep AI Signals:** Dynamic `/.well-known/tdmrep.json` and `tdm-reservation: 1` HTTP headers for records where AI training is not permitted.
- **schema.org `CreativeWork`:** JSON-LD metadata embedded in every passport page.
- **Privacy-Preserving Hash Lookup:** `POST /api/v1/lookup` checks cultural registration and AI stances in batches up to 50 items without image uploads.
- **Signed Manifest:** `GET /api/v1/manifest.json` provides an Ed25519-signed snapshot of all registered works.

---

## 5. Technology Stack

<div align="center">

### Framework & Runtime

<img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/TypeScript_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js_22.5+-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" />

### Database & Storage

<img src="https://img.shields.io/badge/Turso_LibSQL-4FF8D2?style=for-the-badge&logo=turso&logoColor=black" />
<img src="https://img.shields.io/badge/SQLite_Local-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel_Blob-000000?style=for-the-badge&logo=vercel&logoColor=white" />

### Cryptography & Security

<img src="https://img.shields.io/badge/Ed25519-2563EB?style=for-the-badge&logo=gnuprivacyguard&logoColor=white" />
<img src="https://img.shields.io/badge/SHA--256-7C3AED?style=for-the-badge" />
<img src="https://img.shields.io/badge/scrypt-DB2777?style=for-the-badge" />
<img src="https://img.shields.io/badge/HMAC--SHA256-EA580C?style=for-the-badge" />
<img src="https://img.shields.io/badge/RFC_8785-475569?style=for-the-badge" />

### Imaging & Digital Assets

<img src="https://img.shields.io/badge/sharp_dHash_·_WebP-99CC00?style=for-the-badge" />
<img src="https://img.shields.io/badge/@vercel/og_1200×630-000000?style=for-the-badge&logo=vercel&logoColor=white" />
<img src="https://img.shields.io/badge/QR_Code-1F2937?style=for-the-badge" />

### Web Standards

<img src="https://img.shields.io/badge/PWA_Offline-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
<img src="https://img.shields.io/badge/W3C_TDMRep-005A9C?style=for-the-badge&logo=w3c&logoColor=white" />
<img src="https://img.shields.io/badge/schema.org_JSON--LD-0D6EFD?style=for-the-badge" />

### Styling & Typography

<img src="https://img.shields.io/badge/Vanilla_CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/Playfair-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white" />
<img src="https://img.shields.io/badge/Inter-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white" />
<img src="https://img.shields.io/badge/Noto_Serif_Malayalam-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white" />

### Testing & Quality Assurance

<img src="https://img.shields.io/badge/node:test_34-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Playwright_E2E-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" />
<img src="https://img.shields.io/badge/WCAG_AA_Contrast-10B981?style=for-the-badge" />

### Deployment & Infrastructure

<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
<img src="https://img.shields.io/badge/Turso_on_AWS_ap--south--1-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white" />

</div>

---




## 6. System Architecture

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "background": "#0D1117",
    "primaryColor": "#202124",
    "primaryTextColor": "#E5E7EB",
    "primaryBorderColor": "#59636E",
    "lineColor": "#B8C0CA",
    "secondaryColor": "#25282D",
    "tertiaryColor": "#1B1F24",
    "clusterBkg": "#11151B",
    "clusterBorder": "#59636E",
    "fontFamily": "Inter, Segoe UI, sans-serif",
    "fontSize": "14px"
  },
  "flowchart": {
    "curve": "step",
    "nodeSpacing": 42,
    "rankSpacing": 55,
    "padding": 18,
    "htmlLabels": true,
    "useMaxWidth": true,
    "wrappingWidth": 180
  }
}}%%

flowchart TB

    %% CLIENT LAYER
    subgraph CLIENT["01 · CLIENT APPLICATION"]
        direction LR

        UI["Next.js 15 · React<br/>Progressive Web App"]

        CULTURE["Cultural Interface<br/>Kerala Heritage UI<br/>Themes · Navigation · Loader"]

        STUDIO["Reuse Studio<br/>Live Notifications<br/>Filters · Interactive Popovers"]

        IDENTITY["Identity & Requests<br/>SVG Seal · File Hash<br/>Permission Forms · Verification"]

        UI --> CULTURE --> STUDIO --> IDENTITY
    end

    %% APPLICATION LAYER
    subgraph APPLICATION["02 · APPLICATION & SECURITY ENGINE"]
        direction LR

        API["API & Access Layer<br/>REST · Server Actions<br/>Scrypt · RBAC · HMAC"]

        CORE["Permission & Audit Engine<br/>17,496 Tests<br/>SHA-256 Audit Chain"]

        CRYPTO["Cryptographic Services<br/>Ed25519 · RFC 8785<br/>Signed Grant Generation"]

        MEDIA["Media & Discovery Engine<br/>Perceptual dHash<br/>Image Processing · QR · OG Cards"]

        STANDARDS["Web Standards & PWA<br/>W3C TDMRep · AI Signals<br/>Manifest · Offline Support"]

        REALTIME["Real-time Services<br/>Notification API<br/>Live Database Events"]

        API --> CORE
        CORE --> CRYPTO
        CORE --> MEDIA
        CRYPTO --> STANDARDS
        CRYPTO --> REALTIME
    end

    %% STORAGE LAYER
    subgraph STORAGE["03 · DATABASE & PERSISTENCE"]
        direction LR

        TURSO[("Turso Cloud<br/>AWS · ap-south-1<br/>LibSQL")]

        SQLITE[("Local SQLite<br/>data/mudra.db<br/>Offline Persistence")]

        SCHEMA["Core Records<br/>records · credits<br/>assets · counters"]

        AUDITDB["Governance & Audit<br/>audit_events · flags<br/>verifications"]

        ACCESSDB["Access & Permissions<br/>users · record_stewards<br/>permission_requests · grants"]

        TURSO <-->|"Cloud Sync"| SQLITE

        TURSO --> SCHEMA
        TURSO --> AUDITDB
        TURSO --> ACCESSDB
    end

    %% MAIN SYSTEM FLOW
    IDENTITY -->|"HTTPS · API Requests"| API

    %% APPLICATION TO DATABASE
    API --> TURSO
    CORE -->|"Atomic Transactions"| TURSO
    CRYPTO -->|"Signed Grants"| TURSO
    MEDIA -->|"Hash Lookup"| TURSO
    REALTIME <-->|"Live Events"| TURSO

    %% PRESENTATION & STANDARDS
    STANDARDS -.->|"Web Manifest"| UI
    REALTIME -.->|"Live Updates"| STUDIO

    %% NODE STYLING
    classDef client fill:#202124,stroke:#68717D,color:#E5E7EB,stroke-width:1.2px
    classDef engine fill:#25282D,stroke:#87919D,color:#F1F3F5,stroke-width:1.3px
    classDef storage fill:#202124,stroke:#89939F,color:#E5E7EB,stroke-width:1.5px
    classDef cloud fill:#292D32,stroke:#B0B8C2,color:#FFFFFF,stroke-width:1.8px

    class UI,CULTURE,STUDIO,IDENTITY client
    class API,CORE,CRYPTO,MEDIA,STANDARDS,REALTIME engine
    class SCHEMA,AUDITDB,ACCESSDB storage
    class TURSO,SQLITE cloud

    %% SUBGRAPH STYLING
    style CLIENT fill:#0D1117,stroke:#59636E,stroke-width:1.5px,color:#E5E7EB
    style APPLICATION fill:#0D1117,stroke:#59636E,stroke-width:1.5px,color:#E5E7EB
    style STORAGE fill:#0D1117,stroke:#59636E,stroke-width:1.5px,color:#E5E7EB

    linkStyle default stroke:#AEB7C2,stroke-width:1.25px
```

---

<div align="center">

**Mudra — Preserving Heritage. Protecting Rights. Empowering Creators.**

</div>

---


## 7. Installation & Quickstart

Clone and run Mudra locally with zero external dependencies:

```bash
# 1. Clone repository
git clone https://github.com/Abhin-Krishna-MP/Mudra.git && cd Mudra

# 2. Configure environment
cp .env.example .env

# 3. Install dependencies (Node 22.5+ required)
npm install

# 4. Seed database with 15 verified cultural heritage records
npm run seed

# 5. Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Reviewer Evaluation Credentials

| Field | Details |
|:---|:---|
| **Email** | `reviewer@mudra.demo` |
| **Password** | `DemoReviewerPass123!` |
| **Console** | Navigate to `http://localhost:3000/review` to inspect submissions, manage requests, and issue signed grants. |

### Offline Standalone Grant Verification

Verify any permission grant artifact offline with zero network connectivity:

```bash
node scripts/verify-grant.mjs path/to/grant.json path/to/public-key.pem
```

---

## 8. Verification & Test Suite

Run the full automated test and compliance harness:

```bash
# 1. Unit & Cryptographic Test Suite (34 tests passing)
npm test

# 2. TypeScript Strict Validation (0 errors)
npm run typecheck

# 3. WCAG AA Contrast Compliance (10/10 passing)
npm run contrast

# 4. Playwright End-to-End User Journeys (Search -> Passport -> Reuse Studio -> Credit Line)
npm run test:e2e
```

---

## 9. Ethical Guardrails & Attribution

- **No Hallucinated Culture:** AI tools were utilized strictly for programming and scaffolding. Every cultural fact, tradition bearer credit, geographical origin, and license attribution was researched, cited, and checked by human team members from primary academic and governmental sources (UNESCO, Kerala Kalamandalam, Kerala Folklore Academy, and the Geographical Indications Registry of India).

- **Prohibited Words Invariant:** Enforced via `tests/wording.test.ts`. The extractive legalistic words `owner`, `ownership`, `proof of ownership`, `stolen`, `detected`, `infringement`, and `authentic` are forbidden throughout the codebase.

- **License:** MIT Open Source (see [`LICENSE`](LICENSE)).

---

<div align="center">

**Mudra: Don't just take the imagery. Credit the culture.**

</div>



## Author access to `/submit`

Only signed-in users with the `author` role can submit drafts.

- `users.role` defaults to `author`; the public sign-up form (`/login?mode=signup`) always creates authors.
- `/submit` is guarded twice: `src/middleware.ts` verifies the signed session and answers with a 307 to `/login?msg=Unauthorized`; the page and `createRecordAction` then re-read the role from the database (`src/lib/authz.ts`), so a demoted author loses access immediately.
- Reviewers and admins use `/review` and are not authors. To let them submit too, add their roles to `SUBMIT_ROLES` in `src/lib/authorRoles.ts`.
- Databases created before this change keep their old `role` column without a default (SQLite cannot alter a default in place). Sign-up sets `author` explicitly, so this has no effect on behaviour.
