import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx';
import { buildCodeGlossMdxNode } from '../transform-mdx.helpers';
import type { DetectedPair } from '../remark.types';

const pair = (overrides: Partial<DetectedPair> = {}): DetectedPair => ({
	lang: 'js',
	filename: undefined,
	code: 'console.log(1)',
	annotationsJson: undefined,
	codeIndex: 0,
	nodeCount: 1,
	...overrides,
});

const findAttr = (
	attrs: MdxJsxAttribute[],
	name: string,
): MdxJsxAttribute | undefined => attrs.find(a => a.name === name);

const expressionValue = (
	attr: MdxJsxAttribute | undefined,
): string | undefined => {
	if (!attr || typeof attr.value === 'string' || attr.value == null)
		return undefined;
	return attr.value.value;
};

describe('buildCodeGlossMdxNode', () => {
	it('produces a CodeGloss flow element with code + lang attributes', () => {
		const node = buildCodeGlossMdxNode(pair());

		expect(node.type).toBe('mdxJsxFlowElement');
		expect(node.name).toBe('CodeGloss');
		expect(node.children).toEqual([]);

		const attrs = node.attributes as MdxJsxAttribute[];
		const code = findAttr(attrs, 'code');
		expect(expressionValue(code)).toBe('"console.log(1)"');

		const lang = findAttr(attrs, 'lang');
		expect(lang?.value).toBe('js');
	});

	it('omits the filename attribute when filename is undefined', () => {
		const attrs = buildCodeGlossMdxNode(pair()).attributes as MdxJsxAttribute[];
		expect(findAttr(attrs, 'filename')).toBeUndefined();
	});

	it('adds a filename attribute when provided', () => {
		const node = buildCodeGlossMdxNode(pair({ filename: 'fib.js' }));
		const attrs = node.attributes as MdxJsxAttribute[];
		expect(findAttr(attrs, 'filename')?.value).toBe('fib.js');
	});

	it('adds a theme attribute when the pair carries a theme', () => {
		const node = buildCodeGlossMdxNode(pair({ theme: 'github-dark' }));
		const attrs = node.attributes as MdxJsxAttribute[];
		expect(findAttr(attrs, 'theme')?.value).toBe('github-dark');
	});

	it('serializes annotations into a JSON expression attribute', () => {
		const node = buildCodeGlossMdxNode(
			pair({
				annotationsJson:
					'{"annotations":[{"id":"a1","token":"x","line":0,"occurrence":0,"title":"t","text":"b"}]}',
			}),
		);

		const attrs = node.attributes as MdxJsxAttribute[];
		const ann = expressionValue(findAttr(attrs, 'annotations'));
		expect(ann).toBeDefined();
		const parsed = JSON.parse(ann!);
		expect(parsed).toHaveLength(1);
		expect(parsed[0].id).toBe('a1');
	});

	it('serializes connections into a JSON expression attribute', () => {
		const node = buildCodeGlossMdxNode(
			pair({
				annotationsJson:
					'{"connections":[{"from":"a","to":"b","color":"#0af"}]}',
			}),
		);

		const attrs = node.attributes as MdxJsxAttribute[];
		const conn = expressionValue(findAttr(attrs, 'connections'));
		expect(JSON.parse(conn!)).toEqual([{ from: 'a', to: 'b', color: '#0af' }]);
	});

	it('emits both annotations and connections when both are present', () => {
		const node = buildCodeGlossMdxNode(
			pair({
				annotationsJson:
					'{"annotations":[{"id":"a"}],"connections":[{"from":"a","to":"b","color":"#000"}]}',
			}),
		);

		const attrs = node.attributes as MdxJsxAttribute[];
		expect(findAttr(attrs, 'annotations')).toBeDefined();
		expect(findAttr(attrs, 'connections')).toBeDefined();
	});

	it('omits annotations and connections when their fields are not arrays', () => {
		const node = buildCodeGlossMdxNode(
			pair({ annotationsJson: '{"annotations":"oops","connections":42}' }),
		);

		const attrs = node.attributes as MdxJsxAttribute[];
		expect(findAttr(attrs, 'annotations')).toBeUndefined();
		expect(findAttr(attrs, 'connections')).toBeUndefined();
	});

	it('omits annotation attributes when both fields are missing from the JSON', () => {
		const node = buildCodeGlossMdxNode(pair({ annotationsJson: '{}' }));
		const attrs = node.attributes as MdxJsxAttribute[];
		expect(findAttr(attrs, 'annotations')).toBeUndefined();
		expect(findAttr(attrs, 'connections')).toBeUndefined();
	});

	describe('invalid JSON', () => {
		let warnSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
				// Noop
			});
		});

		afterEach(() => {
			warnSpy.mockRestore();
		});

		it('warns and skips annotation attributes when JSON is invalid', () => {
			const node = buildCodeGlossMdxNode(
				pair({ annotationsJson: '{not json' }),
			);
			const attrs = node.attributes as MdxJsxAttribute[];

			expect(findAttr(attrs, 'annotations')).toBeUndefined();
			expect(findAttr(attrs, 'connections')).toBeUndefined();
			expect(findAttr(attrs, 'code')).toBeDefined();
			expect(warnSpy).toHaveBeenCalledOnce();
			expect(warnSpy.mock.calls[0][0]).toContain('remark-codegloss');
		});
	});
});
