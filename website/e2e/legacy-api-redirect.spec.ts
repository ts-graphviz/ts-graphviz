import { expect, test } from '@playwright/test';

// The API reference used to live at /ts-graphviz/; copy-api writes a redirect
// for every page (scripts/copy-api-reference.mts).

test('the old API reference address redirects to /api/', async ({ page }) => {
  await page.goto('/ts-graphviz/');
  await expect(page).toHaveURL(/\/api\/$/);
  await expect(page.locator('.col-content h1').first()).toBeVisible();
});

test('old page addresses keep their page and fragment', async ({ page }) => {
  await page.goto('/api/');
  const href = await page
    .locator('#tsd-nav-container a[href*="modules/"]')
    .first()
    .getAttribute('href');
  expect(href).toBeTruthy();
  const path = new URL(href ?? '', page.url()).pathname.replace(/^\/api\//, '');
  await page.goto(`/ts-graphviz/${path}#section`);
  // `docusaurus serve` drops the .html that GitHub Pages keeps.
  const withoutHtml = (p: string) => p.replace(/\.html$/, '');
  await page.waitForURL(
    (url) =>
      withoutHtml(url.pathname) === `/api/${withoutHtml(path)}` &&
      url.hash === '#section',
  );
});
