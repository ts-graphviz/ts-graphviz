import { test as base, expect, type Page } from '@playwright/test';

export { expect };

/**
 * `test` with images from other hosts not loaded, so a slow image host (the
 * README's badges and avatars on /api/) cannot hold up the `load` event a
 * test waits for (#1941). The tests check the site, not those images.
 * Scripts from other hosts (Monaco's loader) still load.
 */
export const test = base.extend<{ abortedImages: string[] }>({
  // The images aborted so far, for the test that checks this fixture.
  abortedImages: [
    async ({ context, baseURL }, use) => {
      const { host } = new URL(baseURL ?? 'http://localhost');
      const aborted: string[] = [];
      await context.route(
        (url) => /^https?:$/.test(url.protocol) && url.host !== host,
        (route) => {
          if (route.request().resourceType() !== 'image') {
            return route.fallback();
          }
          aborted.push(route.request().url());
          return route.abort();
        },
      );
      await use(aborted);
    },
    { auto: true },
  ],
});

/** Whether the project emulates a touch device (`(pointer: coarse)`). */
export const isTouch = (page: Page) =>
  page.evaluate(() => matchMedia('(pointer: coarse)').matches);

/** The page body never scrolls sideways. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

/**
 * Wait until the editor settled: Monaco on desktop, the text area on touch
 * devices. Before that, the editor may swap under a test's hands.
 */
export async function waitForEditor(page: Page) {
  await expect(page.locator('[data-editor]').first()).toHaveAttribute(
    'data-editor',
    (await isTouch(page)) ? 'plain' : 'monaco',
    { timeout: 30_000 },
  );
}

/** Replace the Playground script, in whichever editor is showing. */
export async function setScript(page: Page, code: string) {
  await waitForEditor(page);
  const editor = page.locator('[data-editor]').first();
  if ((await editor.getAttribute('data-editor')) === 'monaco') {
    await page.evaluate((value) => {
      const monaco = (window as any).monaco;
      const model = monaco.editor
        .getModels()
        .find(
          (m: { uri: { path: string } }) =>
            !m.uri.path.includes('node_modules'),
        );
      model.setValue(value);
    }, code);
  } else {
    await editor.locator('textarea').fill(code);
  }
}
