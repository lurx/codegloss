import { afterEach, describe, expect, it } from 'vitest';
import { applyGlobalTheme } from '..';

afterEach(() => {
	document.body.innerHTML = '';
});

describe('applyGlobalTheme', () => {
	it('sets the theme attribute on every <code-gloss> that does not already have one', () => {
		document.body.innerHTML = `
			<code-gloss id="a"></code-gloss>
			<code-gloss id="b"></code-gloss>
		`;

		applyGlobalTheme('github-dark');

		expect(document.getElementById('a')?.getAttribute('theme')).toBe('github-dark');
		expect(document.getElementById('b')?.getAttribute('theme')).toBe('github-dark');
	});

	it('leaves existing theme attributes alone', () => {
		document.body.innerHTML = `
			<code-gloss id="explicit" theme="dracula"></code-gloss>
			<code-gloss id="implicit"></code-gloss>
		`;

		applyGlobalTheme('github-dark');

		expect(document.getElementById('explicit')?.getAttribute('theme')).toBe('dracula');
		expect(document.getElementById('implicit')?.getAttribute('theme')).toBe('github-dark');
	});
});
