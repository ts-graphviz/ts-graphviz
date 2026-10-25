import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll, isTouch } from './helpers';

// The typedoc output, copied into build/api/ (`pnpm copy-api`; typedoc.json
// and typedoc.css at the repository root).

test('the API reference fits the screen', async ({ page }) => {
  await page.goto('/api/');
  await expect(page.locator('.col-content h1').first()).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test('the menu leads to the packages and back to the site', async ({
  page,
}) => {
  await page.goto('/api/');
  const menu = page.locator('.col-sidebar');
  if (await isTouch(page)) {
    // typedoc listens for touch events on phones.
    await page.locator('#tsd-toolbar-menu-trigger').tap();
    await expect(menu).toBeVisible();
  }
  // The site links and the package list come first, within the screen,
  // not below the README's outline.
  const viewport = page.viewportSize();
  for (const name of ['Guides', 'Playground', 'ts-graphviz.github.io']) {
    const link = menu.getByRole('link', { name, exact: true });
    await expect(link).toBeVisible();
    expect(
      (await link.boundingBox())?.y ?? Number.POSITIVE_INFINITY,
    ).toBeLessThan(viewport?.height ?? 0);
  }
  const packages = menu.locator('#tsd-nav-container > li');
  await expect(packages.first()).toBeVisible();
  expect(
    (await packages.first().boundingBox())?.y ?? Number.POSITIVE_INFINITY,
  ).toBeLessThan(viewport?.height ?? 0);

  // A package opens its page (the first entry is the @ts-graphviz folder).
  const folder = packages.first().locator('details').first();
  if ((await folder.getAttribute('open')) === null) {
    await folder.locator('summary').first().click();
  }
  await packages
    .first()
    .locator('a[href*="modules/"]')
    .filter({ visible: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/api\/modules\//);
  await expect(page.locator('.col-content h1').first()).toBeVisible();
});
