import { test, expect, gotoEditor, addAnnotationButton } from './helpers';

test.describe('annotations panel', () => {
	test('Add creates a blank annotation row', async ({ page }) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();

		await expect(page.getByLabel('Annotation id').first()).toBeVisible();
		await expect(page.getByLabel('Token').first()).toHaveValue('');
	});

	test('editing annotation fields persists the values', async ({ page }) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();

		await page.getByLabel('Annotation id').first().fill('hello');
		await page.getByLabel('Token').first().fill('greet');
		await page.getByLabel('Line').first().fill('1');
		await page.getByLabel('Occurrence').first().fill('1');
		await page.getByLabel('Title').first().fill('Function name');
		await page.getByLabel('Text').first().fill('The greeting function');

		await expect(page.getByLabel('Annotation id').first()).toHaveValue('hello');
		await expect(page.getByLabel('Token').first()).toHaveValue('greet');
		await expect(page.getByLabel('Title').first()).toHaveValue('Function name');
		await expect(page.getByLabel('Text').first()).toHaveValue(
			'The greeting function',
		);
	});

	test('Remove deletes the annotation row', async ({ page }) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();
		await expect(page.getByLabel('Annotation id')).toHaveCount(1);

		await page
			.getByRole('button', { name: 'Remove annotation' })
			.first()
			.click();
		await expect(page.getByText('No annotations yet.')).toBeVisible();
	});

	test('popover and defaultOpen checkboxes toggle', async ({ page }) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();

		const row = page
			.locator('[aria-label="Annotation id"]')
			.first()
			.locator('..')
			.locator('..');
		const popover = row
			.getByLabel('popover', { exact: false })
			.or(
				row
					.locator('label', { hasText: 'popover' })
					.locator('input[type="checkbox"]'),
			)
			.first();
		const defaultOpen = row
			.locator('label', { hasText: 'defaultOpen' })
			.locator('input[type="checkbox"]')
			.first();

		await popover.check();
		await expect(popover).toBeChecked();
		await defaultOpen.check();
		await expect(defaultOpen).toBeChecked();
	});
});
