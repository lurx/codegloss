import { expect, test } from '@playwright/test';

const RAW_CODE = `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}
console.log(fib(10));`;

test.describe('copy button', () => {
  test.beforeEach(async ({ page, browserName, context }) => {
    // Clipboard read permission is a Chromium concept. Firefox and WebKit
    // don't gate clipboard.readText() the same way; granting the permission
    // there is a no-op (or unsupported), so we only do it on Chromium.
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    await page.goto('/vanilla-fibonacci.html');
    await expect(page.locator('code-gloss .codegloss')).toBeVisible();
  });

  test('writes the raw source code to the clipboard', async ({
    page,
    browserName,
  }) => {
    // WebKit and Firefox in Playwright headless don't expose a working
    // clipboard read API even with permission, so we observe the side effect
    // by intercepting writeText instead.
    if (browserName !== 'chromium') {
      await page.addInitScript(() => {
        (window as unknown as { __copied?: string }).__copied = undefined;
        const orig = navigator.clipboard?.writeText?.bind(navigator.clipboard);
        if (orig) {
          navigator.clipboard.writeText = async (text: string) => {
            (window as unknown as { __copied?: string }).__copied = text;
            return orig(text).catch(() => {});
          };
        } else {
          // Stub it entirely if the browser doesn't ship clipboard.writeText.
          (navigator as unknown as { clipboard: { writeText: (t: string) => Promise<void> } }).clipboard = {
            writeText: async (text: string) => {
              (window as unknown as { __copied?: string }).__copied = text;
            },
          };
        }
      });
      await page.reload();
      await expect(page.locator('code-gloss .codegloss')).toBeVisible();
    }

    const wc = page.locator('code-gloss');
    await wc.locator('css=.copyButton').click();

    if (browserName === 'chromium') {
      const clipboard = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboard).toBe(RAW_CODE);
    } else {
      const captured = await page.evaluate(
        () => (window as unknown as { __copied?: string }).__copied,
      );
      expect(captured).toBe(RAW_CODE);
    }
  });

  test('swaps the icon to a check mark and updates the aria-label', async ({
    page,
  }) => {
    const wc = page.locator('code-gloss');
    const btn = wc.locator('css=.copyButton');

    // Pre-click state
    await expect(btn).toHaveAttribute('aria-label', 'Copy code');

    await btn.click();

    // Post-click "copied" state
    await expect(btn).toHaveAttribute('aria-label', 'Copied');
    await expect(btn).toHaveAttribute('title', 'Copied!');

    // Eventually reverts (the timer is 2 seconds; give it a generous window).
    await expect(btn).toHaveAttribute('aria-label', 'Copy code', {
      timeout: 4000,
    });
  });
});
