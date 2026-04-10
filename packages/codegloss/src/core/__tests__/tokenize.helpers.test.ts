import { describe, expect, it } from 'vitest';

import {
  buildLineHtmlFallback,
  findAnnotationHits,
  highlightPlainText,
} from '../tokenize.helpers';

import type { Annotation } from '../code-gloss.types';

const ann = (overrides: Partial<Annotation> = {}): Annotation => ({
  id: 'a1',
  token: 'foo',
  line: 0,
  occurrence: 0,
  title: 'Foo',
  text: 'A foo',
  ...overrides,
});

describe('highlightPlainText', () => {
  it('returns empty string for empty input', () => {
    expect(highlightPlainText('')).toBe('');
  });

  it('escapes plain text with no syntax matches', () => {
    expect(highlightPlainText('a < b & c')).toBe('a &lt; b &amp; c');
  });

  it('wraps line comments in a comment span', () => {
    expect(highlightPlainText('// hello')).toBe(
      '<span class="cg-comment">// hello</span>',
    );
  });

  it('wraps keywords in a keyword span', () => {
    expect(highlightPlainText('const')).toBe(
      '<span class="cg-keyword">const</span>',
    );
  });

  it('wraps single-quoted strings', () => {
    expect(highlightPlainText("'hi'")).toBe(
      '<span class="cg-string">&#39;hi&#39;</span>',
    );
  });

  it('wraps double-quoted strings', () => {
    expect(highlightPlainText('"hi"')).toBe(
      '<span class="cg-string">&quot;hi&quot;</span>',
    );
  });

  it('wraps template-literal strings', () => {
    expect(highlightPlainText('`hi`')).toBe(
      '<span class="cg-string">`hi`</span>',
    );
  });

  it('wraps numbers (including decimals)', () => {
    expect(highlightPlainText('1.5')).toBe(
      '<span class="cg-number">1.5</span>',
    );
  });

  it('recurses into the text before and after a match', () => {
    // "const x = 1" → keyword wraps "const", then number wraps "1"
    expect(highlightPlainText('const x = 1')).toBe(
      '<span class="cg-keyword">const</span> x = <span class="cg-number">1</span>',
    );
  });

  it('escapes characters inside the recursion fallback', () => {
    expect(highlightPlainText('const a < b')).toBe(
      '<span class="cg-keyword">const</span> a &lt; b',
    );
  });

  it('handles strings containing escaped quote characters', () => {
    expect(highlightPlainText("'a\\'b'")).toBe(
      `<span class="cg-string">&#39;a\\&#39;b&#39;</span>`,
    );
  });
});

describe('findAnnotationHits', () => {
  it('returns no hits when there are no annotations on the line', () => {
    expect(findAnnotationHits('foo bar', 0, [ann({ line: 1 })])).toEqual([]);
  });

  it('returns no hits when the token is not present on the line', () => {
    expect(findAnnotationHits('bar baz', 0, [ann({ token: 'foo' })])).toEqual([]);
  });

  it('returns no hits when the requested occurrence is not present', () => {
    expect(
      findAnnotationHits('foo', 0, [ann({ token: 'foo', occurrence: 5 })]),
    ).toEqual([]);
  });

  it('returns a hit at the first occurrence by default', () => {
    const a = ann({ token: 'foo', occurrence: 0 });
    expect(findAnnotationHits('foo bar', 0, [a])).toEqual([
      { start: 0, end: 3, annotation: a },
    ]);
  });

  it('selects the requested occurrence of a repeated token', () => {
    const a = ann({ token: 'foo', occurrence: 1 });
    expect(findAnnotationHits('foo foo foo', 0, [a])).toEqual([
      { start: 4, end: 7, annotation: a },
    ]);
  });

  it('sorts hits by start position', () => {
    const first = ann({ id: 'a1', token: 'bar' });
    const second = ann({ id: 'a2', token: 'foo' });
    const hits = findAnnotationHits('foo bar', 0, [first, second]);
    expect(hits.map((h) => h.annotation.id)).toEqual(['a2', 'a1']);
  });

  it('drops a later hit that overlaps an earlier one', () => {
    const wide = ann({ id: 'wide', token: 'foobar' });
    const narrow = ann({ id: 'narrow', token: 'oba' });
    const hits = findAnnotationHits('foobar', 0, [wide, narrow]);
    expect(hits).toHaveLength(1);
    expect(hits[0].annotation.id).toBe('wide');
  });
});

describe('buildLineHtmlFallback', () => {
  it('falls back to highlightPlainText when there are no hits', () => {
    expect(buildLineHtmlFallback('const x', 0, [])).toBe(
      '<span class="cg-keyword">const</span> x',
    );
  });

  it('wraps annotated tokens in a mark, with surrounding text highlighted', () => {
    const a = ann({ id: 'a1', token: 'memo' });
    expect(buildLineHtmlFallback('const memo = {}', 0, [a])).toBe(
      '<span class="cg-keyword">const</span> ' +
        '<mark class="atk" data-ann-id="a1">memo</mark>' +
        ' = {}',
    );
  });

  it('handles a hit at the very start of the line', () => {
    const a = ann({ id: 'a1', token: 'foo' });
    expect(buildLineHtmlFallback('foo bar', 0, [a])).toBe(
      '<mark class="atk" data-ann-id="a1">foo</mark> bar',
    );
  });

  it('handles a hit at the very end of the line', () => {
    const a = ann({ id: 'a1', token: 'bar' });
    expect(buildLineHtmlFallback('foo bar', 0, [a])).toBe(
      'foo <mark class="atk" data-ann-id="a1">bar</mark>',
    );
  });

  it('escapes special characters inside annotation tokens', () => {
    const a = ann({ id: 'a1', token: '<x>' });
    expect(buildLineHtmlFallback('a <x> b', 0, [a])).toBe(
      'a <mark class="atk" data-ann-id="a1">&lt;x&gt;</mark> b',
    );
  });

  it('renders multiple non-overlapping hits in order', () => {
    const a = ann({ id: 'a1', token: 'foo' });
    const b = ann({ id: 'a2', token: 'baz' });
    expect(buildLineHtmlFallback('foo bar baz', 0, [a, b])).toBe(
      '<mark class="atk" data-ann-id="a1">foo</mark> bar ' +
        '<mark class="atk" data-ann-id="a2">baz</mark>',
    );
  });
});
