/**
 * SSR safety smoke test. Runs in the `node` Vitest project where there is no
 * `HTMLElement`, no `CSSStyleSheet`, and no `customElements` global. Importing
 * the module must not crash, and `defineCodeGloss()` must be a no-op.
 */
import { describe, expect, it } from 'vitest';
import { CodeGlossElement, defineCodeGloss } from '../code-gloss.element';

describe('CodeGlossElement (SSR / no DOM)', () => {
	it('confirms the test environment has no DOM globals', () => {
		expect(typeof HTMLElement).toBe('undefined');
		expect(typeof customElements).toBe('undefined');
		expect(typeof CSSStyleSheet).toBe('undefined');
	});

	it('imports the module without throwing', () => {
		expect(CodeGlossElement).toBeDefined();
		expect(typeof CodeGlossElement).toBe('function');
	});

	it('defineCodeGloss() is a no-op when customElements is undefined', () => {
		expect(() => defineCodeGloss()).not.toThrow();
	});
});
