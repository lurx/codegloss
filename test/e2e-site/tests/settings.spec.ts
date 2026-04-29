import { test, expect, gotoEditor, settingsButton } from './helpers';

test.describe('settings dialog', () => {
	test('opens, shows theme + arcs + callouts sections, and closes', async ({
		page,
	}) => {
		await gotoEditor(page);
		await settingsButton(page).click();

		await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
		await expect(page.getByLabel('Theme')).toBeVisible();
		await expect(page.getByText('Arcs', { exact: true })).toBeVisible();
		await expect(page.getByText('Callouts', { exact: true })).toBeVisible();

		await page.getByRole('button', { name: 'Done' }).click();
		await expect(page.getByRole('heading', { name: 'Settings' })).toBeHidden();
	});

	test('changing theme option updates the select', async ({ page }) => {
		await gotoEditor(page);
		await settingsButton(page).click();

		const theme = page.getByLabel('Theme');
		const options = await theme
			.locator('option')
			.evaluateAll(els => els.map(el => (el as HTMLOptionElement).value));
		const nonDefault = options.find(v => v !== '__auto__' && v !== '');
		if (!nonDefault) test.skip(true, 'no non-default theme options available');

		await theme.selectOption(nonDefault!);
		await expect(theme).toHaveValue(nonDefault!);
	});

	test('arcs arrowhead checkbox toggles', async ({ page }) => {
		await gotoEditor(page);
		await settingsButton(page).click();

		const dialog = page.getByRole('dialog');
		const arrowhead = dialog
			.locator('label', { hasText: 'arrowhead' })
			.locator('input[type="checkbox"]');
		await arrowhead.check();
		await expect(arrowhead).toBeChecked();
	});

	test('callouts popover-by-default toggles', async ({ page }) => {
		await gotoEditor(page);
		await settingsButton(page).click();

		const dialog = page.getByRole('dialog');
		const popover = dialog
			.locator('label', { hasText: 'popover by default' })
			.locator('input[type="checkbox"]');
		await popover.check();
		await expect(popover).toBeChecked();
	});
});
