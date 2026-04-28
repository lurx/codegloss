import { expect, test } from '@playwright/test';

test.describe('defaultOpen pre-opens', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/vanilla-default-open.html');
		await expect(page.locator('code-gloss .codegloss')).toBeVisible();
	});

	test('pre-opens the last-flagged annotation as an inline callout', async ({
		page,
	}) => {
		const callout = page.locator('code-gloss .callout');

		// a1 and a2 are both flagged; a2 wins the cascade.
		await expect(callout).toBeVisible();
		await expect(callout).toContainText('Cancel pending');
		await expect(callout).not.toContainText('Shared closure');
	});

	test('pre-opens the last-flagged connection popover', async ({ page }) => {
		const popover = page.locator('code-gloss .connectionTooltip');

		// Wait for the rAF that schedules popover pre-opens to run.
		await expect(async () => {
			const open = await popover.evaluate(el =>
				(el as HTMLElement).matches(':popover-open'),
			);
			expect(open).toBe(true);
		}).toPass({ timeout: 2000 });

		await expect(popover).toContainText('Cascade winner');
		await expect(popover).not.toContainText('First flagged');
	});

	test('annotation callout and connection popover are open together', async ({
		page,
	}) => {
		const callout = page.locator('code-gloss .callout');
		const popover = page.locator('code-gloss .connectionTooltip');

		await expect(callout).toBeVisible();

		await expect(async () => {
			const open = await popover.evaluate(el =>
				(el as HTMLElement).matches(':popover-open'),
			);
			expect(open).toBe(true);
		}).toPass({ timeout: 2000 });
	});

	test('a dismissed pre-open stays dismissed (does not reassert)', async ({
		page,
	}) => {
		const popover = page.locator('code-gloss .connectionTooltip');

		// Wait for the pre-open to fire.
		await expect(async () => {
			const open = await popover.evaluate(el =>
				(el as HTMLElement).matches(':popover-open'),
			);
			expect(open).toBe(true);
		}).toPass({ timeout: 2000 });

		await page.keyboard.press('Escape');

		// Trigger a window event that would re-run any periodic hooks if
		// they existed; the pre-open logic should NOT re-fire.
		await page.evaluate(() => window.dispatchEvent(new Event('resize')));
		await page.waitForTimeout(250);

		const open = await popover.evaluate(el =>
			(el as HTMLElement).matches(':popover-open'),
		);
		expect(open).toBe(false);
	});
});
