import { describe, expect, it } from 'vitest';
import { importConfig } from '../import-config.helpers';

describe('importConfig empty & detection', () => {
	it('rejects empty input', () => {
		const result = importConfig('   ');
		expect(result).toEqual({ ok: false, error: 'Input is empty' });
	});
});

describe('importConfig JSON', () => {
	it('parses a minimal JSON payload', () => {
		const result = importConfig(
			JSON.stringify({ code: 'x', lang: 'js' }),
		);
		if (!result.ok) throw new Error('expected success');
		expect(result.format).toBe('json');
		expect(result.config.code).toBe('x');
		expect(result.config.annotations).toEqual([]);
		expect(result.config.connections).toEqual([]);
	});

	it('coerces all optional fields', () => {
		const result = importConfig(
			JSON.stringify({
				code: 'x',
				lang: 'js',
				filename: 'a.js',
				runnable: true,
				theme: 'dark',
				arcs: { opacity: 0.5 },
				callouts: { popover: true },
				annotations: [{ id: 'a1', token: 'x', line: 0, occurrence: 0 }],
				connections: [{ from: 'a1', to: 'a2', color: '#000' }],
			}),
		);
		if (!result.ok) throw new Error('expected success');
		expect(result.config.filename).toBe('a.js');
		expect(result.config.runnable).toBe(true);
		expect(result.config.theme).toBe('dark');
		expect(result.config.arcs).toEqual({ opacity: 0.5 });
		expect(result.config.callouts).toEqual({ popover: true });
		expect(result.config.annotations).toHaveLength(1);
		expect(result.config.connections).toHaveLength(1);
	});

	it('drops non-matching optional types silently', () => {
		const result = importConfig(
			JSON.stringify({
				code: 'x',
				lang: 'js',
				filename: 1,
				runnable: 'yes',
				theme: 2,
				arcs: 'no',
				callouts: null,
				annotations: 'nope',
				connections: 'nope',
			}),
		);
		if (!result.ok) throw new Error('expected success');
		expect(result.config.filename).toBeUndefined();
		expect(result.config.runnable).toBeUndefined();
		expect(result.config.theme).toBeUndefined();
		expect(result.config.arcs).toBeUndefined();
		expect(result.config.callouts).toBeUndefined();
		expect(result.config.annotations).toEqual([]);
		expect(result.config.connections).toEqual([]);
	});

	it('errors when code or lang is missing or wrong type', () => {
		const a = importConfig(JSON.stringify({ lang: 'js' }));
		const b = importConfig(JSON.stringify({ code: 'x' }));
		expect(a.ok).toBe(false);
		expect(b.ok).toBe(false);
		if (!a.ok) expect(a.error).toMatch(/JSON: Missing or invalid `code`/);
		if (!b.ok) expect(b.error).toMatch(/JSON: Missing or invalid `lang`/);
	});

	it('wraps malformed JSON in an error result', () => {
		const result = importConfig('{not json');
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.startsWith('JSON:')).toBe(true);
	});
});

describe('importConfig MDX', () => {
	it('parses a sandbox fence with filename and annotations block', () => {
		const input = [
			'```js sandbox demo.js',
			'const x = 1;',
			'```',
			'',
			'```json annotations',
			JSON.stringify({
				annotations: [
					{ id: 'a1', token: 'x', line: 0, occurrence: 0 },
				],
				connections: [{ from: 'a1', to: 'a2', color: '#000' }],
				arcs: { opacity: 0.5 },
				callouts: { popover: true },
			}),
			'```',
		].join('\n');

		const result = importConfig(input);
		if (!result.ok) throw new Error(`expected success: ${result.error}`);
		expect(result.format).toBe('mdx');
		expect(result.config.code).toBe('const x = 1;');
		expect(result.config.lang).toBe('js');
		expect(result.config.filename).toBe('demo.js');
		expect(result.config.annotations).toHaveLength(1);
		expect(result.config.connections).toHaveLength(1);
		expect(result.config.arcs).toEqual({ opacity: 0.5 });
	});

	it('treats an unfiltered sandbox fence as an mdx import without filename', () => {
		const input = '```js sandbox\nconst x = 1;\n```';
		const result = importConfig(input);
		if (!result.ok) throw new Error('expected success');
		expect(result.format).toBe('mdx');
		expect(result.config.filename).toBeUndefined();
	});

	it('errors when no sandbox fence is present', () => {
		const result = importConfig('some plain markdown');
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/MDX: Could not find/);
	});
});

describe('importConfig JSX', () => {
	it('parses string and expression attributes on a self-closing tag', () => {
		const input =
			'<CodeGloss code={"const x = 1;"} lang="js" filename="f.js" runnable theme="dark" arcs={{"opacity":0.5}} annotations={[{"id":"a1","token":"x","line":0,"occurrence":0}]} />';
		const result = importConfig(input);
		if (!result.ok) throw new Error(`expected success: ${result.error}`);
		expect(result.format).toBe('jsx');
		expect(result.config.code).toBe('const x = 1;');
		expect(result.config.filename).toBe('f.js');
		expect(result.config.runnable).toBe(true);
		expect(result.config.theme).toBe('dark');
		expect(result.config.arcs).toEqual({ opacity: 0.5 });
		expect(result.config.annotations).toHaveLength(1);
	});

	it('respects runnable={false} explicit disable', () => {
		const input = '<CodeGloss code="x" lang="js" runnable={false} />';
		const result = importConfig(input);
		if (!result.ok) throw new Error('expected success');
		expect(result.config.runnable).toBe(false);
	});

	it('handles non-self-closing tags and nested braces inside expressions', () => {
		const input =
			'<CodeGloss code="x" lang="js" callouts={{"popover":true}}>children</CodeGloss>';
		const result = importConfig(input);
		if (!result.ok) throw new Error('expected success');
		expect(result.config.callouts).toEqual({ popover: true });
	});

	it('skips string literals containing stray braces, including escapes', () => {
		const input =
			'<CodeGloss code={"function f() { return \\"}\\"; }"} lang="js" />';
		const result = importConfig(input);
		if (!result.ok) throw new Error(`expected success: ${result.error}`);
		expect(result.config.code).toContain('return "}"');
	});

	it('errors on a missing CodeGloss element', () => {
		const result = importConfig('<div />');
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/JSX: Could not find/);
	});

	it('errors on an unterminated expression attribute', () => {
		// self-closed tag so parseJsx reaches extractBracedBody; the {{ "unfinished
		// string exercises both the string-literal-to-end and braced-body throws.
		const result = importConfig(
			'<CodeGloss code="a" lang="js" arcs={{"unfinished />',
		);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/JSX:/);
	});

	it('errors on an unterminated element', () => {
		const result = importConfig('<CodeGloss code="x" lang="js"');
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/JSX:/);
	});
});
