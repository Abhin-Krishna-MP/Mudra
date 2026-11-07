# Mudra — Video Demonstration Script (v2.0)
> **Target Duration:** 4 minutes 30 seconds · **Event:** ART//CODE 2026 PS-03 "Credit the Culture"  
> **Lead Story:** *Check → Ask → On Record: Living Cultural Passports for People and Machines*  
> **Live Production:** `https://mudra-one-ivory.vercel.app`

---

### Act 1: Atmospheric Arrival, Cultural Padippura & The Problem (0:00 – 1:00)
- **Visual (0:00 – 0:25):** 
  - The application opens with the cultural splash loader (`MudraLoader`): an animated glowing golden lotus mark, drifting ambient motes, and the Malayalam calligraphy token (`മുദ്ര`).
  - As loading finishes, the parting velvet stage curtain glides open smoothly to reveal the dual-theme Kerala stage.
  - In light theme: warm sunlight illuminating the Kathakali backwaters.
  - In dark theme: the dramatic 3D Panchuruli Theyyam night stage bathed in temple torches and gentle ember motes.
  - Crowned atop the stage is the traditional Kerala *Padippura* master navbar—a handcrafted gateway featuring a pitched terracotta clay roof, brass kettuvallam boat, hanging nilavilakku lamp, and vector-crisp typography.
- **Voiceover:**
  > "A designer in Kochi finds a striking photograph of a Theyyam ritual performer. They want to feature it on limited-edition merchandise for an art fair. Legally, the photograph might be labelled Creative Commons or Public Domain. But does the ritual community consent?
  > Conflating open file copyright with living community consent harms traditional heritage. Registries usually stop at telling users to 'ask first'—leaving creators with no channel to ask, communities with no structured way to respond, and platforms with no way to verify consent. Mudra turns 'ask first' into a recorded, verifiable answer."

---

### Act 2: Check — Perceptual dHash & The Cultural Passport (1:00 – 1:45)
- **Visual (1:00 – 1:20):** 
  - Navigate to `/check`. The designer drops the candidate Theyyam image onto the perceptual matcher.
  - Within milliseconds, Mudra computes a 64-bit perceptual dHash and matches the image against registered cultural records without uploading image files to central surveillance databases.
- **Voiceover:**
  > "Instead of guessing, the designer drops the image into Mudra's 'Check an Image' tool. Using perceptual dHash matching, Mudra matches the motif locally and links directly to its living Cultural Passport."
- **Visual (1:20 – 1:45):** 
  - Open `/r/theyyam-panchuruli`.
  - Display the uncropped artwork mat, tradition bearer lineages, cited academic sources (Kerala Folklore Academy), and the deterministic SVG identity seal derived from the record's cryptographic digest.
  - Scroll to the dual-layer permissions panel.
- **Voiceover:**
  > "On the passport, we see who the tradition bearers are, cited ethnographic sources, and our two independent permission layers: the file licence permits display, but the living community has not stated commercial terms. Mudra resolves conservatively: 'Commercial merchandise: Ask first'."

---

### Act 3: Ask → Grant Consent Lifecycle (1:45 – 2:45)
- **Visual (1:45 – 2:10):** 
  - Tap *Request permission* directly inside the Reuse Studio on the passport page.
  - Complete the 4 structured request fields:
    - **Your Name:** `Aline Designer`
    - **Private Contact:** `aline@studio.in` *(strictly kept private; never stored in public logs)*
    - **Intended Use:** `Limited run of 200 screen-printed T-shirts for Malabar Craft Fair`
    - **Duration & Territory:** `Kerala craft exhibition, 3 months`
  - Click *Send request*. A private tracking link and confirmation modal are generated.
- **Voiceover:**
  > "Instead of a dead end, Mudra gives the creator an actionable next step: 'Request permission'. Four clean fields: who you are, private contact details, what you will make, and where. Mudra never leaks requester contact info to public logs or public audit chains."
