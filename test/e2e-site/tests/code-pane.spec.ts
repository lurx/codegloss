import {
	test,
	expect,
	gotoEditor,
	codeTextarea,
	langInput,
	filenameInput,
} from './helpers';

test.describe('code pane', () => {
	test('editing code updates preview', async ({ page }) => {
		await gotoEditor(page);

		const preview = page.locator('code-gloss').first();
		// wait for the initial preview render before replacing the code
		await expect(preview).toContainText('greet', { timeout: 15_000 });

		// webkit + React controlled <textarea> occasionally drops the input
		// event from locator.fill(); real keystrokes are reliable.
		const textarea = codeTextarea(page);
		await textarea.focus();
		await textarea.selectText();
		await page.keyboard.press('Backspace');
		await textarea.pressSequentially('const answer = 42;');

		await expect(preview).toContainText('answer', { timeout: 15_000 });
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
