import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

async function main() {
  mkdirSync('docs/screenshots', { recursive: true });
  const browser = await chromium.launch();
  const BASE = 'http://localhost:3000';

  console.log('Capturing fresh v2.0 screenshots from', BASE);

  // Desktop Context (1440x900, 2x Retina DPR)
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  // 1. Dark Home Page (Padippura Navbar + Theyyam 3D Stage + Embers)
  const pageDark = await context.newPage();
  await pageDark.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'dark');
  });
  await pageDark.goto(BASE, { waitUntil: 'networkidle' });
  await pageDark.waitForTimeout(1000);
  await pageDark.screenshot({ path: 'docs/screenshots/01-home-dark.png' });
  console.log('Captured 01-home-dark.png');

  // 2. Light Home & Catalogue (Padippura Navbar + Kathakali Stage + Cultural Records)
  const pageLight = await context.newPage();
  await pageLight.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'light');
  });
  await pageLight.goto(BASE, { waitUntil: 'networkidle' });
  await pageLight.waitForTimeout(1000);
  await pageLight.screenshot({ path: 'docs/screenshots/02-home-light.png' });
  console.log('Captured 02-home-light.png');

  // 3. Cultural Passport (/r/MDR-2026-0001)
  const pagePassport = await context.newPage();
  await pagePassport.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'dark');
  });
  await pagePassport.goto(BASE + '/r/MDR-2026-0001', { waitUntil: 'networkidle' });
  await pagePassport.waitForTimeout(800);
  await pagePassport.screenshot({ path: 'docs/screenshots/03-cultural-passport.png' });
  console.log('Captured 03-cultural-passport.png');

  // 4. Reuse Studio (/reuse)
  const pageReuse = await context.newPage();
  await pageReuse.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'dark');
  });
  await pageReuse.goto(BASE + '/reuse', { waitUntil: 'networkidle' });
  const purposeSelect = await pageReuse.locator('#purpose');
  if (await purposeSelect.count() > 0) {
    await purposeSelect.selectOption('print_merch');
  }
  await pageReuse.waitForTimeout(600);
  await pageReuse.screenshot({ path: 'docs/screenshots/04-reuse-studio.png' });
  console.log('Captured 04-reuse-studio.png');

  // 5. Live Notifications Popover
  const pageNotif = await context.newPage();
  await pageNotif.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'dark');
  });
  await pageNotif.goto(BASE, { waitUntil: 'networkidle' });
  await pageNotif.waitForTimeout(1000);
  const bell = pageNotif.locator('.spot-bell');
  if (await bell.count() > 0) {
    await bell.click();
    await pageNotif.waitForTimeout(600);
  }
  await pageNotif.screenshot({ path: 'docs/screenshots/05-live-notifications.png' });
  console.log('Captured 05-live-notifications.png');

  // 6. Verify Page with Tamper Simulation (/verify/MDR-DEMO-0001)
  const pageVerify = await context.newPage();
  await pageVerify.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'dark');
  });
  await pageVerify.goto(BASE + '/verify/MDR-DEMO-0001', { waitUntil: 'networkidle' });
  await pageVerify.waitForTimeout(800);
  await pageVerify.screenshot({ path: 'docs/screenshots/06-verify-tamper.png' });
  console.log('Captured 06-verify-tamper.png');

  // 7. Reviewer Console (/review)
  const pageReview = await context.newPage();
  await pageReview.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'dark');
  });
  await pageReview.goto(BASE + '/review', { waitUntil: 'networkidle' });
  await pageReview.waitForTimeout(800);
  await pageReview.screenshot({ path: 'docs/screenshots/07-reviewer-console.png' });
  console.log('Captured 07-reviewer-console.png');

  // 8. Check An Image (/check)
  const pageCheck = await context.newPage();
  await pageCheck.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'dark');
  });
  await pageCheck.goto(BASE + '/check', { waitUntil: 'networkidle' });
  await pageCheck.waitForTimeout(800);
  await pageCheck.screenshot({ path: 'docs/screenshots/08-check-image.png' });
  console.log('Captured 08-check-image.png');

  // 9. Mobile Viewport & PWA Responsive Layout
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'dark');
  });
  await pageMobile.goto(BASE, { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(1000);
  await pageMobile.screenshot({ path: 'docs/screenshots/09-mobile-pwa.png' });
  console.log('Captured 09-mobile-pwa.png');

  await browser.close();
  console.log('All fresh v2.0 screenshots captured successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
