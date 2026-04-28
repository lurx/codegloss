import { expect, test } from '@playwright/test';

test.describe('annotation callout', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/vanilla-fibonacci.html');
		// Wait for the WC to upgrade and finish its initial render.
		await expect(page.locator('code-gloss .codegloss')).toBeVisible();
	});

	test('clicking a mark opens a callout with the right content', async ({
		page,
	}) => {
		const wc = page.locator('code-gloss');
		await wc.locator('css=mark[data-ann-id="a1"]').click();

		const callout = wc.locator('css=.callout');
		await expect(callout).toBeVisible();
		await expect(callout.locator('css=.calloutChip')).toHaveText('fib');
		await expect(callout.locator('css=.calloutTitle')).toHaveText('Recursion');
		await expect(callout.locator('css=.calloutBody')).toHaveText(
			'Calls itself with smaller inputs.',
		);
	});

	test('clicking the same mark a second time dismisses the callout', async ({
		page,
	}) => {
		const wc = page.locator('code-gloss');

		// Open
		await wc.locator('css=mark[data-ann-id="a1"]').first().click();
		await expect(wc.locator('css=.callout')).toBeVisible();

		// Re-render replaces the mark element, so we re-query before the second click.
		await wc.locator('css=mark[data-ann-id="a1"]').first().click();
		await expect(wc.locator('css=.callout')).toHaveCount(0);
	});

	test('clicking a different mark switches the active callout', async ({
		page,
	}) => {
		const wc = page.locator('code-gloss');

		await wc.locator('css=mark[data-ann-id="a1"]').first().click();
		await expect(wc.locator('css=.calloutTitle')).toHaveText('Recursion');

		await wc.locator('css=mark[data-ann-id="a2"]').click();
		await expect(wc.locator('css=.calloutTitle')).toHaveText('Decrement');

		// Only one callout should ever be open at a time.
		await expect(wc.locator('css=.callout')).toHaveCount(1);
	});

	test('Escape dismisses an open callout', async ({ page }) => {
		const wc = page.locator('code-gloss');

		await wc.locator('css=mark[data-ann-id="a1"]').first().click();
		await expect(wc.locator('css=.callout')).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(wc.locator('css=.callout')).toHaveCount(0);
	});

	test('the callout close button dismisses the callout', async ({ page }) => {
		const wc = page.locator('code-gloss');

		await wc.locator('css=mark[data-ann-id="a1"]').first().click();
		await wc.locator('css=.calloutClose').click();
		await expect(wc.locator('css=.callout')).toHaveCount(0);
	});

	test('clicking elsewhere in the pre does not open a callout', async ({
		page,
	}) => {
		const wc = page.locator('code-gloss');

		// Click an unannotated line content span (not a mark). force: true because
		// the absolutely-positioned arc gutter SVG sits over the start of the
		// line; that overlay is pointer-events:none but Playwright's actionability
		// check still flags it.
		await wc.locator('css=.lineContent').nth(3).click({ force: true });
		await expect(wc.locator('css=.callout')).toHaveCount(0);
	});
});
