
import type { Db } from './types';

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, value INTEGER NOT NULL)`,

  `CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, work_type TEXT NOT NULL, region TEXT NOT NULL, language TEXT NOT NULL DEFAULT '',
    cultural_context TEXT NOT NULL, context_sources_json TEXT NOT NULL DEFAULT '[]', source_url TEXT NOT NULL DEFAULT '',
    sensitivity TEXT NOT NULL DEFAULT 'public', submission_basis TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', verification_level TEXT NOT NULL DEFAULT 'unverified',
    disputed INTEGER NOT NULL DEFAULT 0, attribution_required INTEGER NOT NULL DEFAULT 1,
    licence TEXT NOT NULL, licence_source_note TEXT NOT NULL DEFAULT '',
    perm_share TEXT NOT NULL DEFAULT 'unspecified',
    perm_commercial TEXT NOT NULL DEFAULT 'unspecified',
    perm_adapt TEXT NOT NULL DEFAULT 'unspecified',
    perm_ai_training TEXT NOT NULL DEFAULT 'unspecified',
    custodian TEXT NOT NULL DEFAULT '', is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL, published_at TEXT,
    category TEXT NOT NULL DEFAULT '', revision_note TEXT NOT NULL DEFAULT '', author_id INTEGER
  )`,

  `CREATE TABLE IF NOT EXISTS credits (
    id INTEGER PRIMARY KEY AUTOINCREMENT, record_id TEXT NOT NULL REFERENCES records(id),
    name TEXT NOT NULL, role TEXT NOT NULL, collective INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES records(id), location TEXT NOT NULL, mime TEXT NOT NULL,
    alt TEXT NOT NULL, source_note TEXT NOT NULL DEFAULT '', sha256 TEXT NOT NULL, dhash TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 0, height INTEGER NOT NULL DEFAULT 0, bytes INTEGER NOT NULL DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, record_id TEXT NOT NULL, seq INTEGER NOT NULL,
    actor_role TEXT NOT NULL, actor_name TEXT NOT NULL, action TEXT NOT NULL, diff_json TEXT NOT NULL,
    prev_hash TEXT NOT NULL, hash TEXT NOT NULL, signature TEXT, key_id TEXT, created_at TEXT NOT NULL,
    UNIQUE (record_id, seq)
  )`,

  `CREATE TABLE IF NOT EXISTS flags (
    id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES records(id), type TEXT NOT NULL,
    text TEXT NOT NULL, reporter_contact TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'open',
    resolution_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, record_id TEXT NOT NULL REFERENCES records(id),
    source TEXT NOT NULL, url TEXT NOT NULL DEFAULT '', note TEXT NOT NULL, reviewer TEXT NOT NULL, created_at TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'author', password_hash TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT ''
  )`,

  `CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    work_type TEXT NOT NULL DEFAULT '',
    cultural_context TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT '',
    sensitivity TEXT NOT NULL DEFAULT 'public',
    submission_basis TEXT NOT NULL DEFAULT 'creator_submitted',
    licence TEXT NOT NULL DEFAULT 'CC-BY-4.0',
    licence_source_note TEXT NOT NULL DEFAULT '',
    attribution_required INTEGER NOT NULL DEFAULT 1,
    custodian TEXT NOT NULL DEFAULT '',
    context_sources_json TEXT NOT NULL DEFAULT '[]',
    source_url TEXT NOT NULL DEFAULT '',
    credits_json TEXT NOT NULL DEFAULT '[]',
    permissions_json TEXT NOT NULL DEFAULT '{}',
    asset_json TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    revision_note TEXT NOT NULL DEFAULT '',
    record_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS steward_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    id_document_url TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    reviewed_at TEXT
  )`,

  `CREATE INDEX IF NOT EXISTS idx_drafts_user ON drafts(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status)`,
  `CREATE INDEX IF NOT EXISTS idx_drafts_routing ON drafts(status, region, category)`,
  `CREATE INDEX IF NOT EXISTS idx_steward_applications_status ON steward_applications(status)`,
  `CREATE INDEX IF NOT EXISTS idx_steward_applications_user ON steward_applications(user_id)`,

  `CREATE INDEX IF NOT EXISTS idx_credits_record ON credits(record_id)`,
  `CREATE INDEX IF NOT EXISTS idx_flags_record ON flags(record_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assets_sha ON assets(sha256)`,

  /* A3: additional indexes for common query patterns */
  `CREATE INDEX IF NOT EXISTS idx_records_status ON records(status)`,
  `CREATE INDEX IF NOT EXISTS idx_records_region ON records(region)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_record_seq ON audit_events(record_id, seq)`,
  `CREATE INDEX IF NOT EXISTS idx_flags_status ON flags(status)`,
  `CREATE INDEX IF NOT EXISTS idx_assets_record ON assets(record_id)`,

  /* v1.1: permission request flow */
  `CREATE TABLE IF NOT EXISTS record_stewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT NOT NULL REFERENCES records(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    UNIQUE(record_id, user_id)
  )`,

  `CREATE TABLE IF NOT EXISTS permission_requests (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL REFERENCES records(id),
    use_key TEXT NOT NULL,
    scope_json TEXT NOT NULL DEFAULT '{}',
    requester_name TEXT NOT NULL,
    requester_contact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    decision_note TEXT NOT NULL DEFAULT '',
    conditions_json TEXT NOT NULL DEFAULT '[]',
    credit_text TEXT NOT NULL DEFAULT '',
    valid_from TEXT,
    valid_until TEXT,
    token_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    decided_at TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS grants (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES permission_requests(id),
    record_id TEXT NOT NULL REFERENCES records(id),
    payload_json TEXT NOT NULL,
    signature TEXT NOT NULL,
    key_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_requests_record ON permission_requests(record_id)`,
  `CREATE INDEX IF NOT EXISTS idx_requests_token ON permission_requests(token_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_stewards_record ON record_stewards(record_id)`,
  `CREATE INDEX IF NOT EXISTS idx_grants_record ON grants(record_id)`,
];

export async function migrate(db: Db) {
  for (const s of SCHEMA) await db.execute(s);

  // Safe idempotent column additions for existing deployments
  const safeAlters = [
    "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'author'",
    "ALTER TABLE users ADD COLUMN region TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE users ADD COLUMN category TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE records ADD COLUMN category TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE records ADD COLUMN revision_note TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE records ADD COLUMN author_id INTEGER",
    "ALTER TABLE drafts ADD COLUMN revision_note TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE drafts ADD COLUMN region TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE drafts ADD COLUMN category TEXT NOT NULL DEFAULT ''",
  ];

  for (const alter of safeAlters) {
    try {
      await db.execute(alter);
    } catch {
      // Column already exists or table structure already current
    }
  }
}
