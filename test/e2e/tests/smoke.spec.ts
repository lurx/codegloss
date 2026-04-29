import { expect, test } from '@playwright/test';

// Phase 8 smoke test. The per-interaction specs (annotation-callout,
// connection-popover, copy-button, run-button, keyboard-navigation, theming,
// accessibility, with-mark-down) come in Phase 9.

test.describe('harness', () => {
	test('vanilla-fibonacci.html upgrades and renders into the shadow DOM', async ({
		page,
	}) => {
		await page.goto('/vanilla-fibonacci.html');

		const wc = page.locator('code-gloss');
		await expect(wc).toBeVisible();

		// Wait until the custom element has constructed its shadow root by
		// querying for the inner .codegloss container that buildDom() emits.
		const root = wc.locator('css=.codegloss');
		await expect(root).toBeVisible();

		// Sanity-check the toolbar wired up the filename + the language badge.
		await expect(wc.locator('css=.filename')).toHaveText('fib.js');
		await expect(wc.locator('css=.langBadge')).toHaveText('js');

		// The fibonacci snippet has 5 lines of source.
		const lines = wc.locator('css=.line');
		await expect(lines).toHaveCount(5);

		// The annotation marks for "fib" + "n - 1" are present in the rendered
		// pre. Use a Locator chain so we cross the shadow boundary correctly.
		await expect(
			wc.locator('css=mark[data-ann-id="a1"]').first(),
		).toBeVisible();
		await expect(wc.locator('css=mark[data-ann-id="a2"]')).toBeVisible();
	});

	test('vanilla-multiple-blocks.html renders three independent instances', async ({
		page,
	}) => {
		await page.goto('/vanilla-multiple-blocks.html');

		const blocks = page.locator('code-gloss');
		await expect(blocks).toHaveCount(3);

		// Each instance has its own shadow root → its own .codegloss container.
		for (let i = 0; i < 3; i++) {
			await expect(blocks.nth(i).locator('css=.codegloss')).toBeVisible();
		}

		// The third instance has no annotations and no filename — verify it
		// still upgraded cleanly.
		await expect(blocks.nth(2).locator('css=.filename')).toHaveCount(0);
		await expect(blocks.nth(2).locator('css=mark[data-ann-id]')).toHaveCount(0);
	});
});
