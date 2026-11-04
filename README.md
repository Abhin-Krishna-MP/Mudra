# Mudra — Cultural Passports

> ART//CODE 2026 · PS-03 **Credit the Culture** · Team: Abhin + Alin · MIT

## 1. Project Overview
Mudra gives every cultural work a public **Cultural Passport**: who it comes from, where the information comes from, and what the creators/community **and** the file licence say you may do with it. The Reuse Studio turns both layers into one plain answer ("Ask first, because the community has not stated whether commercial use is acceptable") plus a ready credit line and a credit card with a QR code. Reviewers approve records and resolve reports; every step is written to a hash-linked history anyone can verify.

Mudra is not a copyright detector and does not establish legal ownership. It records what is stated so people can ask before they reuse. Not related to any financial scheme.

## 2. Problem Statement
PS-03: people reuse cultural imagery without knowing who it comes from or what its creators and licence allow. Credit gets lost, communities are not asked, and licence terms are mixed up with cultural wishes.

## 3. Key Features
*(List only what is live when you submit. Status of this starter build in brackets.)*

**Tier 1 (core)** — catalogue + fuzzy search with spelling aliases [built]; Cultural Passport `/r/[id]` [built]; two-layer permissions [built, tested]; Reuse Studio with 6 uses [built, tested]; 4 credit-line formats [built, tested]; credit card PNG with QR [written, needs first run]; submit form → pending [built]; report form (+ correction request) [built]; reviewer console (approve / request changes / remove / verify with evidence / resolve) [built]; hash-linked history + timeline [built, tested]; Verify page with in-browser file hash [built]; About & limits [built]; sourced seed records [**to do: 0 of 15 real records; only the invented sandbox record exists**].

**Tier 2** — Check an image (exact hash + dHash "possible match") [built; thresholds unmeasured on real fixtures]; tamper demo `npm run tamper-demo` [built, runs]; Ed25519 signatures [built; off until a key is set]; sensitivity levels (`restricted` hides the image everywhere) [built, tested]; identity seal [not started].

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
git clone <repo> && cd mudra
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
Reviewer demo login: `reviewer@mudra.demo` + the throwaway password you set in `DEMO_REVIEWER_PASSWORD` when seeding (demo data only; put the real throwaway value here before submission). Create real reviewers with `ADMIN_PASSWORD=… npm run create-admin -- you@x.org "Name" reviewer`.
Flows: search → open a passport → pick a use in the Reuse Studio → copy the credit line / download the card → report a problem → sign in at `/review` to approve, verify or resolve → open `/verify/<id>`.

## 9. Demonstration Screenshots
*(Add real screenshots from the live site here: catalogue, passport, Reuse Studio "Ask first", reviewer console, verify page.)*

## 10. Team Members
Abhin — schema, permission engine, audit chain, auth, actions, image pipeline, deploy. Alin — design system, catalogue, passport, Reuse Studio, reviewer/timeline/verify UI, accessibility, slides and video.

## 11. Limitations & Future Scope
See the in-app About page. In short: permissions are stated snapshots, not legal advice; the history is tamper-evident, not tamper-proof; image matching misses heavy edits; the licence table needs checking against full licence texts; rate limiting is best-effort. Future: identity seal, corrections workflow, private status links, Malayalam labels, community-reviewed records.

## 12. License & Attribution
Code: MIT (see `LICENSE`). Every seed image's source and licence is listed in `data/seed/sources.md`. **AI-tooling disclosure:** AI coding tools were used to write code. No cultural facts, sources, permissions or licences were written by AI; those come from cited sources written and checked by the team. *(Add the organisers' reply here once received.)*
# Mudra
