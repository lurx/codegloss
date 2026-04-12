import {
	test,
	expect,
	gotoEditor,
	addAnnotationButton,
	undoButton,
	redoButton,
} from './helpers';

test.describe('undo / redo', () => {
	test('Undo reverses the last action; Redo reapplies it', async ({ page }) => {
		await gotoEditor(page);
		await expect(undoButton(page)).toBeDisabled();

		await addAnnotationButton(page).click();
		await expect(page.getByLabel('Annotation id')).toHaveCount(1);
		await expect(undoButton(page)).toBeEnabled();

		await undoButton(page).click();
		await expect(page.getByText('No annotations yet.')).toBeVisible();
		await expect(redoButton(page)).toBeEnabled();

		await redoButton(page).click();
		await expect(page.getByLabel('Annotation id')).toHaveCount(1);
	});

	test('Cmd/Ctrl+Z undoes; Cmd/Ctrl+Shift+Z redoes', async ({
		page,
		browserName,
	}) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();
		await expect(page.getByLabel('Annotation id')).toHaveCount(1);

		// focus must be outside inputs/textareas for the shortcut to fire.
		await page.getByRole('heading', { name: 'Editor', level: 1 }).click();

		const mod = browserName === 'webkit' ? 'Meta' : 'Control';
		await page.keyboard.press(`${mod}+z`);
		await expect(page.getByText('No annotations yet.')).toBeVisible();

		await page.keyboard.press(`${mod}+Shift+z`);
		await expect(page.getByLabel('Annotation id')).toHaveCount(1);
	});

	test('keyboard shortcut is ignored when focus is in a textarea', async ({
		page,
		browserName,
	}) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();
		const mod = browserName === 'webkit' ? 'Meta' : 'Control';

		await page.getByLabel('Text').first().focus();
		await page.keyboard.press(`${mod}+z`);
		// annotation still present
		await expect(page.getByLabel('Annotation id')).toHaveCount(1);
	});
});
