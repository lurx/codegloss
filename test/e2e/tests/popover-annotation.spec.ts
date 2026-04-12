import { expect, test } from '@playwright/test';

test.describe('annotation popover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vanilla-popover-annotation.html');
    await expect(page.locator('code-gloss .codegloss')).toBeVisible();
  });

  const clickMark = async (page: Parameters<Parameters<typeof test>[1]>[0]['page'], annId: string) =>
    page
      .locator(`code-gloss mark[data-ann-id="${annId}"]`)
      .first()
      .click();

  test('opens a floating popover for a popover-mode annotation', async ({ page }) => {
    const popover = page.locator('code-gloss .annotationPopover');

    await clickMark(page, 'a2');

    await expect(popover).toContainText('Input');
    await expect(popover).toContainText("The array we're reducing.");

    const isOpen = await popover.evaluate((el) =>
      (el as HTMLElement).matches(':popover-open'),
    );
    expect(isOpen).toBe(true);
  });

  test('an annotation that sets popover: false overrides the block-level default', async ({
    page,
  }) => {
    const inlineCallout = page.locator('code-gloss .callout');
    const popover = page.locator('code-gloss .annotationPopover');

    // a1 explicitly opts out of popover even though callouts.popover is true.
    await clickMark(page, 'a1');

    await expect(inlineCallout).toContainText('Accumulator');
    const popoverOpen = await popover.evaluate((el) =>
      (el as HTMLElement).matches(':popover-open'),
    );
    expect(popoverOpen).toBe(false);
  });

  test('opening a popover annotation dismisses any inline callout', async ({
    page,
  }) => {
    const inlineCallout = page.locator('code-gloss .callout');
    const popover = page.locator('code-gloss .annotationPopover');

    // Open the inline callout (a1), then switch to a popover annotation (a2).
    await clickMark(page, 'a1');
    await expect(inlineCallout).toBeVisible();

    await clickMark(page, 'a2');

    await expect(inlineCallout).toHaveCount(0);
    const popoverOpen = await popover.evaluate((el) =>
      (el as HTMLElement).matches(':popover-open'),
    );
    expect(popoverOpen).toBe(true);
  });

  test('Escape dismisses the annotation popover', async ({ page }) => {
    const popover = page.locator('code-gloss .annotationPopover');

    await clickMark(page, 'a3');
    await expect(popover).toContainText('Write');

    await page.keyboard.press('Escape');

    await expect(async () => {
      const open = await popover.evaluate((el) =>
        (el as HTMLElement).matches(':popover-open'),
      );
      expect(open).toBe(false);
    }).toPass({ timeout: 2000 });
  });
});
