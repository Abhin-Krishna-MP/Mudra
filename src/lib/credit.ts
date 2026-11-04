import { LICENCES, type LicenceId } from './permissions';

export interface CreditParty { name: string; role: string; collective?: boolean }
export interface CreditInput {
  title: string;
  credits: CreditParty[];
  licence: LicenceId;
  attributionRequired: boolean;
  recordUrl: string;
  recordId: string;
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const partyText = (c: CreditParty) => `${c.name} (${c.role})`;

function creditedPhrase(credits: CreditParty[]): string {
  if (!credits.length) return 'Creators not yet credited';
  return credits.map(partyText).join('; ');
}

export function plainCredit(i: CreditInput): string {
  const lic = LICENCES[i.licence];
  const parts = [`"${i.title}"`, `Credit: ${creditedPhrase(i.credits)}`, `Image licence: ${lic.label}`, `Record: ${i.recordUrl}`];
  return parts.join('. ') + '.';
}

export function shortCredit(i: CreditInput): string {
  const first = i.credits[0];
  return `${i.title}${first ? ` — ${first.name}` : ''} · ${i.recordId} · ${i.recordUrl}`;
}

export function markdownCredit(i: CreditInput): string {
  const lic = LICENCES[i.licence];
  const licText = lic.url ? `[${lic.label}](${lic.url})` : lic.label;
  return `*${i.title}* — credit: ${creditedPhrase(i.credits)}. Licence: ${licText}. [Cultural Passport ${i.recordId}](${i.recordUrl})`;
}

export function htmlCredit(i: CreditInput): string {
  const lic = LICENCES[i.licence];
  const licHtml = lic.url
    ? `<a href="${escapeHtml(lic.url)}">${escapeHtml(lic.label)}</a>`
    : escapeHtml(lic.label);
  return `<p class="credit"><em>${escapeHtml(i.title)}</em> — credit: ${escapeHtml(creditedPhrase(i.credits))}. Licence: ${licHtml}. <a href="${escapeHtml(i.recordUrl)}">Cultural Passport ${escapeHtml(i.recordId)}</a></p>`;
}

export function allFormats(i: CreditInput) {
  return {
    plain: plainCredit(i),
    short: shortCredit(i),
    markdown: markdownCredit(i),
    html: htmlCredit(i),
    /** attribution is always shown; this says whether the licence or record makes it required */
    required: LICENCES[i.licence].attribution || i.attributionRequired,
  };
}
