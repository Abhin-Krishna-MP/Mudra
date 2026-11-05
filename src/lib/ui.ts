/** Presentation helpers shared by the UI. Pure; no I/O. */

export const WORK_TYPE_LABEL: Record<string, string> = {
  ritual: 'Ritual Arts',
  performing: 'Performing Arts',
  visual: 'Visual Arts',
  craft: 'Crafts',
  textile: 'Textiles',
  other: 'Folk Arts',
};
/** Singular form used on tiles and the passport ("Ritual Art · Malabar"). */
export const WORK_TYPE_SINGULAR: Record<string, string> = {
  ritual: 'Ritual Art',
  performing: 'Performing Art',
  visual: 'Visual Art',
  craft: 'Craft Tradition',
  textile: 'Textile Tradition',
  other: 'Folk Art',
};
export const WORK_TYPE_ORDER = ['ritual', 'performing', 'visual', 'craft', 'textile', 'other'];

export const typeLabel = (t: string) => WORK_TYPE_LABEL[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
export const typeSingular = (t: string) => WORK_TYPE_SINGULAR[t] ?? typeLabel(t);

/** The matcher reports a difference score out of 64 (dHash). Shown to people as a similarity percentage. */
export const similarityPercent = (distance: number) => Math.max(0, Math.min(100, Math.round(((64 - distance) / 64) * 100)));

export const initials = (s: string) => s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
