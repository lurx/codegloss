import { describe, expect, it } from 'vitest';
import type { Code, Paragraph } from 'mdast';
import { detectCodeglossPair } from '../detect.helpers';

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

describe('detectCodeglossPair', () => {
	it('returns undefined for a non-code node', () => {
		expect(detectCodeglossPair([paragraph], 0)).toBeUndefined();
	});

	it('returns undefined for a plain code fence with no codegloss marker', () => {
		expect(
			detectCodeglossPair([code({ lang: 'js', value: 'let x = 1' })], 0),
		).toBeUndefined();
	});

	it('returns undefined when the meta is set but missing the codegloss keyword', () => {
		expect(
			detectCodeglossPair([code({ lang: 'js', meta: 'foo' })], 0),
		).toBeUndefined();
	});

	it('detects a codegloss fence with no filename and no annotations', () => {
		const node = code({
			lang: 'js',
			meta: 'codegloss',
			value: 'console.log(1)',
		});
		expect(detectCodeglossPair([node], 0)).toEqual({
			lang: 'js',
			filename: undefined,
			code: 'console.log(1)',
			annotationsJson: undefined,
			codeIndex: 0,
			nodeCount: 1,
		});
	});

	it('detects a codegloss fence with a filename', () => {
		const node = code({
			lang: 'ts',
			meta: 'codegloss app.ts',
			value: 'export const x = 1',
		});
		const result = detectCodeglossPair([node], 0);
		expect(result?.filename).toBe('app.ts');
		expect(result?.lang).toBe('ts');
		expect(result?.nodeCount).toBe(1);
	});

	it('preserves multi-word filenames', () => {
		const node = code({
			lang: 'js',
			meta: 'codegloss my file name.js',
			value: '',
		});
		expect(detectCodeglossPair([node], 0)?.filename).toBe('my file name.js');
	});

	it('pairs with a following `json annotations` block', () => {
		const fence = code({ lang: 'js', meta: 'codegloss', value: 'let x' });
		const annotations = code({
			lang: 'json annotations',
			value: '{"annotations":[]}',
		});

		const result = detectCodeglossPair([fence, annotations], 0);
		expect(result).toMatchObject({
			lang: 'js',
			annotationsJson: '{"annotations":[]}',
			nodeCount: 2,
		});
	});

	it('pairs with a following `json` block whose meta is `annotations`', () => {
		const fence = code({ lang: 'js', meta: 'codegloss', value: '' });
		const annotations = code({
			lang: 'json',
			meta: 'annotations',
			value: '{"a":1}',
		});

		const result = detectCodeglossPair([fence, annotations], 0);
		expect(result?.nodeCount).toBe(2);
		expect(result?.annotationsJson).toBe('{"a":1}');
	});

	it('does not pair with a following non-annotations json block', () => {
		const fence = code({ lang: 'js', meta: 'codegloss', value: '' });
		const other = code({ lang: 'json', value: '{}' });

		const result = detectCodeglossPair([fence, other], 0);
		expect(result?.nodeCount).toBe(1);
		expect(result?.annotationsJson).toBeUndefined();
	});

	it('does not pair when the next node is not a code node', () => {
		const fence = code({ lang: 'js', meta: 'codegloss', value: '' });
		const result = detectCodeglossPair([fence, paragraph], 0);
		expect(result?.nodeCount).toBe(1);
	});

	it('reads the codegloss marker from lang when meta is null', () => {
		const node = code({ lang: 'js codegloss app.js', meta: null, value: '' });
		const result = detectCodeglossPair([node], 0);
		expect(result?.lang).toBe('js');
		expect(result?.filename).toBe('app.js');
	});

	describe('transformAllCodeFences', () => {
		it('treats a plain langed fence as an un-annotated codegloss block', () => {
			const node = code({ lang: 'ts', value: 'const x = 1' });
			expect(
				detectCodeglossPair([node], 0, { transformAllCodeFences: true }),
			).toEqual({
				lang: 'ts',
				filename: undefined,
				code: 'const x = 1',
				annotationsJson: undefined,
				codeIndex: 0,
				nodeCount: 1,
			});
		});

		it('still pairs a `codegloss` fence with its annotations block', () => {
			const fence = code({ lang: 'js', meta: 'codegloss app.js', value: 'x' });
			const annotations = code({
				lang: 'json annotations',
				value: '{"annotations":[]}',
			});
			const result = detectCodeglossPair([fence, annotations], 0, {
				transformAllCodeFences: true,
			});
			expect(result?.nodeCount).toBe(2);
			expect(result?.filename).toBe('app.js');
		});

		it('skips a fence with no language', () => {
			const node = code({ lang: null, value: 'plain text' });
			expect(
				detectCodeglossPair([node], 0, { transformAllCodeFences: true }),
			).toBeUndefined();
		});

		it('skips orphan `json annotations` blocks', () => {
			const node = code({
				lang: 'json annotations',
				value: '{"annotations":[]}',
			});
			expect(
				detectCodeglossPair([node], 0, { transformAllCodeFences: true }),
			).toBeUndefined();
		});

		it('skips orphan `json` blocks whose meta is `annotations`', () => {
			const node = code({
				lang: 'json',
				meta: 'annotations',
				value: '{}',
			});
			expect(
				detectCodeglossPair([node], 0, { transformAllCodeFences: true }),
			).toBeUndefined();
		});

		it('still transforms a regular `json` fence (no `annotations` meta)', () => {
			const node = code({ lang: 'json', value: '{"x":1}' });
			const result = detectCodeglossPair([node], 0, {
				transformAllCodeFences: true,
			});
			expect(result?.lang).toBe('json');
			expect(result?.code).toBe('{"x":1}');
		});
	});
});
