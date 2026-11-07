import type { Capability, CulturalState, LicenceId, Sensitivity } from './permissions';

export type Status = 'pending' | 'published' | 'needs_changes' | 'needs_revision' | 'removed';
export type Basis = 'creator_submitted' | 'custodian_submitted' | 'compiled_from_public_sources';
export type Role = 'author' | 'steward' | 'reviewer' | 'admin';
export interface Actor { role: string; name: string; id?: number }

export interface CreditView { name: string; role: string; collective: boolean }
export interface RecordView {
  id: string; title: string; workType: string; region: string; language: string;
  culturalContext: string; contextSources: string[]; sourceUrl: string;
  sensitivity: Sensitivity; submissionBasis: Basis; status: Status;
  verificationLevel: 'unverified' | 'verified'; disputed: boolean;
  credits: CreditView[];
  licence: LicenceId; attributionRequired: boolean; custodian: string;
  permissions: Record<Capability, CulturalState>;
  asset: { displayUrl: string | null; alt: string; sourceNote: string; hidden: boolean } | null;
  latestAuditHash: string | null; publishedAt: string | null; isDemo: boolean;
  revisionNote?: string;
  category?: string;
}
export interface RecordSummary {
  id: string; title: string; workType: string; region: string; primaryCredit: string; parties: string[];
  thumbUrl: string | null; alt: string; permissions: Record<Capability, CulturalState>; verificationLevel: string;
  category?: string;
  revisionNote?: string;
}
export interface DraftItem {
  id: string;
  userId?: number;
  title: string;
  region: string;
  category: string;
  workType?: string;
  culturalContext?: string;
  status: Status;
  revisionNote?: string;
  createdAt: string;
  updatedAt?: string;
}
export interface ActionResult { ok: boolean; error?: string; id?: string; fieldErrors?: Record<string, string> }
export interface TimelineItem { seq: number; at: string; role: string; actor: string; action: string; summary: string; hashOk: boolean | null }
