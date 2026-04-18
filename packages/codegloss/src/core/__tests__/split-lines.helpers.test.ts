import { describe, it, expect } from 'vitest';
import { splitHighlightedLines } from '../split-lines.helpers';

describe('splitHighlightedLines', () => {
	it('returns a single-entry array for input without newlines', () => {
		expect(splitHighlightedLines('<span class="k">const</span>')).toEqual([
			'<span class="k">const</span>',
		]);
	});

	it('splits plain text on newlines', () => {
		expect(splitHighlightedLines('one\ntwo\nthree')).toEqual([
			'one',
			'two',
			'three',
		]);
	});

	it('closes and reopens spans that cross a newline', () => {
		const html = '<span class="str">"line1\nline2"</span>';
		expect(splitHighlightedLines(html)).toEqual([
			'<span class="str">"line1</span>',
			'<span class="str">line2"</span>',
		]);
	});

	it('handles nested spans across multiple lines', () => {
		const html = '<span class="a"><span class="b">x\ny\nz</span></span>';
		expect(splitHighlightedLines(html)).toEqual([
			'<span class="a"><span class="b">x</span></span>',
			'<span class="a"><span class="b">y</span></span>',
			'<span class="a"><span class="b">z</span></span>',
		]);
	});

	it('preserves void tags without pushing to the open stack', () => {
		expect(splitHighlightedLines('a<br/>b\nc')).toEqual(['a<br/>b', 'c']);
	});

	it('keeps HTML entities intact', () => {
		expect(splitHighlightedLines('&lt;div&gt;\n&amp;')).toEqual([
			'&lt;div&gt;',
			'&amp;',
		]);
	});

	it('emits an empty trailing line for a final newline', () => {
		expect(splitHighlightedLines('a\n')).toEqual(['a', '']);
	});

	it('treats a stray & as literal when no nearby ; follows', () => {
		expect(splitHighlightedLines('a & b')).toEqual(['a & b']);
		expect(splitHighlightedLines('a & verylongentityname;')).toEqual([
			'a & verylongentityname;',
		]);
	});

	it('flushes unterminated tag fragments to the current line', () => {
		expect(splitHighlightedLines('ok<span')).toEqual(['ok<span']);
	});

	it('is unaffected by comment nodes', () => {
		expect(splitHighlightedLines('<!-- c -->one\ntwo')).toEqual([
			'<!-- c -->one',
			'two',
		]);
	});
});
