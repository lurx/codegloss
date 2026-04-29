import { test, expect, gotoEditor } from './helpers';

test.describe('token picker', () => {
	test('clicking a token adds an annotation with line & occurrence', async ({
		page,
	}) => {
		await gotoEditor(page);

		// wait for Shiki tokens to render
		const greetToken = page
			.locator('[data-token-index]', { hasText: 'greet' })
			.first();
		await expect(greetToken).toBeVisible({ timeout: 10_000 });
		await greetToken.click();

		// A new annotation row should appear; token field should read "greet".
		const tokenInput = page.getByLabel('Token').first();
		await expect(tokenInput).toBeVisible();
		await expect(tokenInput).toHaveValue('greet');

		await expect(page.getByLabel('Annotation id').first()).toHaveValue('a1');
	});

	test('clicking multiple tokens appends multiple annotations', async ({
		page,
	}) => {
		await gotoEditor(page);

		await page
			.locator('[data-token-index]', { hasText: 'greet' })
			.first()
			.click({ timeout: 10_000 });
		await page
			.locator('[data-token-index]', { hasText: 'message' })
			.first()
			.click();

		await expect(page.getByLabel('Annotation id')).toHaveCount(2);
	});
});
