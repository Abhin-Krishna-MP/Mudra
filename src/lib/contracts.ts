import type { Capability, CulturalState, LicenceId, Sensitivity } from './permissions';

export type Status = 'pending' | 'published' | 'needs_changes' | 'removed';
export type Basis = 'creator_submitted' | 'custodian_submitted' | 'compiled_from_public_sources';
export type Role = 'author' | 'reviewer' | 'admin';
export interface Actor { role: string; name: string }

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
}
export interface RecordSummary {
  id: string; title: string; workType: string; region: string; primaryCredit: string; parties: string[];
  thumbUrl: string | null; alt: string; permissions: Record<Capability, CulturalState>; verificationLevel: string;
}
export interface ActionResult { ok: boolean; error?: string; id?: string; fieldErrors?: Record<string, string> }
export interface TimelineItem { seq: number; at: string; role: string; actor: string; action: string; summary: string; hashOk: boolean | null }
