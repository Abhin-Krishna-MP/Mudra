# Permissions model

Two independent layers, combined conservatively: **any "no" wins, then any "ask", else permitted.**

1. **File licence** — what the licence on the image file says (`src/lib/permissions.ts`, `LICENCES`).
2. **Cultural permission** — what the creators or community have said: share / commercial / adapt / AI training, each `permitted | not_permitted | unspecified`.

Uses and what they need: share online → share · teach → share · print on merchandise → share+commercial · remix → share+adapt · commercial remix → share+commercial+adapt · AI training → ai_training.
Restricted records never return "permitted" (always Ask first, image hidden publicly). Handle-with-care adds a note.

## Licence matrix — VERIFIED (plan 14.1, spec 12)
Verified against the official Creative Commons legal codes (CC0 1.0, CC BY 4.0, CC BY-SA 4.0, CC BY-NC 4.0, PDM 1.0).

| Licence | share | commercial | adapt | AI training | credit |
| --- | --- | --- | --- | --- | --- |
| CC0 / Public Domain Mark | yes | yes | yes | yes | not required |
| CC BY 4.0 | yes | yes | yes | ask (unaddressed in CC 4.0 text) | required |
| CC BY-SA 4.0 | yes | yes | yes (share-alike required) | ask (unaddressed in CC 4.0 text) | required |
| CC BY-NC 4.0 | yes | **no** | yes | ask | required |
| All rights reserved (with stated permission) | ask | ask | ask | ask | required |

Checked on: 2026-11-04 by: Abhin & Alin (confirmed conservative rule: all unaddressed/doubtful cells map to `ask`).
