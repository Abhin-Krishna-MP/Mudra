import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allFormats, escapeHtml } from '../src/lib/credit';
import { searchRecords } from '../src/lib/search';

const base = { title: 'Theyyam <b>', credits: [{ name: 'A & B', role: 'Performer' }, { name: 'Kavu Committee', role: 'Custodian', collective: true }], licence: 'CC-BY-4.0' as const, attributionRequired: true, recordUrl: 'https://mudra.example/r/MDR-2026-0001', recordId: 'MDR-2026-0001' };

test('credit formats include the record URL and escape HTML', () => {
  const f = allFormats(base);
  for (const k of ['plain', 'short', 'markdown', 'html'] as const) assert.ok(f[k].includes(base.recordUrl), k);
  assert.ok(f.html.includes('A &amp; B') && f.html.includes('Theyyam &lt;b&gt;'));
  assert.ok(!f.html.includes('<b>'));
  assert.equal(f.required, true);
});
test('credit changes with credits and attribution_required', () => {
  const none = allFormats({ ...base, credits: [], licence: 'CC0', attributionRequired: false });
  assert.match(none.plain, /not yet credited/);
  assert.equal(none.required, false);
  assert.equal(escapeHtml(`"'<>&`), '&quot;&#39;&lt;&gt;&amp;');
});

const items = [
  { id: 'MDR-2026-0001', title: 'Theyyam of Kannur', region: 'Kannur', workType: 'ritual', parties: ['Kavu Committee'] },
  { id: 'MDR-2026-0002', title: 'Kasavu saree weave', region: 'Thiruvananthapuram', workType: 'textile', parties: ['Balaramapuram weavers'] },
  { id: 'MDR-2026-0003', title: 'Aranmula kannadi', region: 'Pathanamthitta', workType: 'craft', parties: ['Aranmula artisans'] },
];
test('search: exact ID first, alias spelling, fuzzy, filters', () => {
  assert.equal(searchRecords(items, 'MDR-2026-0003')[0].id, 'MDR-2026-0003');
  assert.equal(searchRecords(items, 'Teyyam')[0].id, 'MDR-2026-0001');
  assert.equal(searchRecords(items, 'kasavoo')[0].id, 'MDR-2026-0002');
  assert.equal(searchRecords(items, 'aranmla')[0].id, 'MDR-2026-0003');
  assert.equal(searchRecords(items, 'weavers')[0].id, 'MDR-2026-0002');
  assert.equal(searchRecords(items, 't')[0].id, 'MDR-2026-0001');
  assert.equal(searchRecords(items, 'k')[0].id, 'MDR-2026-0002');
  assert.equal(searchRecords(items, '0003')[0].id, 'MDR-2026-0003');
  assert.equal(searchRecords(items, '', { workType: 'craft' }).length, 1);
  assert.equal(searchRecords(items, 'zzzzzz').length, 0);
});