- **Visual (2:10 – 2:45):** 
  - Switch to the authenticated Reviewer / Steward console (`/review`).
  - Open the *Permission Requests* section. Show the incoming request with full contextual metadata.
  - Click *Grant permission & issue signed grant*.
  - Enter specific conditions: `Must display Mudra credit line alongside label; maximum 200 units`. Click *Confirm and Sign*.
- **Voiceover:**
  > "Now we cut to the steward console. Mudra never consents on behalf of a community—only a linked cultural steward decides. The steward reviews the request with its full context, enters specific conditions, and grants permission.
  > Mudra cryptographically signs the grant certificate using an Ed25519 private key over RFC 8785 canonical JSON, and appends the grant event to the record's tamper-evident SHA-256 audit chain."

---

### Act 4: Live Notifications & Verification (2:45 – 3:30)
- **Visual (2:45 – 3:05):** 
  - Click the notification bell on the Padippura master navbar.
  - An interactive popover drops down, displaying real-time events streamed from the registry: the newly issued grant certificate appears instantly with its badge counter.
  - Click the notification to open the public grant link at `/g/<grantId>`.
- **Voiceover:**
  > "Instantly, the registry notification center updates. The designer receives their signed, verifiable grant. Print shops and merchandise platforms can verify it online: it confirms permitted scope, validity dates, specific conditions, and the cryptographic signature verified against the public key."
- **Visual (3:05 – 3:30):** 
  - Switch to the terminal. Run the standalone offline CLI verification:
    ```bash
    node scripts/verify-grant.mjs grant.json public-key.pem
    ```
    Show the green active verification.
  - Alter a single character in `grant.json` conditions and re-run to show instant cryptographic failure.
  - Quickly show `/verify/theyyam-panchuruli` where the live in-memory tamper simulation shows the SHA-256 audit chain breaking if records are modified.
- **Voiceover:**
  > "Mudra works without lock-in. Anyone can verify the grant completely offline using our standalone verification script. If anyone alters even a single byte of the grant conditions, the cryptographic signature check fails immediately."

---

### Act 5: Machine-Readable Layer & Progressive Web App (3:30 – 4:00)
- **Visual (3:30 – 3:45):** 
  - Navigate to `/developers`.
  - Highlight the three machine layer features:
    1. Batch perceptual hash lookup API (`POST /api/v1/lookup`) for platforms to check community stances in batches of 50 without transmitting user imagery.
    2. W3C TDMRep signals at `/.well-known/tdmrep.json` and HTTP asset headers (`tdm-reservation: 1`).
    3. Ed25519-signed dataset manifest (`GET /api/v1/manifest.json`) for AI dataset auditors.
- **Visual (3:45 – 4:00):** 
  - Showcase the Progressive Web App (PWA) banner and mobile install experience.
  - Switch network tab to Offline mode in DevTools and refresh the catalogue to demonstrate instant Service Worker cache-first retrieval.
- **Voiceover:**
  > "For AI platforms and dataset builders, Mudra provides machine-readable consent signals: W3C TDMRep reservations, hash-only batch lookups, and signed dataset manifests.
  > And for field researchers and craft communities across rural Kerala, Mudra is a full Progressive Web App that works seamlessly offline."

---

### Act 6: Zero-Heat Performance, Safeguards & Close (4:00 – 4:30)
- **Visual (4:00 – 4:15):** 
  - Show the ultra-smooth 60 FPS performance overlay.
  - Switch tabs to show background sleep lifecycle (0% CPU / 0% GPU).
- **Voiceover:**
  > "Under the hood, Mudra is engineered for sustainability. By pre-rendering canvas sprites and sleeping animations when tabs lose focus, we eliminated laptop overheating—reducing dynamic gradient allocations by 99.97%."
- **Visual (4:15 – 4:30):** 
  - Return to the home catalogue showing the 15 verified Kerala cultural records.
  - Mudra logo and tagline: *Credit the Culture*.
- **Voiceover:**
  > "Mudra adheres to strict ethical guardrails: we never consent for a community, grants are recorded statements, and all 15 records were verified by humans from primary academic sources with zero AI hallucinations.
  > Mudra bridges traditional heritage and digital culture. Don't just take the imagery. Credit the culture. Thank you."
