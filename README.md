# Mudra — Cultural Passports

> ART//CODE 2026 · PS-03 **Credit the Culture** · Team: Abhin + Alin · MIT

## 1. Project Overview
Mudra gives every cultural work a public **Cultural Passport**: who it comes from, where the information comes from, and what the creators/community **and** the file licence say you may do with it. The Reuse Studio turns both layers into one plain answer ("Ask first, because the community has not stated whether commercial use is acceptable") plus a ready credit line and a credit card with a QR code. Reviewers approve records and resolve reports; every step is written to a hash-linked history anyone can verify.

Mudra is not a copyright detector and does not establish legal ownership. It records what is stated so people can ask before they reuse. Not related to any financial scheme.

## 2. Problem Statement
PS-03: people reuse cultural imagery without knowing who it comes from or what its creators and licence allow. Credit gets lost, communities are not asked, and licence terms are mixed up with cultural wishes.

## 3. Key Features

**Tier 1 (core)** — catalogue + fuzzy search with spelling aliases [built, tested]; Cultural Passport `/r/[id]` [built]; two-layer permissions [built, tested with 17,496 property test combinations]; Reuse Studio with 6 uses [built, tested]; 4 credit-line formats [built, tested]; credit card PNG with QR [built, tested via next/og]; submit form → pending [built]; report form (+ correction request) [built]; reviewer console (approve / request changes / remove / verify with evidence / resolve) [built, tested on live Turso]; hash-linked history + timeline [built, tested on live Turso]; Verify page with in-browser file hash [built]; About & limits [built]; sourced seed records [10 real records live on Turso + 1 demo sandbox record].

**Tier 2** — Check an image (exact hash + dHash "possible match") [built; thresholds unmeasured on real fixtures]; tamper demo `npm run tamper-demo` [built, runs]; Ed25519 signatures [built; off until a key is set]; sensitivity levels (`restricted` hides the image everywhere) [built, tested]; identity seal [in progress].

## 4. Technology Stack
Next.js (App Router) + TypeScript · SQLite locally / Turso (libSQL) live · `sharp` · `next/og` + `qrcode` · Node `crypto` (SHA-256, Ed25519) + `canonicalize` · plain CSS · `node:test` + Playwright · Vercel + Turso + Vercel Blob.

## 5. System Architecture
```
Browser ── Next.js pages (server components)
              │  server actions: create / flag / review (role-guarded)
              ▼
         src/lib/repo.ts ──► DB (libSQL: records, credits, assets, flags, users, audit_events)
              │                  every change + its audit event commit in ONE transaction
              ├─ permissions.ts  pure two-layer engine
              ├─ chain.ts        SHA-256 hash chain (+ optional Ed25519 signatures)
              ├─ credit.ts       credit-line builders (HTML-escaped)
              └─ imagehash.ts    SHA-256 + dHash (sharp)
```

## 6. Installation & Setup
```bash
git clone https://github.com/Abhin-Krishna-MP/Mudra.git && cd Mudra
cp .env.example .env
npm install
npm run seed          # loads data/seed/records.json (+ demo reviewer if DEMO_REVIEWER_PASSWORD is set)
npm run dev           # http://localhost:3000
```
No keys are needed locally. Node 22.5+ required. `npm test` runs the logic tests; `npm run predeploy` = check-secrets + check-licences + test.

## 7. Environment Variables
| Name | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | `file:./data/mudra.db` locally, `libsql://…` on Turso | yes |
| `DATABASE_AUTH_TOKEN` | Turso token | live only |
| `SESSION_SECRET` | signs reviewer session cookies (long random string) | live (required in production) |
| `NEXT_PUBLIC_SITE_URL` | base URL in credit lines and QR codes | yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob for uploads (else `public/uploads` locally) | live |
| `SIGNING_PRIVATE_KEY`, `SIGNING_KEY_ID` | Ed25519 audit signing (`npm run gen-key`); empty = unsigned | optional |
| `DEMO_REVIEWER_PASSWORD` | used by `npm run seed` to create `reviewer@mudra.demo` | demo only |

## 8. Usage
Reviewer demo login: `reviewer@mudra.demo` / `DemoReviewerPass123!` (demo throwaway account for evaluation). Create real reviewers with:
```bash
ADMIN_PASSWORD=... npm run create-admin -- you@example.org "Your Name" reviewer
```
Flows: search → open a passport → pick a use in the Reuse Studio → copy the credit line / download the card → report a problem → sign in at `/review` to approve, verify or resolve → open `/verify/<id>`.

## 9. Demonstration Screenshots
*(Add real screenshots from the live site here: catalogue, passport, Reuse Studio "Ask first", reviewer console, verify page.)*

## 10. Team Members
- **Abhin** — schema, permission engine, audit chain, auth, actions, image pipeline, deploy.
- **Alin** — design system, catalogue, passport, Reuse Studio, reviewer/timeline/verify UI, accessibility, slides and video.

## 11. Limitations & Future Scope
See the in-app About page. In short: permissions are stated snapshots, not legal advice; the history is tamper-evident, not tamper-proof; image matching misses heavy edits; the licence table was checked against CC legal texts; rate limiting is best-effort. Future: identity seal, corrections workflow, private status links, Malayalam labels, community-reviewed records.

## 12. License & Attribution
Code: MIT (see `LICENSE`). Every seed image's source and licence is listed in `data/seed/sources.md`. **AI-tooling disclosure:** AI coding tools were used to write code. No cultural facts, sources, permissions or licences were written by AI; those come from cited sources written and checked by the team.
