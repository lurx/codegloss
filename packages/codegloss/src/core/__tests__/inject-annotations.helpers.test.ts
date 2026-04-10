import { describe, expect, it } from 'vitest';
import { injectAnnotationsIntoHtml } from '../inject-annotations.helpers';
import type { Annotation, AnnotationHit } from '../code-gloss.types';

const baseAnn: Annotation = {
	id: 'a1',
	token: 'x',
	line: 0,
	occurrence: 0,
	title: 'X',
	text: 'tip',
};

const hit = (start: number, end: number, id = 'a1'): AnnotationHit => ({
	start,
	end,
	annotation: { ...baseAnn, id },
});

const open = (id: string) => `<mark class="atk" data-ann-id="${id}">`;
const close = '</mark>';

describe('injectAnnotationsIntoHtml', () => {
	it('returns the html unchanged when there are no hits', () => {
		expect(injectAnnotationsIntoHtml('<span>x</span>', [])).toBe(
			'<span>x</span>',
		);
	});

	it('wraps a span of plain text with no surrounding tags', () => {
		expect(injectAnnotationsIntoHtml('memo = {}', [hit(0, 4)])).toBe(
			`${open('a1')}memo${close} = {}`,
		);
	});

	it('wraps text inside an existing tag without breaking the tag structure', () => {
		// Plain text "const memo = {};" → wrap "memo" at indices 6..10
		const html = '<span class="kw">const</span> memo = {};';
		expect(injectAnnotationsIntoHtml(html, [hit(6, 10)])).toBe(
			`<span class="kw">const</span> ${open('a1')}memo${close} = {};`,
		);
	});

	it('wraps an HTML entity that occupies a single plain-text position', () => {
		// Plain text "<tag>" — wrap the leading "<"
		const html = '&lt;tag&gt;';
		expect(injectAnnotationsIntoHtml(html, [hit(0, 1)])).toBe(
			`${open('a1')}&lt;${close}tag&gt;`,
		);
	});

	it('extends a hit through a trailing entity (close after the semicolon)', () => {
		// Plain text "a &" — wrap "a &" (3 plain chars)
		const html = 'a &amp;';
		expect(injectAnnotationsIntoHtml(html, [hit(0, 3)])).toBe(
			`${open('a1')}a &amp;${close}`,
		);
	});

	it('clamps a hit whose end exceeds the plain-text length', () => {
		// Plain text "abc" (3 chars), hit covers 0..10 → clamps to last char
		expect(injectAnnotationsIntoHtml('abc', [hit(0, 10)])).toBe(
			`${open('a1')}abc${close}`,
		);
	});

	it('skips a hit whose start is past the end of the plain text', () => {
		expect(injectAnnotationsIntoHtml('abc', [hit(5, 6)])).toBe('abc');
	});

	it('handles a lone ampersand at the end of the html (no terminating semicolon)', () => {
		// FindEndOfChar branch: indexOf(';') === -1 → falls back to idx + 1
		expect(injectAnnotationsIntoHtml('&', [hit(0, 1)])).toBe(
			`${open('a1')}&${close}`,
		);
	});

	it('nests two hits that share a start position (outer span longer)', () => {
		// Exercises the sort tiebreaker on equal htmlIndex: both opens land at 0
		// and stable-sort ordering nests the longer hit on the outside.
		expect(
			injectAnnotationsIntoHtml('abcdef', [
				hit(0, 3, 'inner'),
				hit(0, 5, 'outer'),
			]),
		).toBe(`${open('outer')}${open('inner')}abc${close}de${close}f`);
	});

	it('inserts multiple non-overlapping hits in the correct order', () => {
		const html = '<span>foo bar baz</span>';
		// Plain text "foo bar baz", indices: foo 0..3, baz 8..11
		const hits = [hit(0, 3, 'a1'), hit(8, 11, 'a2')];
		expect(injectAnnotationsIntoHtml(html, hits)).toBe(
			`<span>${open('a1')}foo${close} bar ${open('a2')}baz${close}</span>`,
		);
	});
});
