import { test, expect } from '@playwright/test';
// Needs seeded records (npm run seed). Replace "Teyyam" target with a real seeded record once added.
test('search → passport → Reuse Studio (commercial) → Ask first → copy credit line', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByLabel(/Search by title/).fill('Teyyam');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('link', { name: /Theyyam/i }).first().click();
  await page.getByRole('link', { name: /Print on merchandise/ }).click();
  await expect(page.getByRole('status').filter({ hasText: /Ask first|Not permitted/ })).toBeVisible();
  await page.getByRole('button', { name: /Copy plain text/ }).click();
  await expect(page.getByRole('button', { name: /Copied/ })).toBeVisible();
});
