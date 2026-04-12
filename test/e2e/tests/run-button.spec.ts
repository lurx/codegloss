import { expect, test } from '@playwright/test';

test.describe('run button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vanilla-fibonacci.html');
    await expect(page.locator('code-gloss .codegloss')).toBeVisible();
  });

  test('runs the code and renders the captured console output', async ({ page }) => {
    const wc = page.locator('code-gloss');

    // Output strip is hidden until first run.
    const output = wc.locator('css=.outputStrip');
    await expect(output).toBeHidden();

    await wc.locator('css=.runButton').click();

    await expect(output).toBeVisible();
    await expect(output.locator('css=.outputLabel')).toHaveText('Output');

    // The fibonacci snippet logs fib(10) === 55.
    const lines = output.locator('css=.outputLine');
    await expect(lines).toHaveCount(1);
    await expect(lines.first()).toHaveText('> 55');
  });

  test('switches the button label to "Run again" after the first run', async ({
    page,
  }) => {
    const wc = page.locator('code-gloss');
    const btn = wc.locator('css=.runButton');

    await expect(btn).toContainText('Run');
    await btn.click();
    await expect(btn).toHaveText('↻ Run again');
  });

  test('replaces previous output when run is clicked twice', async ({ page }) => {
    const wc = page.locator('code-gloss');
    const btn = wc.locator('css=.runButton');

    await btn.click();
    await btn.click();

    // Still exactly one output line — the second run replaced the first.
    await expect(wc.locator('css=.outputLine')).toHaveCount(1);
    await expect(wc.locator('css=.outputLine').first()).toHaveText('> 55');
  });
});
