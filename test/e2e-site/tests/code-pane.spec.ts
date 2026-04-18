import type { Locator } from '@playwright/test';
import {
	test,
	expect,
	gotoEditor,
	codeTextarea,
	langInput,
	filenameInput,
} from './helpers';

// webkit + React controlled inputs occasionally drop the input event from
// locator.fill(); real keystrokes are reliable.
async function typeInto(locator: Locator, value: string): Promise<void> {
	await locator.focus();
	await locator.selectText();
	await locator.page().keyboard.press('Backspace');
	await locator.pressSequentially(value);
}

test.describe('code pane', () => {
	test('editing code updates preview', async ({ page }) => {
		await gotoEditor(page);

		const preview = page.locator('code-gloss').first();
		// wait for the initial preview render before replacing the code
		await expect(preview).toContainText('greet', { timeout: 15_000 });

		await typeInto(codeTextarea(page), 'const answer = 42;');

		await expect(preview).toContainText('answer', { timeout: 15_000 });
	});

	test('language input changes value', async ({ page }) => {
		await gotoEditor(page);
		await typeInto(langInput(page), 'ts');
		await expect(langInput(page)).toHaveValue('ts');
	});

	test('filename input changes value', async ({ page }) => {
		await gotoEditor(page);
		await typeInto(filenameInput(page), 'example.ts');
		await expect(filenameInput(page)).toHaveValue('example.ts');
	});

	test('edits are written to localStorage', async ({ page }) => {
		await gotoEditor(page);
		await typeInto(langInput(page), 'ts');
		await typeInto(filenameInput(page), 'stored.ts');

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
