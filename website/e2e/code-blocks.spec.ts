import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll, isTouch } from './helpers';

// ```ts ts-graphviz code blocks (plugins/remark-plugin-tsgraphviz.ts).
const PAGE = '/docs/ts-graphviz/getting-started/core-features';

test('shows ts-graphviz code blocks', async ({ page }) => {
  await page.goto(PAGE);
  const editors = page.locator('[data-editor]');
  await expect(editors).not.toHaveCount(0);
  await expect(editors.first()).toContainText('digraph');
  if (await isTouch(page)) {
    // A highlighted code block, which scrolls like the rest of the page.
    await expect(editors.first().locator('pre')).toBeVisible();
    await expect(editors.first().locator('textarea')).toHaveCount(0);
  } else {
    await expect(editors.first()).toHaveAttribute('data-editor', 'monaco', {
      timeout: 30_000,
    });
    // Read-only, and sized to the code rather than collapsed.
    const height = (await editors.first().boundingBox())?.height ?? 0;
    expect(height).toBeGreaterThan(100);
  }
  await expectNoHorizontalScroll(page);
});
