/**
 * Permission engine. PURE: no I/O, no randomness. Two independent layers:
 *   1. File licence  (what the licence on the image file says)
 *   2. Cultural permission (what the creators / community have stated)
 * The combined verdict is conservative: any "no" wins, then any "ask", else permitted.
 *
 * The licence matrix below is a first reading and MUST be checked against the
 * real licence texts (plan section 14.1) before it is trusted. Record the result
 * in docs/permissions-model.md. Where unsure, a cell is 'ask'.
 */

export type Capability = 'share' | 'commercial' | 'adapt' | 'ai_training';
export type Use =
  | 'share_online'
  | 'teach'
  | 'print_merch'
  | 'remix'
  | 'commercial_remix'
  | 'ai_training';
export type CulturalState = 'permitted' | 'not_permitted' | 'unspecified';
export type LicenceId =
  | 'CC0'
  | 'PDM'
  | 'CC-BY-4.0'
  | 'CC-BY-SA-4.0'
  | 'CC-BY-NC-4.0'
  | 'ARR';
export type Cell = 'yes' | 'no' | 'ask';
export type Verdict = 'permitted' | 'ask_first' | 'not_permitted';
export type Sensitivity = 'public' | 'handle_with_care' | 'restricted';

export const CAPABILITIES: Capability[] = ['share', 'commercial', 'adapt', 'ai_training'];
export const CAP_PHRASE: Record<Capability, string> = {
  share: 'sharing',
  commercial: 'commercial use',
  adapt: 'adaptation',
  ai_training: 'use for AI training',
};

export const USES: Record<Use, { label: string; needs: Capability[] }> = {
  share_online: { label: 'Share online', needs: ['share'] },
  teach: { label: 'Teach or study', needs: ['share'] },
  print_merch: { label: 'Print on merchandise (commercial)', needs: ['share', 'commercial'] },
  remix: { label: 'Adapt or remix (non-commercial)', needs: ['share', 'adapt'] },
  commercial_remix: { label: 'Adapt for commercial work', needs: ['share', 'commercial', 'adapt'] },
  ai_training: { label: 'Train an AI model', needs: ['ai_training'] },
};
export const USE_IDS = Object.keys(USES) as Use[];

export const LICENCES: Record<
  LicenceId,
  { label: string; url: string; attribution: boolean; shareAlike: boolean; cells: Record<Capability, Cell> }
> = {
  CC0: {
    label: 'CC0 1.0 (public domain dedication)',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution: false,
    shareAlike: false,
    cells: { share: 'yes', commercial: 'yes', adapt: 'yes', ai_training: 'yes' },
  },
  PDM: {
    label: 'Public Domain Mark 1.0',
    url: 'https://creativecommons.org/publicdomain/mark/1.0/',
    attribution: false,
    shareAlike: false,
    cells: { share: 'yes', commercial: 'yes', adapt: 'yes', ai_training: 'yes' },
  },
  'CC-BY-4.0': {
    label: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: true,
    shareAlike: false,
    cells: { share: 'yes', commercial: 'yes', adapt: 'yes', ai_training: 'ask' },
  },
  'CC-BY-SA-4.0': {
    label: 'CC BY-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    attribution: true,
    shareAlike: true,
    cells: { share: 'yes', commercial: 'yes', adapt: 'yes', ai_training: 'ask' },
  },
  'CC-BY-NC-4.0': {
    label: 'CC BY-NC 4.0',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    attribution: true,
    shareAlike: false,
    cells: { share: 'yes', commercial: 'no', adapt: 'yes', ai_training: 'ask' },
  },
  ARR: {
    label: 'All rights reserved (used with the photographer’s stated permission)',
    url: '',
    attribution: true,
    shareAlike: false,
    cells: { share: 'ask', commercial: 'ask', adapt: 'ask', ai_training: 'ask' },
  },
};
export const LICENCE_IDS = Object.keys(LICENCES) as LicenceId[];

export interface EvaluateInput {
  use: Use;
  licence: LicenceId;
  cultural: Record<Capability, CulturalState>;
  attributionRequired: boolean;
  sensitivity: Sensitivity;
}

export interface LayerResult {
  verdict: Verdict;
  statement: string;
  perCapability: Array<{ capability: Capability; state: string }>;
}

export interface EvaluateOutput {
  /** true only when the combined verdict is "permitted" */
  available: boolean;
  verdict: Verdict;
  guidance: string;
  licence: LayerResult;
  cultural: LayerResult;
  creditRequired: boolean;
  nextAction: string;
  notes: string[];
}

