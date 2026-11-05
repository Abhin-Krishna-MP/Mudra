import { PageSheet } from '@/components/PageSheet';
import { CopyButton } from '@/components/CopyButton';
import { siteOrigin } from '@/lib/site';

export const metadata = { title: 'For Platforms & Developers' };

const BASE_URL = 'https://mudra-one-ivory.vercel.app';

const CURL_LOOKUP = `curl -X POST ${BASE_URL}/api/v1/lookup \\
  -H "Content-Type: application/json" \\
  -d '{
    "queries": [
      {
        "sha256": "4b68019a3b2b4e85973977759ad2313b2c63dfc96b6fbcf265bc7c5b16e8b788",
        "dhash": "8c4e4e4e66667070"
      }
    ]
  }'`;

const CURL_MANIFEST = `curl ${BASE_URL}/api/v1/manifest.json`;

const CURL_TDMREP = `curl ${BASE_URL}/.well-known/tdmrep.json`;

const CURL_OFFLINE = `node scripts/verify-grant.mjs grant.json public-key.pem`;

export default function DevelopersPage() {
  const origin = siteOrigin();

  return (
    <div className="wrap page">
      <PageSheet
        title="For Platforms & Developers"
        lede="Machine-readable interfaces, hash-only lookup APIs, signed manifests, and AI-training signals for platforms, archives and dataset builders."
      >
        <div className="prose">
          <h2>1. Hash-Only Lookup API</h2>
          <p>
            Platforms, design marketplaces, and dataset builders can query cultural registration and stated AI stances
            without uploading user images. Send SHA-256 byte hashes and 16-character perceptual dHash values in batches of up to 50.
          </p>

          <div className="panel ui" style={{ margin: '14px 0' }}>
            <pre style={{ overflowX: 'auto', fontSize: '0.82rem', margin: 0 }}>{CURL_LOOKUP}</pre>
            <div style={{ marginTop: 10 }}>
              <CopyButton text={CURL_LOOKUP} label="Copy curl command" />
            </div>
          </div>

          <p className="hint">
            <strong>Response:</strong> Returns whether the hash is registered, the record ID, title, stated commercial position,
            and stated AI-training stance (<code>permitted</code>, <code>not_permitted</code>, or <code>unspecified</code>).
          </p>

          <h2 style={{ marginTop: 32 }}>2. Signed Manifest</h2>
          <p>
            Dataset builders and AI training auditors can pin a signed snapshot of all registered works.
            The manifest lists record IDs, image hashes, stated permissions, and latest audit chain heads, signed with our Ed25519 key.
          </p>

          <div className="panel ui" style={{ margin: '14px 0' }}>
            <pre style={{ overflowX: 'auto', fontSize: '0.82rem', margin: 0 }}>{CURL_MANIFEST}</pre>
            <div style={{ marginTop: 10 }}>
              <CopyButton text={CURL_MANIFEST} label="Copy curl command" />
            </div>
          </div>

          <p>
            <a href="/api/v1/manifest.json" target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
              View live manifest JSON →
            </a>
          </p>

          <h2 id="tdm-policy" style={{ marginTop: 32 }}>3. W3C TDMRep AI-Training Signal</h2>
          <p>
            Mudra publishes Text and Data Mining (TDM) reservations via W3C TDMRep specifications.
            Records where the community has not explicitly permitted AI training carry a <code>tdm-reservation: 1</code> directive.
          </p>

          <div className="panel ui" style={{ margin: '14px 0' }}>
            <pre style={{ overflowX: 'auto', fontSize: '0.82rem', margin: 0 }}>{CURL_TDMREP}</pre>
            <div style={{ marginTop: 10 }}>
              <CopyButton text={CURL_TDMREP} label="Copy curl command" />
            </div>
          </div>

          <p>
            Every image served at <code>/api/assets/[id]</code> also emits the HTTP response header:
            <br />
            <code>tdm-reservation: 1</code>
          </p>

          <h2 style={{ marginTop: 32 }}>4. Offline Grant Verification</h2>
          <p>
            Permission grants issued to reusers can be verified completely offline with zero network connectivity.
            Grants are canonical JSON (RFC 8785) signed with Ed25519.
          </p>

          <div className="panel ui" style={{ margin: '14px 0' }}>
            <pre style={{ overflowX: 'auto', fontSize: '0.82rem', margin: 0 }}>{CURL_OFFLINE}</pre>
            <div style={{ marginTop: 10 }}>
              <CopyButton text={CURL_OFFLINE} label="Copy command" />
            </div>
          </div>

          <h2 style={{ marginTop: 32 }}>Honest Limits & Standards Framing</h2>
          <div className="panel ui" style={{ borderLeft: '3px solid var(--accent)' }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>
                <strong>TDMRep is a Community Group report:</strong> W3C TDMRep is published by a W3C Community Group,
                not a formal W3C Recommendation. It was designed around European Union opt-out laws (DSM Directive Art. 4).
                It functions only when crawlers voluntarily inspect and respect it. Mudra publishes the community's stated preference; it does not enforce it.
              </li>
              <li>
                <strong>Grants are recorded statements:</strong> A grant is not a commercial copyright transfer or legal contract.
                It records what a named steward stated at a point in time for a specified project scope.
              </li>
              <li>
                <strong>Hash privacy:</strong> Mudra never stores or reconstructs imagery from lookup queries. Only cryptographic hashes are compared.
              </li>
              <li>
                <strong>Rate limits:</strong> Lookup queries are rate-limited to 60 requests per minute per IP address.
              </li>
            </ul>
          </div>
        </div>
      </PageSheet>
    </div>
  );
}
