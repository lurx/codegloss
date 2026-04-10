import { expect, test } from '@playwright/test';

test.describe('connection popover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vanilla-fibonacci.html');
    await expect(page.locator('code-gloss .codegloss')).toBeVisible();
    // Wait until drawArcs has rendered the gutter SVG (the fixture has one
    // interactive connection between a1 and a2).
    await expect(
      page.locator('code-gloss .gutterSvg circle').first(),
    ).toBeAttached();
  });

  test('clicking the interactive arc opens the popover with title + body', async ({
    page,
  }) => {
    const wc = page.locator('code-gloss');
    const popover = wc.locator('css=.connectionTooltip');

    // Click the dot at one end of the arc — drawArcs wires click handlers
    // to both endpoint dots and to the transparent hit-target path.
    await wc.locator('css=.gutterSvg circle').first().click({ force: true });

    await expect(popover).toContainText('Recursive descent');
    await expect(popover).toContainText('Each call to fib spawns two smaller calls.');
  });

  test('Escape dismisses the open popover', async ({ page }) => {
    const wc = page.locator('code-gloss');
    const popover = wc.locator('css=.connectionTooltip');

    await wc.locator('css=.gutterSvg circle').first().click({ force: true });
    await expect(popover).toContainText('Recursive descent');

    await page.keyboard.press('Escape');
    // The popover element stays in the DOM but loses its open state. We
    // check the inner content is still around (popover dismiss is browser-
    // chrome-managed, so we use visibility, not innerHTML clearing).
    await expect(async () => {
      const open = await popover.evaluate(
        (el) => (el as HTMLElement).matches(':popover-open'),
      );
      expect(open).toBe(false);
    }).toPass({ timeout: 2000 });
  });

  test('clicking the gutter does not open a popover when there is no arc', async ({
    page,
  }) => {
    const wc = page.locator('code-gloss');
    const popover = wc.locator('css=.connectionTooltip');

    // Click the SVG element itself (not a child dot/path). The SVG has
    // pointer-events: none in CSS, so this should not register as a click
    // on any interactive arc element.
    await wc.locator('css=.gutterSvg').click({ force: true, position: { x: 5, y: 5 } });

    const open = await popover.evaluate(
      (el) => (el as HTMLElement).matches(':popover-open'),
    );
    expect(open).toBe(false);
  });
});
