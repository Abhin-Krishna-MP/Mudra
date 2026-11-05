import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

async function main() {
  mkdirSync('docs/screenshots', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const BASE = 'http://localhost:3000';

  console.log('Capturing screenshots from', BASE);

  // 1. Catalogue / Home
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'docs/screenshots/01-home-catalogue.png' });
  console.log('Captured 01-home-catalogue.png');

  // 2. Cultural Passport
  await page.goto(`${BASE}/r/MDR-2026-0001`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'docs/screenshots/02-cultural-passport.png' });
  console.log('Captured 02-cultural-passport.png');

  // 3. Reuse Studio
  await page.goto(`${BASE}/reuse`, { waitUntil: 'networkidle' });
  if (await page.$('#purpose')) {
    await page.selectOption('#purpose', 'print_merch');
  }
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'docs/screenshots/03-reuse-studio.png' });
  console.log('Captured 03-reuse-studio.png');

  // 4. Verify Page with Tamper Simulation
  await page.goto(`${BASE}/verify/MDR-DEMO-0001`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'docs/screenshots/04-verify-tamper.png' });
  console.log('Captured 04-verify-tamper.png');

  // 5. Reviewer Console
  await page.goto(`${BASE}/review`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'docs/screenshots/05-reviewer-console.png' });
  console.log('Captured 05-reviewer-console.png');

  // 6. Check An Image
  await page.goto(`${BASE}/check`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'docs/screenshots/06-check-image.png' });
  console.log('Captured 06-check-image.png');

  await browser.close();
  console.log('All screenshots captured successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
