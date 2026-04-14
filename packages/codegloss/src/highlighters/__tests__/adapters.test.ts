import { describe, it, expect, vi } from 'vitest';
import { createShikiHighlighter } from '../shiki';
import { createPrismHighlighter } from '../prism';
import { createHljsHighlighter } from '../hljs';

describe('createShikiHighlighter', () => {
	it('calls codeToHtml with lang and theme, and strips pre/code wrappers', () => {
		const codeToHtml = vi.fn(
			() =>
				'<pre class="shiki github-dark" tabindex="0"><code><span class="line">const x = 1</span></code></pre>',
		);
		const shiki = { codeToHtml };

		const highlight = createShikiHighlighter(shiki, { theme: 'github-dark' });
		const html = highlight('const x = 1', 'ts');

		expect(codeToHtml).toHaveBeenCalledWith('const x = 1', {
			lang: 'ts',
			theme: 'github-dark',
		});
		expect(html).toBe('<span class="line">const x = 1</span>');
	});

	it('passes themes map through when provided', () => {
		const codeToHtml = vi.fn(() => '<pre><code>x</code></pre>');
		const shiki = { codeToHtml };

		createShikiHighlighter(shiki, {
			themes: { light: 'github-light', dark: 'github-dark' },
		})('x', 'js');

		expect(codeToHtml).toHaveBeenCalledWith('x', {
			lang: 'js',
			themes: { light: 'github-light', dark: 'github-dark' },
		});
	});

	it('works without any theme option', () => {
		const codeToHtml = vi.fn(() => '<pre><code>y</code></pre>');
		const shiki = { codeToHtml };

		createShikiHighlighter(shiki)('y', 'js');

		expect(codeToHtml).toHaveBeenCalledWith('y', {
			lang: 'js',
			theme: undefined,
		});
	});
});

describe('createPrismHighlighter', () => {
	it('uses the matching grammar when one is registered', () => {
		const jsGrammar = { _token: 'js' };
		const highlight = vi.fn(() => '<span class="token">const</span>');
		const Prism = {
			highlight,
			languages: { js: jsGrammar, plain: { _token: 'plain' } },
		};

		const result = createPrismHighlighter(Prism)('const', 'js');

		expect(highlight).toHaveBeenCalledWith('const', jsGrammar, 'js');
		expect(result).toBe('<span class="token">const</span>');
	});

	it('falls back to the plain grammar when the language is missing', () => {
		const plainGrammar = { _token: 'plain' };
		const highlight = vi.fn(() => 'nope');
		const Prism = { highlight, languages: { plain: plainGrammar } };

		createPrismHighlighter(Prism)('x', 'lolcode');

		expect(highlight).toHaveBeenCalledWith('x', plainGrammar, 'lolcode');
	});
});

describe('createHljsHighlighter', () => {
	it('highlights with the requested language when hljs knows it', () => {
		const hljs = {
			highlight: vi.fn(() => ({ value: '<span class="hljs-keyword">const</span>' })),
			getLanguage: vi.fn(() => ({})),
		};

		const result = createHljsHighlighter(hljs)('const', 'ts');

		expect(hljs.getLanguage).toHaveBeenCalledWith('ts');
		expect(hljs.highlight).toHaveBeenCalledWith('const', {
			language: 'ts',
			ignoreIllegals: true,
		});
		expect(result).toBe('<span class="hljs-keyword">const</span>');
	});

	it('falls back to plaintext when the language is not registered', () => {
		const hljs = {
			highlight: vi.fn(() => ({ value: 'plain' })),
			getLanguage: vi.fn(() => undefined),
		};

		createHljsHighlighter(hljs)('x', 'rustacean');

		expect(hljs.highlight).toHaveBeenCalledWith('x', {
			language: 'plaintext',
			ignoreIllegals: true,
		});
	});
});
