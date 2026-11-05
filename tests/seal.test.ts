import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSealSvg } from '../src/lib/seal';

test('deterministic identity seal gives byte-identical SVG for same inputs (Tier 2 #4 / L13)', () => {
  const inputA = {
    id: 'MDR-2026-0001',
    credits: [
      { name: 'Kathakali tradition bearers', role: 'Tradition bearers' },
      { name: 'Abhisheka Kumar', role: 'Photographer' },
    ],
    label: 'Verified by a reviewer',
  };

  const svg1 = generateSealSvg(inputA);
  const svg2 = generateSealSvg(inputA);

  assert.equal(svg1, svg2, 'byte-identical output for same inputs');
  assert.ok(svg1.startsWith('<svg'), 'is an SVG element');
  assert.ok(svg1.includes('role="img"'), 'accessible role');
  assert.ok(svg1.includes('aria-label="Verified by a reviewer"'), 'accessible label');
  assert.ok(svg1.includes('MDR-2026-0001'), 'contains the record ID');

  // Order independence of credits
  const inputShuffled = {
    id: 'MDR-2026-0001',
    credits: [
      { name: 'Abhisheka Kumar', role: 'Photographer' },
      { name: 'Kathakali tradition bearers', role: 'Tradition bearers' },
    ],
    label: 'Verified by a reviewer',
  };
  const svgShuffled = generateSealSvg(inputShuffled);
  assert.equal(svg1, svgShuffled, 'canonical sorting of credits ensures identical output');

  // Different inputs produce different outputs
  const inputB = {
    id: 'MDR-2026-0002',
    credits: [{ name: 'Kasavu weavers', role: 'Tradition bearers' }],
  };
  const svgB = generateSealSvg(inputB);
  assert.notEqual(svg1, svgB, 'different record ID yields distinct seal');
});
