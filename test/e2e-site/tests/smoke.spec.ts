import {
	test,
	expect,
	gotoEditor,
	codeTextarea,
	langInput,
	filenameInput,
} from './helpers';

test.describe('editor smoke', () => {
	test('renders header, panels, and initial draft', async ({ page }) => {
		await gotoEditor(page);

		await expect(
			page.getByRole('heading', { name: 'Editor', level: 1 }),
		).toBeVisible();
		await expect(page.getByRole('button', { name: /Undo/ })).toBeVisible();
		await expect(page.getByRole('button', { name: /Redo/ })).toBeVisible();
		await expect(page.getByRole('button', { name: /Import/ })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();

		await expect(codeTextarea(page)).toHaveValue(/function greet/);
		await expect(langInput(page)).toHaveValue('js');
		await expect(filenameInput(page)).toHaveValue('greet.js');

		await expect(page.getByText('Annotations', { exact: true })).toBeVisible();
		await expect(page.getByText('Connections', { exact: true })).toBeVisible();
		await expect(page.getByText('No annotations yet.')).toBeVisible();

		const preview = page.locator('code-gloss').first();
		await expect(preview).toBeVisible();
	});

	test('undo and redo start disabled', async ({ page }) => {
		await gotoEditor(page);
		await expect(page.getByRole('button', { name: /Undo/ })).toBeDisabled();
		await expect(page.getByRole('button', { name: /Redo/ })).toBeDisabled();
	});
});
