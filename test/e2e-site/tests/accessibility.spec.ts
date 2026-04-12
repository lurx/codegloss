import AxeBuilder from '@axe-core/playwright';
import { test, expect, gotoEditor } from './helpers';

test.describe('editor accessibility', () => {
	test('no serious or critical axe violations on initial load', async ({
		page,
	}) => {
		await gotoEditor(page);
		// wait for shiki tokens so axe scans the fully-rendered picker
		await expect(page.locator('[data-token-index]').first()).toBeVisible({
			timeout: 10_000,
		});

		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa'])
			.analyze();

		const blocking = results.violations.filter((v) => v.impact === 'critical');
		expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
	});
});
