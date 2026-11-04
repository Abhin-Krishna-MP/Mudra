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
    perm_share TEXT NOT NULL DEFAULT 'unspecified', perm_commercial TEXT NOT NULL DEFAULT 'unspecified',
    perm_adapt TEXT NOT NULL DEFAULT 'unspecified', perm_ai_training TEXT NOT NULL DEFAULT 'unspecified',
    custodian TEXT NOT NULL DEFAULT '', is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL, published_at TEXT
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
    role TEXT NOT NULL, password_hash TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_credits_record ON credits(record_id)`,
  `CREATE INDEX IF NOT EXISTS idx_flags_record ON flags(record_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assets_sha ON assets(sha256)`,
];

export async function migrate(db: Db) {
  for (const s of SCHEMA) await db.execute(s);
}
