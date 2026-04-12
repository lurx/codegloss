import {
	test,
	expect,
	gotoEditor,
	codeTextarea,
	langInput,
	filenameInput,
	runnableCheckbox,
} from './helpers';

test.describe('code pane', () => {
	test('editing code updates preview', async ({ page }) => {
		await gotoEditor(page);

		const newCode = 'const answer = 42;';
		await codeTextarea(page).fill(newCode);

		const preview = page.locator('code-gloss').first();
		await expect(preview).toContainText('answer', { timeout: 5000 });
	});

	test('language input changes value', async ({ page }) => {
		await gotoEditor(page);
		await langInput(page).fill('ts');
		await expect(langInput(page)).toHaveValue('ts');
	});

	test('filename input changes value', async ({ page }) => {
		await gotoEditor(page);
		await filenameInput(page).fill('example.ts');
		await expect(filenameInput(page)).toHaveValue('example.ts');
	});

	test('runnable checkbox toggles', async ({ page }) => {
		await gotoEditor(page);
		const box = runnableCheckbox(page);
		await expect(box).toBeChecked();
		await box.uncheck();
		await expect(box).not.toBeChecked();
		await box.check();
		await expect(box).toBeChecked();
	});

	test('edits are written to localStorage', async ({ page }) => {
		await gotoEditor(page);
		await langInput(page).fill('ts');
		await filenameInput(page).fill('stored.ts');

		await expect
			.poll(async () =>
				page.evaluate(
					(key) => globalThis.localStorage.getItem(key),
					'codegloss:editor:draft',
				),
			)
			.toMatch(/"filename":\s*"stored\.ts"/);
	});
});
