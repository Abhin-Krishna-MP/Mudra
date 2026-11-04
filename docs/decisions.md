# Decision log (one line each: date · decision · who)

- 2026-11-03 · Product name **Mudra** kept; "Not related to any financial scheme" line in About · Abhin + Alin
- 2026-11-03 · Signatures (Ed25519) are Tier 2 #3, wired only after gate G3 is green on live; chain verifies unsigned and signed events · plan v4
- 2026-11-03 · Fallbacks (max 60 min debugging, then switch): Blob fails → seed images in repo, uploads off live · `next/og` fails → pre-rendered card images · Ed25519 fails → chain only · `sharp` fails on Vercel → match at seed time / cut `/check` · plan v4
- 2026-11-03 · Capacity band: **TO FILL IN at the Day 1 capacity check** (≥65 / 50–64 / 40–49 / <40 hours each)
- 2026-11-03 · Starter-code deviations from plan stack (to keep zero-dependency, testable logic): raw SQL via `@libsql/client` instead of Drizzle; HMAC-signed cookie + scrypt instead of iron-session/bcryptjs; in-house fuzzy search with alias map instead of Fuse.js; plain CSS instead of Tailwind/shadcn; `node:test` instead of Vitest; hand-written validation instead of Zod. Revisit only if there is time. · starter build
- 2026-11-03 · `next/og` card uses its built-in font until an OFL font file is bundled (Alin, Day 3) · starter build
