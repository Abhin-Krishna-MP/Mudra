# Mudra — Presentation Deck (9 Slides)
> ART//CODE 2026 · PS-03 "Credit the Culture" · Team: Abhin + Alin

---

## Slide 1: Title & Team
**Mudra — Cultural Passports**
*Connecting Indigenous Culture, Community Intent, and Responsible Reuse*
- **Challenge:** ART//CODE 2026 — PS-03: "Credit the Culture"
- **Team:** Abhin Krishna M P (Backend, Audit Chains, Auth, Deploy) & Alin (Design System, Accessible UI/UX, Deliverables)
- **Status:** Complete production-ready implementation on Next.js 15 + Turso LibSQL

---

## Slide 2: The Problem
**Cultural Heritage Lost in Digital Translation**
- **Loss of Origin:** Digital platforms propagate sacred and traditional imagery stripped of cultural context and artist identity.
- **Copyright ≠ Cultural Consent:** A permissive open licence (like CC BY or Public Domain) does not account for a living community's cultural sensitivities or commercial boundaries.
- **Ambiguity Leads to Harm:** Creators reuse indigenous motifs commercially without knowing whether the community consents or how to cite them respectfully.

---

## Slide 3: The Solution in One Picture
**The Dual-Layer Cultural Passport**
```
      [ Traditional Cultural Work ]
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
[ Cultural Layer ]       [ File Licence Layer ]
(Community Wishes:        (Creative Commons Legal
 Share / Commercial /      Terms: CC BY, CC BY-SA,
 Adapt / AI Training)      CC0, PDM, CC BY-NC)
    └──────────────┬──────────────┘
                   ▼
     [ Conservative Resolution ]
   (Any "no" wins → then "ask" → else "permitted")
                   ▼
  [ Plain-Language Verdict & Action ]
  • "Ask first, because the community has not stated..."
  • Ready-to-use formatted credit lines (Plain, Academic, BibTeX, HTML)
  • Downloadable 1200×630 Visual Credit Card with QR code
```

---

## Slide 4: Interactive Discovery & Reuse
**From Catalog to Permissible Reuse in Seconds**
- **Editorial Museum Catalogue (`/catalogue`):** Live typo-tolerant fuzzy search with Malayalam spelling aliases, region filters, and work-type chips.
- **Cultural Passport (`/r/[id]`):** Uncropped artwork mat, provenance sources, tradition bearer credits, and deterministic SVG identity seal.
- **Reuse Studio (`/reuse`):** Real-time evaluator across 6 real-world use cases (online sharing, teaching, commercial merchandise, remixing, commercial adaptation, AI training).
- **Embedded Credit Cards:** Dynamic Next/OG 1200×630 cards with embedded artwork, metadata, and scannable QR link.

---

## Slide 5: The Dual-Layer Permissions Model
**Conservative, Deterministic & Legally Cross-Checked**
- **Pure Functional Engine:** 17,496 property test combinations verified without side effects.
- **Verified Licence Matrix:** Cross-checked against official Creative Commons 4.0 legal texts (unaddressed uses like AI training map conservatively to "Ask first").
- **Clear Guidance:** If the community has not stated terms for commercial use, the engine never assumes permission; it explicitly directs the user to "Ask first".
- **Cultural Safeguards:** Sacred and sensitive records support "Handle with care" notices or "Restricted" withholding (public image withheld from endpoints).

---

## Slide 6: Cryptographic Trust & Verification
**Tamper-Evident Provenance Without Blockchain Overhead**
- **SHA-256 Audit Hash Chains:** Every create, status change, verification, and flag resolution commits an event to a strictly linked cryptographic hash chain in a single atomic transaction.
- **Optional Ed25519 Signatures:** Keyed audit signing verifying service authority while preserving backward compatibility with mixed chains.
- **Client-Side File Hashing:** Browser-based SHA-256 verification of local user files against registered image digests.
- **Interactive In-App Tamper Simulation (`/verify/[id]`):** Visual proof showing exactly which sequence number breaks when a record payload is altered in memory.

---

## Slide 7: System Architecture & Performance
**Lean, Resilient, Production-Hardened**
- **Modern Next.js 15 App Router:** Server components by default with minimal client hydration (103 kB first-load JS).
- **Turso LibSQL Database:** Edge-distributed relational storage with strict foreign keys, unique sequence constraints, and indexed lookups.
- **Perceptual Image Matching (`/check`):** In-memory rate-limited dHash visual similarity matching (empirically calibrated: copies $\le 12$, distinct subjects $\ge 28$).
- **Strict Accessibility:** 10/10 WCAG AA contrast compliance (14.95:1 ink-to-paper), full keyboard navigability, and responsive down to 320 px viewports.

---

## Slide 8: Cultural Fidelity, Ethics & Honest Limits
**Human-Centered Heritage Preservation**
- **Zero Hallucinated Culture:** 15 real Kerala cultural works verified from official academic and governmental sources (Kerala Kalamandalam, Kerala Folklore Academy, GI Registry of India).
- **Enforced Wording Invariant:** Automated tests enforce zero usage of possessive legalistic words ("owner", "ownership", "stolen", "infringement", "authentic").
- **Honest Disclaimers:** Stated snapshot, not legal advice; tamper-evident history, not tamper-proof claims; human-review pointers, not automatic copyright detection.

---

## Slide 9: Impact & Roadmap
**Empowering Tradition Bearers & Creators**
- **Immediate Value:** Solves ambiguity for designers, educators, and publishers seeking to credit Indian heritage responsibly.
- **Roadmap:**
  - Malayalam language localization for grassroots community participation.
  - Museum & temple committee self-governance portals.
  - Decentralized community verification consensus.
- **Open Source:** MIT licensed at `https://github.com/Abhin-Krishna-MP/Mudra`
