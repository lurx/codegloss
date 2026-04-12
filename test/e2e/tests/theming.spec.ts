import { expect, test } from '@playwright/test';

test.describe('theming via CSS custom properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vanilla-themed.html');
    await expect(page.locator('code-gloss .codegloss')).toBeVisible();
  });

  test('host-level CSS variable overrides reach the sandbox frame inside the shadow DOM', async ({
    page,
  }) => {
    // The .sandboxFrame uses background: var(--cg-bg). The fixture overrides
    // --cg-bg to rgb(255, 0, 0) at the host level — verify that propagates.
    const bg = await page.locator('code-gloss').evaluate((el) => {
      const frame = el.shadowRoot?.querySelector('.sandboxFrame') as HTMLElement;
      return frame ? getComputedStyle(frame).backgroundColor : null;
    });
    expect(bg).toBe('rgb(255, 0, 0)');
  });

  test('annotation border color picks up the host-level override', async ({ page }) => {
    // .atk has border-bottom: 1.5px solid var(--cg-ann-border)
    const borderColor = await page.locator('code-gloss').evaluate((el) => {
      const mark = el.shadowRoot?.querySelector('.atk') as HTMLElement;
      return mark ? getComputedStyle(mark).borderBottomColor : null;
    });
    expect(borderColor).toBe('rgb(0, 0, 255)');
  });

  test('default tokens still apply when no override is set', async ({ page }) => {
    // Switch to the un-themed fibonacci fixture and confirm a default token
    // resolves to a non-empty value (we don't pin the literal default, so a
    // theme refresh in the .css source doesn't break this test).
    await page.goto('/vanilla-fibonacci.html');
    await expect(page.locator('code-gloss .codegloss')).toBeVisible();

    const bg = await page.locator('code-gloss').evaluate((el) => {
      const frame = el.shadowRoot?.querySelector('.sandboxFrame') as HTMLElement;
      return frame ? getComputedStyle(frame).backgroundColor : null;
    });
    // Anything but rgba(0,0,0,0) — i.e. some real color is in effect.
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBeNull();
  });
});
