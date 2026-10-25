import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll, isTouch, setScript } from './helpers';

const result = (page: import('@playwright/test').Page) =>
  page.getByRole('region', { name: 'Result' });
const graphImage = (page: import('@playwright/test').Page) =>
  result(page).locator('img[src^="blob:"]');

test.beforeEach(async ({ page }) => {
  await page.goto('/playground/');
  await expect(graphImage(page)).toBeVisible();
});

test('runs the example script and shows the graph', async ({ page }) => {
  await expect(result(page)).toContainText(/Graphviz \d+\.\d+/);
  // The image is a real Graphviz rendering, not an empty SVG.
  const size = await graphImage(page).evaluate((img: HTMLImageElement) => ({
    width: img.naturalWidth,
    height: img.naturalHeight,
  }));
  expect(size.width).toBeGreaterThan(50);
  expect(size.height).toBeGreaterThan(50);
});

test('shows the DOT the script produced', async ({ page }) => {
  await result(page).getByRole('tab', { name: 'DOT' }).click();
  await expect(result(page).locator('pre')).toContainText(
    'digraph "state_machine" {',
  );
  await expect(result(page).locator('pre')).toContainText('"Model" -> "DOT"');
});

test('re-runs an edited script', async ({ page }) => {
  await setScript(
    page,
    "import { graph } from 'ts-graphviz';\ngraph('Edited', (g) => { g.edge(['left', 'right']); });",
  );
  await page.getByRole('button', { name: 'Run' }).click();
  await result(page).getByRole('tab', { name: 'DOT' }).click();
  await expect(result(page).locator('pre')).toContainText('graph "Edited" {');
  await expect(result(page).locator('pre')).toContainText('"left" -- "right"');
});

test('reports errors and recovers', async ({ page }) => {
  const run = page.getByRole('button', { name: 'Run' });
  await setScript(page, "import fs from 'node:fs';\nfs;");
  await run.click();
  await expect(result(page).getByRole('alert')).toContainText(
    "Cannot import 'node:fs'",
  );

  await setScript(page, "'digraph { a -> }'");
  await run.click();
  await expect(result(page).getByRole('alert')).toContainText(
    'Failed to render graph',
  );

  await setScript(page, "'digraph { a -> b }'");
  await run.click();
  await expect(graphImage(page)).toBeVisible();
});

test('stops a script that never ends', async ({ page }) => {
  await setScript(page, 'while (true) {}');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(result(page).getByRole('alert')).toContainText(
    'did not finish within 5 seconds',
    { timeout: 10_000 },
  );
  await setScript(page, "'digraph { a -> b }'");
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(graphImage(page)).toBeVisible();
});

test('lays the graph out with the chosen engine', async ({ page }) => {
  const before = await graphImage(page).getAttribute('src');
  await result(page).getByLabel('Layout engine').selectOption('neato');
  await expect(graphImage(page)).not.toHaveAttribute('src', before ?? '');
  await expect(graphImage(page)).toBeVisible();
});

test('fits the screen', async ({ page }) => {
  await expectNoHorizontalScroll(page);
  const viewport = page.viewportSize();
  const editor = page.getByRole('region', { name: 'Script' });
  const box = await editor.boundingBox();
  expect(box).not.toBeNull();
  // The editor has room to type in.
  expect(box?.height).toBeGreaterThan(200);
  if (viewport && viewport.width < 997) {
    // Stacked: the result follows the editor.
    const resultBox = await result(page).boundingBox();
    expect(resultBox?.y).toBeGreaterThan(
      (box?.y ?? 0) + (box?.height ?? 0) - 1,
    );
  }
});

test('uses a text area on touch devices and Monaco otherwise', async ({
  page,
}) => {
  const editor = page.locator('[data-editor]');
  if (await isTouch(page)) {
    await expect(editor).toHaveAttribute('data-editor', 'plain');
    const textarea = editor.locator('textarea');
    await expect(textarea).toBeVisible();
    // No zoom-on-focus in iOS Safari, which happens below 16px.
    expect(
      await textarea.evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).fontSize),
      ),
    ).toBeGreaterThanOrEqual(16);
    await textarea.fill("'digraph { typed -> on_phone }'");
    await page.getByRole('button', { name: 'Run' }).click();
    await result(page).getByRole('tab', { name: 'DOT' }).click();
    await expect(result(page).locator('pre')).toContainText(
      'typed -> on_phone',
    );
  } else {
    await expect(editor).toHaveAttribute('data-editor', 'monaco', {
      timeout: 30_000,
    });
  }
});

test('runs with Ctrl+Enter', async ({ page }) => {
  test.skip(await isTouch(page), 'needs a hardware keyboard');
  await expect(page.locator('[data-editor]')).toHaveAttribute(
    'data-editor',
    'monaco',
    {
      timeout: 30_000,
    },
  );
  await setScript(page, "'digraph { from_keyboard }'");
  await page.locator('[data-editor] .monaco-editor textarea').focus();
  await page.keyboard.press('Control+Enter');
  await result(page).getByRole('tab', { name: 'DOT' }).click();
  await expect(result(page).locator('pre')).toContainText('from_keyboard');
});
