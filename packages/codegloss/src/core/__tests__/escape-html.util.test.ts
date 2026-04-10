import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../escape-html.util';

describe('escapeHtml', () => {
	it('returns an empty string unchanged', () => {
		expect(escapeHtml('')).toBe('');
	});

	it('passes through strings with no special characters', () => {
		expect(escapeHtml('hello world 123')).toBe('hello world 123');
	});

	it('escapes ampersands', () => {
		expect(escapeHtml('a & b')).toBe('a &amp; b');
	});

	it('escapes less-than signs', () => {
		expect(escapeHtml('a < b')).toBe('a &lt; b');
	});

	it('escapes greater-than signs', () => {
		expect(escapeHtml('a > b')).toBe('a &gt; b');
	});

	it('escapes double quotes', () => {
		expect(escapeHtml('say "hi"')).toBe('say &quot;hi&quot;');
	});

	it('escapes single quotes', () => {
		expect(escapeHtml("it's")).toBe('it&#39;s');
	});

	it('escapes ampersand before other entities so existing entities are not double-escaped incorrectly', () => {
		// & must be replaced first; otherwise &lt; would become &amp;lt;
		expect(escapeHtml('<tag>')).toBe('&lt;tag&gt;');
		expect(escapeHtml('&amp;')).toBe('&amp;amp;');
	});

	it('escapes a mixture of all special characters', () => {
		expect(escapeHtml(`<a href="x">'b' & c</a>`)).toBe(
			'&lt;a href=&quot;x&quot;&gt;&#39;b&#39; &amp; c&lt;/a&gt;',
		);
	});

	it('preserves non-ASCII characters', () => {
		expect(escapeHtml('héllo · 你好 · 🎉')).toBe('héllo · 你好 · 🎉');
	});

	it('escapes every occurrence of a repeated character', () => {
		expect(escapeHtml('<<>>')).toBe('&lt;&lt;&gt;&gt;');
	});
});
