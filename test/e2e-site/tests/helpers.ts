import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export const STORAGE_KEY = 'codegloss:editor:draft';
export const TOUR_STORAGE_KEY = 'codegloss:editor:tour-seen';

export const test = base.extend({
	page: async ({ page }, use) => {
		await page.addInitScript(
			({ draftKey, tourKey }) => {
				try {
					window.localStorage.removeItem(draftKey);
					window.localStorage.setItem(tourKey, '1');
				} catch {
					/* ignore */
				}
			},
			{ draftKey: STORAGE_KEY, tourKey: TOUR_STORAGE_KEY },
		);
		await use(page);
	},
});

export { expect };

export async function gotoEditor(page: Page): Promise<void> {
	await page.goto('/editor');
	await expect(page.getByRole('heading', { name: 'Editor', level: 1 })).toBeVisible();
}

export function codeTextarea(page: Page) {
	return page.getByLabel('Code', { exact: true });
}

export function langInput(page: Page) {
	return page.getByLabel('Language', { exact: true });
}

export function filenameInput(page: Page) {
	return page.getByLabel('Filename', { exact: true });
}

export function addAnnotationButton(page: Page) {
	return page.getByRole('button', { name: 'Add' }).first();
}

export function addConnectionButton(page: Page) {
	return page.getByRole('button', { name: 'Add' }).nth(1);
}

export function undoButton(page: Page) {
	return page.getByRole('button', { name: /Undo/ });
}

export function redoButton(page: Page) {
	return page.getByRole('button', { name: /Redo/ });
}

export function importButton(page: Page) {
	return page.getByRole('button', { name: /Import/ });
}

export function settingsButton(page: Page) {
	return page.getByRole('button', { name: 'Settings' });
}
