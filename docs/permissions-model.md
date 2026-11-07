# Permissions Model & Dual-Layer Resolution Specification

Mudra evaluates two independent layers, combined conservatively:  
$$\mathbf{Any\ "no"\ wins,\ then\ any\ "ask",\ else\ permitted.}$$

---

## 1. The Two Independent Layers

1. **File Licence Layer:** What the copyright licence on the digital file explicitly permits (`src/lib/permissions.ts`, `LICENCES`).
2. **Cultural Permission Layer:** What the living community, artisan lineage, or tradition bearers have stated regarding the cultural work across four distinct capabilities:
   - `share` (sharing, digital display, educational presentation)
   - `commercial` (merchandise, packaging, commercial advertising)
   - `adapt` (derivative works, visual remixing, sampling)
   - `ai_training` (training machine-learning models, generative AI synthesis)
   
   Each capability can be in one of three stated positions:
   - `permitted` (explicit community consensus allows this use)
   - `not_permitted` (explicit community consensus forbids this use)
   - `unspecified` (the community has not stated a position)

---

## 2. Supported Reuse Scenarios & Capability Requirements

| Reuse Scenario | Required Capabilities | Typical Real-World Example |
|---|---|---|
| `share_online` | `share` | Social media tribute, personal blog post, non-commercial portfolio. |
| `teach` | `share` | Classroom curriculum, academic lecture, museum educational slides. |
| `print_merch` | `share` + `commercial` | Screen-printed T-shirts, retail tote bags, branded coffee mugs. |
| `remix` | `share` + `adapt` | Non-commercial digital collage, artistic vector remix, student video essay. |
| `commercial_remix` | `share` + `commercial` + `adapt` | Commercial film poster, merchandise remix, monetized album cover. |
| `ai_training` | `ai_training` | Generative image models, diffusion training sets, cultural LLM fine-tuning. |

### Special Invariants
- **Restricted Records:** Cultural records marked with `sensitivity: "restricted"` (sacred rituals, secret guild traditions) **never** return `permitted` under any circumstances. They always evaluate to `ask_first`, and their image asset is withheld from public streaming.
- **Handle With Care:** Records marked with `sensitivity: "handle_with_care"` append an explanatory cultural advisory note reminding creators of sacred associations.
- **Attribution Floor:** Even when a licence or cultural state permits reuse, Mudra requires attribution whenever the file licence requires it (`CC BY`, `CC BY-SA`, `CC BY-NC`) or when community guidelines request credit.

---

## 3. Verified Creative Commons & Public Domain Licence Matrix

*Verified against the official Creative Commons legal codes (CC0 1.0, CC BY 4.0, CC BY-SA 4.0, CC BY-NC 4.0, and PDM 1.0).*

| File Licence | share | commercial | adapt | AI training | Attribution Required |
|---|:---:|:---:|:---:|:---:|:---:|
| **CC0 1.0 / Public Domain Mark (PDM)** | yes | yes | yes | yes | Not required |
| **CC BY 4.0** | yes | yes | yes | ask *(unaddressed in CC 4.0 text)* | **Required** |
| **CC BY-SA 4.0** | yes | yes | yes *(share-alike mandatory)* | ask *(unaddressed in CC 4.0 text)* | **Required** |
| **CC BY-NC 4.0** | yes | **no** | yes | ask | **Required** |
| **All Rights Reserved (ARR with permission)** | ask | ask | ask | ask | **Required** |

*Conservative Rule: All unaddressed, ambiguous, or doubtful legal situations map strictly to `ask`.*

---

## 4. Integration with the Ask → Grant Consent Lifecycle (Move 1)

When the two-layer engine yields `ask_first`:
1. Mudra activates an in-app structured request form (`src/components/RequestPermissionForm.tsx`).
2. The user submits a 4-field request (name, private contact, project scope, duration).
3. The request is routed exclusively to the verified cultural steward associated with that record (`record_stewards` table).
4. If approved, the steward issues an **Ed25519 digitally signed Grant certificate** referencing the current audit chain head. The signed grant can be verified live online at `/g/[grantId]` or offline via `node scripts/verify-grant.mjs`.

---

## 5. Integration with the Machine Layer & W3C TDMRep (Move 2)

For automated systems and AI crawlers:
1. When a record's `perm_ai_training` is `not_permitted` or `unspecified`, Mudra automatically lists the record ID in `/.well-known/tdmrep.json` under `tdm-reservation: 1`.
2. Image endpoints (`/api/assets/[id]`) emit HTTP response headers:
   ```http
   tdm-reservation: 1
   tdm-policy: /developers#tdm-policy
   ```
3. Platforms can query `POST /api/v1/lookup` in batches of up to 50 hashes to receive the exact dual-layer verdict without uploading user image bytes.

---

## 6. Formal Verification

The mathematical correctness of the permission engine is verified by exhaustive automated property tests (`tests/permissions.test.ts`):
- Evaluates all $6\text{ uses} \times 6\text{ licences} \times 3^4\text{ cultural states} \times 2\text{ attribution options} \times 3\text{ sensitivities} = 17,496$ combinations.
- Validates the core mathematical invariant: **No combination where cultural permission or file licence is negative can ever evaluate to `permitted`.**

---

## 7. Author Submissions & Cultural Steward Routing Specification

To maintain cultural authenticity without central gatekeeping, Mudra separates submission from stewardship through a role-based, tag-routed architecture:

```
[ Author (/submit) ]
      │  (Tag: Region + Category)
      ▼
[ Pending Draft ]
      │  (Exact Match Filter)
      ▼
[ Verified Cultural Steward (/review) ]
      ├── Approve  ──► Status: "approved" (Appends to SHA-256 Audit Chain)
      ├── Revise   ──► Status: "needs_revision" (Saves revision_note -> Author Dashboard)
      └── Deny     ──► Status: "removed"
```

### 1. Role-Based Access Control
- Public sign-ups (`/login?mode=signup`) are automatically assigned the `author` role.
- Submissions are restricted to verified authors; `/submit` is intercepted by Edge Middleware and verified in server actions against the active database state.

### 2. Tag Matching & Steward Routing
- Each submission requires a declared geographical `region` and cultural `category`.
- When stewards access `/review`, pending drafts are filtered at the database level so stewards only review works within their cultural domain:
  $$\text{Draft Filter: } \text{status} = \text{'pending'} \land \text{region} = \text{steward.region} \land \text{category} = \text{steward.category}$$

### 3. Steward KYC Verification
- Authors can apply to become verified stewards at `/apply-steward` by uploading identity documents.
- Documents are saved in private, secure storage (never in public folders) and evaluated by admins on `/admin`.
- Upon approval, the user's role is atomically updated to `steward` with their designated region and category.

### 4. Asynchronous Feedback & Revision Loop
- Rather than requiring real-time chat, stewards enter structured revision notes and set status to `needs_revision`.
- The author sees the request on `/author/dashboard` and can reopen their draft at `/submit?edit=<id>`, make corrections, and resubmit directly back to `pending`.