const RANK: Record<Verdict, number> = { permitted: 0, ask_first: 1, not_permitted: 2 };
const worst = (a: Verdict, b: Verdict): Verdict => (RANK[a] >= RANK[b] ? a : b);
const cellToVerdict = (c: Cell): Verdict => (c === 'yes' ? 'permitted' : c === 'no' ? 'not_permitted' : 'ask_first');
const culturalToVerdict = (s: CulturalState): Verdict =>
  s === 'permitted' ? 'permitted' : s === 'not_permitted' ? 'not_permitted' : 'ask_first';

export const VERDICT_LABEL: Record<Verdict, string> = {
  permitted: 'Permitted as stated',
  ask_first: 'Ask first',
  not_permitted: 'Not permitted as stated',
};

export function evaluate(input: EvaluateInput): EvaluateOutput {
  const use = USES[input.use];
  const lic = LICENCES[input.licence];
  const notes: string[] = [];

  const licPer = use.needs.map((c) => ({ capability: c, cell: lic.cells[c] }));
  const culPer = use.needs.map((c) => ({ capability: c, state: input.cultural[c] }));

  const licVerdict = licPer.reduce<Verdict>((v, p) => worst(v, cellToVerdict(p.cell)), 'permitted');
  const culVerdict = culPer.reduce<Verdict>((v, p) => worst(v, culturalToVerdict(p.state)), 'permitted');

  let verdict = worst(licVerdict, culVerdict);
  let restrictedApplied = false;
  if (input.sensitivity === 'restricted' && verdict === 'permitted') {
    verdict = 'ask_first';
    restrictedApplied = true;
  }
  if (input.sensitivity === 'handle_with_care') {
    notes.push('This record is marked handle with care. Do not alter, crop or trivialise sacred imagery.');
  }
  if (lic.shareAlike && (input.use === 'remix' || input.use === 'commercial_remix')) {
    notes.push('The file licence is share-alike: adaptations must be shared under the same licence.');
  }

  const licenceStatement =
    licVerdict === 'permitted'
      ? `The file licence (${lic.label}) allows this use.`
      : licVerdict === 'not_permitted'
        ? `The file licence (${lic.label}) does not allow this use.`
        : `The file licence (${lic.label}) does not clearly address this use.`;
  const culturalStatement =
    culVerdict === 'permitted'
      ? 'The creators or community have said this use is acceptable.'
      : culVerdict === 'not_permitted'
        ? 'The creators or community have said this use is not acceptable.'
        : 'Not stated by the creator or community.';

  const creditRequired = lic.attribution || input.attributionRequired;

  // Reason text: the first blocking cause, most severe first.
  const reasons: string[] = [];
  for (const p of culPer) {
    if (p.state === 'not_permitted')
      reasons.push(`the creators or community have said ${CAP_PHRASE[p.capability]} is not acceptable`);
  }
  for (const p of licPer) {
    if (p.cell === 'no') reasons.push(`the file licence (${lic.label}) does not allow ${CAP_PHRASE[p.capability]}`);
  }
  if (verdict !== 'not_permitted') {
    for (const p of culPer) {
      if (p.state === 'unspecified')
        reasons.push(`the community has not stated whether ${CAP_PHRASE[p.capability]} is acceptable`);
    }
    for (const p of licPer) {
      if (p.cell === 'ask') reasons.push(`the file licence does not clearly cover ${CAP_PHRASE[p.capability]}`);
    }
    if (restrictedApplied) reasons.push('this record is marked restricted');
  }

  let nextAction: string;
  let guidance: string;
  if (verdict === 'permitted') {
    nextAction = creditRequired
      ? 'Copy the credit line and keep it with the work.'
      : 'No credit is required by the licence; crediting the community is still recommended.';
    guidance = `${use.label}: ${VERDICT_LABEL.permitted}. ${nextAction}`;
  } else if (verdict === 'not_permitted') {
    nextAction = 'Choose a different use, or contact the stated custodian to ask.';
    guidance = `${use.label}: ${VERDICT_LABEL.not_permitted}, because ${reasons[0]}. Next step: ${nextAction.charAt(0).toLowerCase()}${nextAction.slice(1)}`;
  } else {
    nextAction = 'Contact the stated custodian before reuse. Do not assume permission.';
    guidance = `${use.label}: ${VERDICT_LABEL.ask_first}, because ${reasons[0]}. Next step: contact the stated custodian.`;
  }

  return {
    available: verdict === 'permitted',
    verdict,
    guidance,
    licence: {
      verdict: licVerdict,
      statement: licenceStatement,
      perCapability: licPer.map((p) => ({ capability: p.capability, state: p.cell })),
    },
    cultural: {
      verdict: culVerdict,
      statement: culturalStatement,
      perCapability: culPer.map((p) => ({ capability: p.capability, state: p.state })),
    },
    creditRequired,
    nextAction,
    notes,
  };
}
