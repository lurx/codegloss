import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Root } from 'mdast';
import remarkCodegloss from '../index';

const parse = (markdown: string): Root =>
	unified().use(remarkParse).parse(markdown);

const run = (
	markdown: string,
	options?: Parameters<typeof remarkCodegloss>[0],
): Root => {
	const tree = parse(markdown);
	remarkCodegloss(options)(tree);
	return tree;
};

const CODEGLOSS_MD = [
	'```js codegloss fib.js',
	'const x = 1',
	'```',
	'',
	'```json annotations',
	'{"annotations":[{"id":"a1","token":"x","line":0,"occurrence":0,"title":"X","text":"the x"}]}',
	'```',
].join('\n');

const PLAIN_MD = [
	'# Heading',
	'',
	'Some prose.',
	'',
	'```js',
	'let y = 2',
	'```',
].join('\n');

describe('remarkCodegloss (full pipeline)', () => {
	describe('output: "mdx" (default)', () => {
		it('replaces a codegloss + annotations pair with a single mdxJsxFlowElement', () => {
			const tree = run(CODEGLOSS_MD);

			// Original two code nodes are gone, replaced by a single jsx element.
			const jsxNodes = tree.children.filter(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			);
			expect(jsxNodes).toHaveLength(1);

			const codeNodes = tree.children.filter(n => n.type === 'code');
			expect(codeNodes).toHaveLength(0);
		});

		it('auto-injects the CodeGloss import at the top of the document', () => {
			const tree = run(CODEGLOSS_MD);

			const first = tree.children[0] as { type: string; value?: string };
			expect(first.type).toBe('mdxjsEsm');
			expect(first.value).toContain('CodeGloss');
			expect(first.value).toContain("from '@codegloss/react'");
		});

		it('does not inject the import when skipImport is true', () => {
			const tree = run(CODEGLOSS_MD, { skipImport: true });
			expect(
				tree.children.find(n => (n as { type: string }).type === 'mdxjsEsm'),
			).toBeUndefined();
		});

		it('does not inject the import when nothing was transformed', () => {
			const tree = run(PLAIN_MD);
			expect(
				tree.children.find(n => (n as { type: string }).type === 'mdxjsEsm'),
			).toBeUndefined();
		});

		it('handles a codegloss fence with no following annotations block', () => {
			const md = ['```js codegloss', 'let x = 1', '```'].join('\n');
			const tree = run(md);

			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			);
			expect(jsx).toBeDefined();
		});

		it('transforms multiple codegloss blocks in a single document', () => {
			const md = [
				'```js codegloss a.js',
				'let a = 1',
				'```',
				'',
				'Some prose between them.',
				'',
				'```js codegloss b.js',
				'let b = 2',
				'```',
			].join('\n');

			const tree = run(md);
			const jsxNodes = tree.children.filter(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			);
			expect(jsxNodes).toHaveLength(2);
		});

		it('recurses into block-level children (e.g. blockquotes)', () => {
			const md = ['> ```js codegloss nested.js', '> let n = 1', '> ```'].join(
				'\n',
			);
			const tree = run(md);

			const blockquote = tree.children.find(n => n.type === 'blockquote') as
				| { children: Array<{ type: string }> }
				| undefined;
			expect(blockquote).toBeDefined();

			const jsxInside = blockquote!.children.find(
				n => n.type === 'mdxJsxFlowElement',
			);
			expect(jsxInside).toBeDefined();

			// The auto-injected import still gets prepended at the document root
			// because hasTransformed flipped to true.
			expect((tree.children[0] as { type: string }).type).toBe('mdxjsEsm');
		});

		it('warns and still emits a node when annotations JSON is invalid', () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
				// Noop
			});
			const md = [
				'```js codegloss a.js',
				'let x = 1',
				'```',
				'',
				'```json annotations',
				'{not json',
				'```',
			].join('\n');

			const tree = run(md);
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			);
			expect(jsx).toBeDefined();
			expect(warnSpy).toHaveBeenCalledOnce();

			warnSpy.mockRestore();
		});
	});

	describe('output: "html"', () => {
		it('replaces the codegloss pair with a raw html node', () => {
			const tree = run(CODEGLOSS_MD, { output: 'html' });

			const htmlNodes = tree.children.filter(n => n.type === 'html');
			expect(htmlNodes).toHaveLength(1);
			expect((htmlNodes[0] as { value: string }).value).toContain(
				'<code-gloss>',
			);
			expect((htmlNodes[0] as { value: string }).value).toContain(
				'"annotations"',
			);
		});

		it('does not inject any mdxjsEsm import in html mode', () => {
			const tree = run(CODEGLOSS_MD, { output: 'html' });
			expect(
				tree.children.find(n => (n as { type: string }).type === 'mdxjsEsm'),
			).toBeUndefined();
		});

		it('does not inject an import even when skipImport is also set', () => {
			const tree = run(CODEGLOSS_MD, { output: 'html', skipImport: true });
			expect(
				tree.children.find(n => (n as { type: string }).type === 'mdxjsEsm'),
			).toBeUndefined();
		});

		it('produces an html node for a codegloss block nested inside a blockquote', () => {
			const md = ['> ```js codegloss nested.js', '> let n = 1', '> ```'].join(
				'\n',
			);
			const tree = run(md, { output: 'html' });

			const blockquote = tree.children.find(n => n.type === 'blockquote') as
				| { children: Array<{ type: string }> }
				| undefined;
			expect(blockquote).toBeDefined();
			expect(blockquote!.children.find(n => n.type === 'html')).toBeDefined();
		});
	});

	describe('options.theme', () => {
		it('forwards the theme into the emitted html node', () => {
			const tree = run(CODEGLOSS_MD, { output: 'html', theme: 'github-dark' });
			const html = tree.children.find(n => n.type === 'html') as
				| { value: string }
				| undefined;
			expect(html?.value).toContain('theme="github-dark"');
		});

		it('forwards the theme into the emitted mdxJsxFlowElement', () => {
			const tree = run(CODEGLOSS_MD, { theme: 'one-dark' });
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			) as { attributes: Array<{ name: string; value: unknown }> };
			const themeAttr = jsx.attributes.find(a => a.name === 'theme');
			expect(themeAttr?.value).toBe('one-dark');
		});
	});

	describe('options.arcs and options.callouts', () => {
		it('forwards arcs/callouts defaults into the emitted mdx node', () => {
			const tree = run(CODEGLOSS_MD, {
				arcs: { opacity: 0.65, arrowhead: true },
				callouts: { popover: true },
			});
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			) as {
				attributes: Array<{
					name: string;
					value: string | { value?: string } | undefined;
				}>;
			};
			const arcs = jsx.attributes.find(a => a.name === 'arcs');
			const callouts = jsx.attributes.find(a => a.name === 'callouts');
			expect(JSON.parse((arcs!.value as { value: string }).value)).toEqual({
				opacity: 0.65,
				arrowhead: true,
			});
			expect(JSON.parse((callouts!.value as { value: string }).value)).toEqual({
				popover: true,
			});
		});

		it('forwards arcs/callouts defaults into the emitted html node', () => {
			const tree = run(CODEGLOSS_MD, {
				output: 'html',
				arcs: { opacity: 0.5 },
				callouts: { popover: true },
			});
			const html = tree.children.find(n => n.type === 'html') as {
				value: string;
			};
			expect(html.value).toContain('"arcs":{"opacity":0.5}');
			expect(html.value).toContain('"callouts":{"popover":true}');
		});

		it('ignores empty arcs/callouts objects', () => {
			const tree = run(CODEGLOSS_MD, { arcs: {}, callouts: {} });
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			) as { attributes: Array<{ name: string }> };
			expect(jsx.attributes.find(a => a.name === 'arcs')).toBeUndefined();
			expect(jsx.attributes.find(a => a.name === 'callouts')).toBeUndefined();
		});
	});

	describe('options.highlight', () => {
		it('bakes string-returning highlighter output into the mdx node', () => {
			const tree = run(CODEGLOSS_MD, {
				highlight: () => '<span class="kw">const</span>',
			});
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			) as { attributes: Array<{ name: string; value: unknown }> };
			const html = jsx.attributes.find(a => a.name === 'highlightedHtml') as {
				value: { value: string };
			};
			expect(JSON.parse(html.value.value)).toBe(
				'<span class="kw">const</span>',
			);
			expect(
				jsx.attributes.find(a => a.name === 'highlightBackground'),
			).toBeUndefined();
		});

		it('threads chrome fields through the mdx node', () => {
			const tree = run(CODEGLOSS_MD, {
				highlight: () => ({
					html: '<span>x</span>',
					background: '#111',
					color: '#eee',
				}),
			});
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			) as { attributes: Array<{ name: string; value: unknown }> };
			const background = jsx.attributes.find(
				a => a.name === 'highlightBackground',
			);
			const color = jsx.attributes.find(a => a.name === 'highlightColor');
			expect(background?.value).toBe('#111');
			expect(color?.value).toBe('#eee');
		});

		it('omits chrome attributes when the structured return only carries html', () => {
			const tree = run(CODEGLOSS_MD, {
				highlight: () => ({ html: '<span>x</span>' }),
			});
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			) as { attributes: Array<{ name: string }> };
			expect(
				jsx.attributes.find(a => a.name === 'highlightBackground'),
			).toBeUndefined();
			expect(
				jsx.attributes.find(a => a.name === 'highlightColor'),
			).toBeUndefined();
		});

		it('threads highlighted HTML + chrome into the html node', () => {
			const tree = run(CODEGLOSS_MD, {
				output: 'html',
				highlight: () => ({
					html: '<span>x</span>',
					background: '#222',
					color: '#ddd',
				}),
			});
			const html = tree.children.find(n => n.type === 'html') as {
				value: string;
			};
			expect(html.value).toContain('"highlightedHtml":"<span>x</span>"');
			expect(html.value).toContain('"highlightBackground":"#222"');
			expect(html.value).toContain('"highlightColor":"#ddd"');
		});
	});

	describe('options.styleOverrides', () => {
		it('forwards styleOverrides as an expression attr on the mdx node', () => {
			const tree = run(CODEGLOSS_MD, {
				styleOverrides: {
					codeBlock: { background: 'var(--surface)', borderRadius: '4px' },
				},
			});
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			) as {
				attributes: Array<{
					name: string;
					value: string | { value?: string } | undefined;
				}>;
			};
			const attr = jsx.attributes.find(a => a.name === 'styleOverrides');
			expect(JSON.parse((attr!.value as { value: string }).value)).toEqual({
				codeBlock: { background: 'var(--surface)', borderRadius: '4px' },
			});
		});

		it('emits a style attribute on the html node with the mapped --cg-* vars', () => {
			const tree = run(CODEGLOSS_MD, {
				output: 'html',
				styleOverrides: {
					codeBlock: { background: 'var(--surface)' },
					lineNumbers: { foreground: '#aaa' },
				},
			});
			const html = tree.children.find(n => n.type === 'html') as {
				value: string;
			};
			expect(html.value).toContain(
				'style="--cg-bg: var(--surface); --cg-line-num: #aaa"',
			);
		});

		it('ignores styleOverrides with no populated fields', () => {
			const tree = run(CODEGLOSS_MD, { styleOverrides: { codeBlock: {} } });
			const jsx = tree.children.find(
				n => (n as { type: string }).type === 'mdxJsxFlowElement',
			) as { attributes: Array<{ name: string }> };
			expect(
				jsx.attributes.find(a => a.name === 'styleOverrides'),
			).toBeUndefined();
		});

		it('escapes double quotes in style values on the html node', () => {
			const tree = run(CODEGLOSS_MD, {
				output: 'html',
				styleOverrides: {
					codeBlock: { background: 'url("/bg.png")' },
				},
			});
			const html = tree.children.find(n => n.type === 'html') as {
				value: string;
			};
			expect(html.value).toContain('style="--cg-bg: url(&quot;/bg.png&quot;)"');
		});
	});
});
