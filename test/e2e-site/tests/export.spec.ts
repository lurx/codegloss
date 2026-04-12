import { test, expect, gotoEditor } from './helpers';

test.describe('export panel', () => {
	test('renders JSON tab active by default', async ({ page }) => {
		await gotoEditor(page);
		const jsonTab = page.getByRole('button', { name: 'JSON' });
		await expect(jsonTab).toHaveAttribute('aria-pressed', 'true');
	});

	test('switching tabs updates active state', async ({ page }) => {
		await gotoEditor(page);

		await page.getByRole('button', { name: 'MDX' }).click();
		await expect(page.getByRole('button', { name: 'MDX' })).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		await expect(page.getByRole('button', { name: 'JSON' })).toHaveAttribute(
			'aria-pressed',
			'false',
		);

		await page.getByRole('button', { name: 'JSX' }).click();
		await expect(page.getByRole('button', { name: 'JSX' })).toHaveAttribute(
			'aria-pressed',
			'true',
		);
	});

	test('copy button writes the active export to the clipboard', async ({
		page,
		context,
		browserName,
	}) => {
		test.skip(browserName === 'webkit', 'clipboard permissions flaky in webkit');
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await gotoEditor(page);

		const copyButton = page
			.getByRole('button', { name: /Copy|Copied/ })
			.first();
		await copyButton.click();
		await expect(copyButton).toContainText('Copied');

		const clipboardText = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		expect(clipboardText).toContain('"code"');
		expect(clipboardText).toContain('function greet');
	});
});
