import { expect, test } from '@playwright/test';

test.describe('right-side arcs + arrowhead', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vanilla-right-side.html');
    await expect(page.locator('code-gloss .codegloss')).toBeVisible();
    // Wait for both sides to have rendered.
    await expect(
      page.locator('code-gloss .gutterSvg circle').first(),
    ).toBeAttached();
    await expect(
      page.locator('code-gloss .rightSvg circle').first(),
    ).toBeAttached();
  });

  test('renders a second SVG gutter for right-side connections', async ({ page }) => {
    const wc = page.locator('code-gloss');

    // With arrowhead globally on, both sides suppress the `to` dot
    // and emit only the `from` dot — one per arc.
    await expect(wc.locator('css=.gutterSvg circle')).toHaveCount(1);
    await expect(wc.locator('css=.rightSvg circle')).toHaveCount(1);
    // And each side's arc path carries a marker-end arrowhead.
    await expect(wc.locator('css=.gutterSvg > path').first()).toHaveAttribute(
      'marker-end',
      /^url\(#cg-arrowhead-\d+\)$/,
    );
    await expect(wc.locator('css=.rightSvg > path').first()).toHaveAttribute(
      'marker-end',
      /^url\(#cg-arrowhead-\d+\)$/,
    );
  });

  test('right-side dots anchor past each line\'s actual text end', async ({
    page,
  }) => {
    const wc = page.locator('code-gloss');

    // The `from` dot for a2 should sit to the right of the line's
    // rendered text, not at a fixed gutter position. Grab the dot's cx
    // and compare it to the bounding rect of that line's content.
    const box = await wc.evaluate((host) => {
      const root = host.shadowRoot!;
      const dot = root.querySelector('.rightSvg circle')!;
      const dotCx = Number(dot.getAttribute('cx'));
      const line = root.querySelectorAll<HTMLElement>('.line')[2];
      const lineContent = line.querySelector<HTMLElement>('.lineContent')!;
      const range = document.createRange();
      range.selectNodeContents(lineContent);
      const codeAreaRect = root
        .querySelector<HTMLElement>('.codeArea')!
        .getBoundingClientRect();
      const textRight =
        range.getBoundingClientRect().right - codeAreaRect.left;
      return { dotCx, textRight };
    });

    // Dot sits past the text end (with a small gap offset) but not
    // way off to the right — sanity bounds the measurement.
    expect(box.dotCx).toBeGreaterThan(box.textRight);
    expect(box.dotCx - box.textRight).toBeLessThan(40);
  });

  test('the `to` endpoint of each arc renders as an arrowhead marker', async ({
    page,
  }) => {
    const wc = page.locator('code-gloss');

    // Both gutters define a <marker> because arrowhead is on globally.
    const markers = await wc.locator('css=svg marker').count();
    expect(markers).toBeGreaterThanOrEqual(2);

    // The arc path on the right side references it via marker-end.
    const markerEnd = await wc
      .locator('css=.rightSvg > path')
      .first()
      .getAttribute('marker-end');
    expect(markerEnd).toMatch(/^url\(#cg-arrowhead-\d+\)$/);

    // The marker's tip inherits the connection color so an arrow for
    // the amber right-side connection has a matching fill.
    const tipFill = await wc
      .locator('css=.rightSvg marker path')
      .first()
      .getAttribute('fill');
    expect(tipFill).toBe('#f5a524');
  });

  test('clicking the right-side arc opens the popover', async ({ page }) => {
    const wc = page.locator('code-gloss');
    const popover = wc.locator('css=.connectionTooltip');

    await wc.locator('css=.rightSvg circle').first().click({ force: true });

    await expect(popover).toContainText('Miss path');
    await expect(popover).toContainText('Cache miss falls through to fetch.');
  });
});
