import {
	test,
	expect,
	gotoEditor,
	addAnnotationButton,
	addConnectionButton,
} from './helpers';

test.describe('connections panel', () => {
	test('Add is disabled with fewer than two annotations', async ({ page }) => {
		await gotoEditor(page);
		await expect(addConnectionButton(page)).toBeDisabled();
		await expect(
			page.getByText('Add at least two annotations to create a connection.'),
		).toBeVisible();

		await addAnnotationButton(page).click();
		await expect(addConnectionButton(page)).toBeDisabled();
	});

	test('Add enables after two annotations and creates a connection', async ({
		page,
	}) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();
		await addAnnotationButton(page).click();

		await page.getByLabel('Annotation id').first().fill('a1');
		await page.getByLabel('Annotation id').nth(1).fill('a2');

		await expect(addConnectionButton(page)).toBeEnabled();
		await addConnectionButton(page).click();

		await expect(page.getByLabel('From annotation')).toHaveCount(1);
		await expect(page.getByLabel('To annotation')).toHaveCount(1);
	});

	test('editing connection fields updates values', async ({ page }) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();
		await addAnnotationButton(page).click();
		await page.getByLabel('Annotation id').first().fill('a1');
		await page.getByLabel('Annotation id').nth(1).fill('a2');
		await addConnectionButton(page).click();

		await page.getByLabel('From annotation').selectOption('a1');
		await page.getByLabel('To annotation').selectOption('a2');
		await page.getByLabel('Side').selectOption('right');
		await page.getByLabel('Title').last().fill('link');
		await page.getByLabel('Text').last().fill('explanation');

		await expect(page.getByLabel('From annotation')).toHaveValue('a1');
		await expect(page.getByLabel('To annotation')).toHaveValue('a2');
		await expect(page.getByLabel('Side')).toHaveValue('right');
	});

	test('Remove deletes the connection row', async ({ page }) => {
		await gotoEditor(page);
		await addAnnotationButton(page).click();
		await addAnnotationButton(page).click();
		await page.getByLabel('Annotation id').first().fill('a1');
		await page.getByLabel('Annotation id').nth(1).fill('a2');
		await addConnectionButton(page).click();

		await page.getByRole('button', { name: 'Remove connection' }).click();
		await expect(page.getByText('No connections yet.')).toBeVisible();
	});
});
