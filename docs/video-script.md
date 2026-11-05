# Mudra — Video Demonstration Script
> Target Duration: 4 minutes 15 seconds (Max: 5:00) · Captioned MP4 Walkthrough

---

### Segment 1: The Problem & The Vision (0:00 – 0:40)
- **Visual:** Title card with lotus logo: "Mudra — Cultural Passports (ART//CODE 2026 PS-03)". Transition to browser showing digital imagery across social media and merchandise without attribution.
- **Voiceover:**
  > "Every day, traditional indigenous art and motifs are reused across digital media, merchandise, and AI training datasets without knowing who they come from or what their communities intended. A Creative Commons image licence might legally allow commercial use, but does the living community consent? Conflating legal licences with cultural wishes harms living heritage.
  >
  > Welcome to Mudra. Mudra gives every cultural work a public Cultural Passport, combining community consent with file licences into plain-language reuse verdicts and ready-to-use credit cards."

---

### Segment 2: Working Demo — Discovery & Cultural Passport (0:40 – 1:35)
- **Visual:** Open homepage `http://localhost:3000`. Show the interactive 3D lotus ornament, marigold petals particle system, and search box.
- **Action:** Type "Teyyam" (with deliberate phonetic spelling variation).
- **Voiceover:**
  > "On the home screen, users can explore Kerala's living heritage. Notice how typing 'Teyyam' instantly surfaces the Panchuruli Theyyam record through our built-in phonetic alias engine. Let's open Kathakali (Record MDR-2026-0001)."
- **Visual:** Navigate to `/r/MDR-2026-0001`.
- **Voiceover:**
  > "Above the fold, the artwork is presented uncropped on an archival museum mat, stamped with a verified deterministic identity seal. We see the tradition bearers credited, geographical origins, cited academic sources from Kerala Kalamandalam, and our two distinct permission layers: what the community has stated, and what the image licence says."

---

### Segment 3: Working Demo — Reuse Studio & Dual-Layer Engine (1:35 – 2:35)
- **Visual:** Scroll down to the embedded Reuse Studio on the passport page or navigate to `/reuse`.
- **Action:** Select "Print on merchandise (commercial)".
- **Voiceover:**
  > "Now, suppose a graphic designer wants to print this Kathakali image on commercial apparel. They select 'Print on merchandise'. Watch how Mudra evaluates this:
  > The Creative Commons licence allows commercial use, BUT the Kathakali tradition bearers have not stated terms for commercial exploitation.
  > Mudra's conservative engine triggers: 'Ask first, because the community has not stated whether commercial use is acceptable.' It never assumes consent.
  > In one click, the user can copy a formatted credit line in Plain text, Academic, BibTeX, or HTML, or download a high-resolution 1200 by 630 Visual Credit Card with an embedded QR code linking back to this passport."

---

### Segment 4: Cryptographic Trust & Tamper-Evident History (2:35 – 3:20)
- **Visual:** Click "Verify this record" or navigate to `/verify/MDR-DEMO-0001`.
- **Action:** Show the audit timeline with green integrity dots. Click "Simulate tampering in memory".
- **Voiceover:**
  > "Trust in Mudra is verifiable. Every submission, status change, and reviewer action appends an event to an atomic SHA-256 hash chain with optional Ed25519 digital signatures.
  > On the verify page, anyone can inspect the cryptographic trail. Let's test our in-app tamper simulation on this sandbox record. If a malicious party alters the stored data in memory, Mudra immediately flags the exact sequence number where the hash chain breaks, proving the history is tamper-evident."

---

### Segment 5: Governance & Reviewer Console (3:20 – 3:55)
- **Visual:** Navigate to `/review` and log in with `reviewer@mudra.demo`.
- **Action:** Show the queue of pending submissions and open community flags. Demonstrate approving a pending work and resolving a flag with an evidence note.
- **Voiceover:**
  > "Mudra includes a secure reviewer console guarded by scrypt session authentication. Reviewers can examine pending submissions, inspect image similarity matches, review community corrections or flags, and resolve them with evidence notes—with each decision atomically recorded to the public audit chain."

---

### Segment 6: Architecture, Ethics & Closing (3:55 – 4:25)
- **Visual:** Brief look at `/check` (image similarity drop zone) and `/about` (museum limits and ethics).
- **Voiceover:**
  > "Mudra is built on Next.js 15, Turso LibSQL, and Sharp. It contains 15 curated real-world Kerala cultural records backed by official government archives. Mudra is not a copyright enforcement tool or a financial scheme; it is a community-first bridge for respectful attribution.
  >
  > Don't just take the imagery. Credit the culture. Thank you."
- **Visual:** Closing slide with GitHub repository link `https://github.com/Abhin-Krishna-MP/Mudra` and team credits (Abhin + Alin).
