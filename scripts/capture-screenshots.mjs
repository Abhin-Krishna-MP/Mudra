import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

async function main() {
  mkdirSync('docs/screenshots', { recursive: true });
  const browser = await chromium.launch();
  const BASE = 'http://localhost:3000';

  console.log('Capturing alternating Light / Dark v2.0 screenshots from', BASE);

  // Desktop Context (1440x900, 2x Retina DPR)
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  // Helper to open a page with specific theme
  async function capturePage(url, theme, outputPath, postAction = null) {
    const page = await context.newPage();
    await page.addInitScript((th) => {
      sessionStorage.setItem('mudraLoaderSeen', '1');
      localStorage.setItem('mudra-theme', th);
    }, theme);

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate((th) => {
      document.documentElement.setAttribute('data-theme', th);
      try {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.documentElement.classList.add('motion');
        }
      } catch (e) {}
    }, theme);

    await page.waitForTimeout(1000);
    if (postAction) {
      await postAction(page);
    }
    await page.screenshot({ path: outputPath });
    console.log(`Captured ${outputPath} (${theme} theme)`);
    await page.close();
  }

  // 1. LIGHT THEME: Home & Kathakali Backwaters Stage
  await capturePage(BASE, 'light', 'docs/screenshots/01-home-light.png');

  // 2. DARK THEME: Home & Theyyam 3D Stage with Padippura Master Navbar
  await capturePage(BASE, 'dark', 'docs/screenshots/02-home-dark.png');

  // 3. LIGHT THEME: Cultural Passport (/r/MDR-2026-0001) in Museum Parchment Style
  await capturePage(`${BASE}/r/MDR-2026-0001`, 'light', 'docs/screenshots/03-cultural-passport-light.png');

  // 4. DARK THEME: Live Registry Notifications Popover
  await capturePage(BASE, 'dark', 'docs/screenshots/04-live-notifications-dark.png', async (page) => {
    const bell = page.locator('.spot-bell');
    if (await bell.count() > 0) {
      await bell.click();
      await page.waitForTimeout(600);
    }
  });

  // 5. LIGHT THEME: Interactive Reuse Studio (/reuse)
  await capturePage(`${BASE}/reuse`, 'light', 'docs/screenshots/05-reuse-studio-light.png', async (page) => {
    const purposeSelect = page.locator('#purpose');
    if (await purposeSelect.count() > 0) {
      await purposeSelect.selectOption('print_merch');
      await page.waitForTimeout(600);
    }
  });

  // 6. DARK THEME: Verify Page with SHA-256 Audit Chain & Tamper Sim
  await capturePage(`${BASE}/verify/MDR-DEMO-0001`, 'dark', 'docs/screenshots/06-verify-tamper-dark.png');

  // 7. LIGHT THEME: Reviewer & Steward Governance Console (/review)
  await capturePage(`${BASE}/review`, 'light', 'docs/screenshots/07-reviewer-console-light.png', async (page) => {
    const email = page.locator('input[type="email"], input[name="email"]');
    const pass = page.locator('input[type="password"], input[name="password"]');
    if (await email.count() > 0 && await pass.count() > 0) {
      await email.fill('reviewer@mudra.demo');
      await pass.fill('DemoReviewerPass123!');
      await page.locator('button:has-text("Sign in")').click();
      await page.waitForTimeout(1200);
    }
  });

  // 8. DARK THEME: Check An Image Perceptual dHash Matcher (/check)
  await capturePage(`${BASE}/check`, 'dark', 'docs/screenshots/08-check-image-dark.png');

  // 9. LIGHT THEME: Mobile Viewport & Progressive Web App (PWA)
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.addInitScript(() => {
    sessionStorage.setItem('mudraLoaderSeen', '1');
    localStorage.setItem('mudra-theme', 'light');
  });
  await pageMobile.goto(BASE, { waitUntil: 'networkidle' });
  await pageMobile.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await pageMobile.waitForTimeout(1000);
  await pageMobile.screenshot({ path: 'docs/screenshots/09-mobile-pwa-light.png' });
  console.log('Captured docs/screenshots/09-mobile-pwa-light.png (light theme mobile)');
  await pageMobile.close();

  await browser.close();
  console.log('All alternating Light / Dark screenshots captured successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
