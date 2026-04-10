import { describe, expect, it } from 'vitest';
import type { Code, Paragraph } from 'mdast';
import { detectSandboxPair } from '../detect.helpers';

const code = (overrides: Partial<Code>): Code => ({
	type: 'code',
	lang: null,
	meta: null,
	value: '',
	...overrides,
});

const paragraph: Paragraph = {
	type: 'paragraph',
	children: [{ type: 'text', value: 'hi' }],
};

describe('detectSandboxPair', () => {
	it('returns null for a non-code node', () => {
		expect(detectSandboxPair([paragraph], 0)).toBeNull();
	});

	it('returns null for a plain code fence with no sandbox marker', () => {
		expect(
			detectSandboxPair([code({ lang: 'js', value: 'let x = 1' })], 0),
		).toBeNull();
	});

	it('returns null when the lang is sandbox-shaped but missing the sandbox keyword', () => {
		expect(
			detectSandboxPair([code({ lang: 'js', meta: 'foo' })], 0),
		).toBeNull();
	});

	it('detects a sandbox fence with no filename and no annotations', () => {
		const node = code({ lang: 'js', meta: 'sandbox', value: 'console.log(1)' });
		expect(detectSandboxPair([node], 0)).toEqual({
			lang: 'js',
			filename: undefined,
			code: 'console.log(1)',
			annotationsJson: undefined,
			codeIndex: 0,
			nodeCount: 1,
		});
	});

	it('detects a sandbox fence with a filename', () => {
		const node = code({
			lang: 'ts',
			meta: 'sandbox app.ts',
			value: 'export const x = 1',
		});
		const result = detectSandboxPair([node], 0);
		expect(result?.filename).toBe('app.ts');
		expect(result?.lang).toBe('ts');
		expect(result?.nodeCount).toBe(1);
	});

	it('preserves multi-word filenames', () => {
		const node = code({
			lang: 'js',
			meta: 'sandbox my file name.js',
			value: '',
		});
		expect(detectSandboxPair([node], 0)?.filename).toBe('my file name.js');
	});

	it('pairs with a following `json annotations` block', () => {
		const sandbox = code({ lang: 'js', meta: 'sandbox', value: 'let x' });
		const annotations = code({
			lang: 'json annotations',
			value: '{"annotations":[]}',
		});

		const result = detectSandboxPair([sandbox, annotations], 0);
		expect(result).toMatchObject({
			lang: 'js',
			annotationsJson: '{"annotations":[]}',
			nodeCount: 2,
		});
	});

	it('pairs with a following `json` block whose meta is `annotations`', () => {
		const sandbox = code({ lang: 'js', meta: 'sandbox', value: '' });
		const annotations = code({
			lang: 'json',
			meta: 'annotations',
			value: '{"a":1}',
		});

		const result = detectSandboxPair([sandbox, annotations], 0);
		expect(result?.nodeCount).toBe(2);
		expect(result?.annotationsJson).toBe('{"a":1}');
	});

	it('does not pair with a following non-annotations json block', () => {
		const sandbox = code({ lang: 'js', meta: 'sandbox', value: '' });
		const other = code({ lang: 'json', value: '{}' });

		const result = detectSandboxPair([sandbox, other], 0);
		expect(result?.nodeCount).toBe(1);
		expect(result?.annotationsJson).toBeUndefined();
	});

	it('does not pair when the next node is not a code node', () => {
		const sandbox = code({ lang: 'js', meta: 'sandbox', value: '' });
		const result = detectSandboxPair([sandbox, paragraph], 0);
		expect(result?.nodeCount).toBe(1);
	});

	it('reads sandbox marker from lang when meta is null', () => {
		const node = code({ lang: 'js sandbox app.js', meta: null, value: '' });
		const result = detectSandboxPair([node], 0);
		expect(result?.lang).toBe('js');
		expect(result?.filename).toBe('app.js');
	});
});
