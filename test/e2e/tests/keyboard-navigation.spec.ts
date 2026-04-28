import { expect, test } from '@playwright/test';

declare global {
	// eslint-disable-next-line no-var
	var __copied: string | undefined;
}

// Helper: read the active element's identifying attributes from inside the
// component's shadow DOM. We can't use page.locator(':focus') reliably across
// shadow boundaries, so we evaluate document.activeElement and its shadowRoot
// chain manually.
async function describeFocus(page: import('@playwright/test').Page) {
	return page.evaluate(() => {
		let el: Element | null = document.activeElement;
		// Walk into shadow roots to find the deepest active element.
		while (el && (el as HTMLElement).shadowRoot?.activeElement) {
			el = (el as HTMLElement).shadowRoot!.activeElement as Element;
		}
		if (!el) return null;
		return {
			tag: el.tagName.toLowerCase(),
			className: (el as HTMLElement).className ?? '',
			ariaLabel: el.getAttribute('aria-label') ?? '',
		};
	});
}

test.describe('keyboard navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/vanilla-fibonacci.html');
		await expect(page.locator('code-gloss .codegloss')).toBeVisible();
	});

	test('Tab walks through the toolbar buttons in order', async ({
		page,
		browserName,
	}) => {
		// WebKit's default tab order skips form controls unless macOS "Full
		// Keyboard Access" is enabled, which we can't toggle from a Playwright
		// run. The keyboard reachability is browser-engine territory; we cover
		// the focusability of buttons in the programmatic-focus test below.
		test.skip(
			browserName === 'webkit',
			'WebKit default tab order skips buttons',
		);

		// Click outside the WC first to ensure we start from a known focus state.
		await page.locator('h1').click();

		// Tab until we land on the copy button. The page has minimal chrome
		// outside the WC, so this should be one or two presses depending on the
		// browser's default tab order.
		for (let i = 0; i < 6; i++) {
			await page.keyboard.press('Tab');
			const focus = await describeFocus(page);
			if (focus?.className?.includes('copyButton')) break;
		}

		const focus = await describeFocus(page);
		expect(focus?.className).toContain('copyButton');
		expect(focus?.ariaLabel).toBe('Copy code');
	});

	test('Enter on the focused copy button triggers the copy action', async ({
		page,
		browserName,
		context,
	}) => {
		if (browserName === 'chromium') {
			await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		}

		// Stub clipboard.writeText so the test works on all 3 browsers.
		await page.addInitScript(() => {
			globalThis.__copied = undefined;
			const fake = async (text: string) => {
				globalThis.__copied = text;
			};
			try {
				navigator.clipboard.writeText = fake;
			} catch {
				(
					navigator as unknown as { clipboard: { writeText: typeof fake } }
				).clipboard = {
					writeText: fake,
				};
			}
		});
		await page.reload();
		await expect(page.locator('code-gloss .codegloss')).toBeVisible();

		// Focus the copy button programmatically (more reliable than chasing it
		// with Tab presses across browsers with different shadow-tab semantics).
		await page.locator('code-gloss').evaluate(el => {
			const btn =
				el.shadowRoot?.querySelector<HTMLButtonElement>('.copyButton');
			btn?.focus();
		});

		await page.keyboard.press('Enter');
		const copied = await page.evaluate(() => globalThis.__copied);
		expect(copied).toContain('function fib');
	});

	test('Escape dismisses an open callout regardless of where focus is', async ({
		page,
	}) => {
		const wc = page.locator('code-gloss');
		await wc.locator('css=mark[data-ann-id="a1"]').first().click();
		await expect(wc.locator('css=.callout')).toBeVisible();

		// Move focus to the body so Escape isn't being received by the close
		// button. The keyHandler on the element listens at the document level.
		await page.locator('h1').click();
		await page.keyboard.press('Escape');

		await expect(wc.locator('css=.callout')).toHaveCount(0);
	});
});
