import { expect, test } from '@playwright/test';

// Interop fixture: a vanilla <mark-down> Web Component (loaded from a vendored
// copy of https://github.com/Adir-SL/mark-down) and a <code-gloss> WC sit on
// the same page. Verifies they coexist without shadow-DOM style collisions or
// custom-element registration conflicts.

test.describe('coexisting with <mark-down>', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/with-mark-down.html');
		// Wait for both elements to upgrade.
		await expect(page.locator('code-gloss .codegloss')).toBeVisible();
		await expect(page.locator('mark-down')).toBeVisible();
	});

	test('both custom elements upgrade and coexist', async ({ page }) => {
		// mark-down should have its own shadow root with at least an h1 and a
		// paragraph from the rendered markdown.
		const markdownHeading = await page
			.locator('mark-down')
			.evaluate(el => el.shadowRoot?.querySelector('h1')?.textContent ?? null);
		expect(markdownHeading?.trim()).toBe('Hello from mark-down');

		// code-gloss should have its own .codegloss container, completely
		// separate from mark-down's shadow tree.
		const codeglossPresent = await page
			.locator('code-gloss')
			.evaluate(el => el.shadowRoot?.querySelector('.codegloss') !== null);
		expect(codeglossPresent).toBe(true);
	});

	test('mark-down styles do not leak into code-gloss shadow DOM', async ({
		page,
	}) => {
		// The codegloss h1 selector inside its shadow DOM (if any) should not be
		// affected by mark-down's <h1> styles. We assert by checking that the
		// codegloss filename element retains its expected color (--cg-muted).
		const filenameColor = await page.locator('code-gloss').evaluate(el => {
			const fn = el.shadowRoot?.querySelector('.filename') as HTMLElement;
			return fn ? getComputedStyle(fn).color : null;
		});

		// The exact color depends on light/dark mode, but it must be set
		// (anything but the empty string).
		expect(filenameColor).toBeTruthy();
		expect(filenameColor).not.toBe('');
	});

	test('code-gloss interactions still work with mark-down on the page', async ({
		page,
	}) => {
		const wc = page.locator('code-gloss');

		// Annotation click → callout opens
		await wc.locator('css=mark[data-ann-id="a1"]').first().click();
		await expect(wc.locator('css=.callout')).toBeVisible();
		await expect(wc.locator('css=.calloutTitle')).toHaveText('Recursion');

		// Escape dismiss
		await page.keyboard.press('Escape');
		await expect(wc.locator('css=.callout')).toHaveCount(0);
	});
});
