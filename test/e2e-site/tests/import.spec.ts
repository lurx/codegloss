import {
	test,
	expect,
	gotoEditor,
	importButton,
	codeTextarea,
	langInput,
	filenameInput,
} from './helpers';

const VALID_JSON = JSON.stringify({
	code: 'const x = 1;',
	lang: 'ts',
	filename: 'imported.ts',
	annotations: [],
	connections: [],
});

test.describe('import dialog', () => {
	test('opens and cancels without changing config', async ({ page }) => {
		await gotoEditor(page);
		await importButton(page).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'Import' })).toBeVisible();
		await expect(
			dialog.getByRole('button', { name: 'Import', exact: true }),
		).toBeDisabled();

		await dialog.getByRole('button', { name: 'Cancel' }).click();
		await expect(dialog).toBeHidden();

		await expect(codeTextarea(page)).toHaveValue(/function greet/);
	});

	test('imports valid JSON and replaces the config', async ({ page }) => {
		await gotoEditor(page);
		await importButton(page).click();

		const dialog = page.getByRole('dialog');
		await dialog.locator('textarea').fill(VALID_JSON);
		await dialog.getByRole('button', { name: 'Import', exact: true }).click();

		await expect(dialog).toBeHidden();
		await expect(codeTextarea(page)).toHaveValue('const x = 1;');
		await expect(langInput(page)).toHaveValue('ts');
		await expect(filenameInput(page)).toHaveValue('imported.ts');
	});

	test('invalid input shows error and keeps dialog open', async ({ page }) => {
		await gotoEditor(page);
		await importButton(page).click();

		const dialog = page.getByRole('dialog');
		await dialog.locator('textarea').fill('not valid at all');
		await dialog.getByRole('button', { name: 'Import', exact: true }).click();

		await expect(dialog).toBeVisible();
		await expect(dialog.locator('textarea')).toHaveValue('not valid at all');
	});
});
