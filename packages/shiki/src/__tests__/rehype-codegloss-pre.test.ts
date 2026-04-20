import { describe, it, expect } from 'vitest';
import type { Root, Element, ElementContent, RootContent } from 'hast';
import { rehypeCodeglossPre } from '../rehype-codegloss-pre';

function run(tree: Root): Root {
	rehypeCodeglossPre()(tree);
	return tree;
}

function pre(codeChildren: ElementContent[], codeProps: Element['properties'] = {}): Element {
	return {
		type: 'element',
		tagName: 'pre',
		properties: {},
		children: [
			{
				type: 'element',
				tagName: 'code',
				properties: codeProps,
				children: codeChildren,
			},
		],
	};
}

function text(value: string): ElementContent {
	return { type: 'text', value };
}

function readConfig(el: Element): Record<string, unknown> {
	const script = el.children[0] as Element;
	const scriptText = script.children[0] as { value: string };
	return JSON.parse(scriptText.value) as Record<string, unknown>;
}

describe('rehypeCodeglossPre', () => {
	it('rewrites a top-level <pre><code> into <code-gloss> with parsed lang + code', () => {
		const tree = run({
			type: 'root',
			children: [pre([text('const x = 1;\n')], { className: ['language-js'] })],
		});
		const out = tree.children[0] as Element;
		expect(out.tagName).toBe('code-gloss');
		const config = readConfig(out);
		expect(config.code).toBe('const x = 1;');
		expect(config.lang).toBe('js');
	});

	it('recurses into rehype-raw sub-roots and rewrites the <pre> inside', () => {
		const subRoot = {
			type: 'root',
			children: [pre([text('let y = 2;')], { className: 'language-ts' })],
		} as unknown as RootContent;
		const tree = run({
			type: 'root',
			children: [
				{
					type: 'element',
					tagName: 'p',
					properties: {},
					children: [text('before')],
				},
				subRoot,
			],
		});
		const nestedRoot = tree.children[1] as unknown as Root;
		expect((nestedRoot.children[0] as Element).tagName).toBe('code-gloss');
	});

	it('recurses through doubly-nested sub-roots', () => {
		const deepest = {
			type: 'root',
			children: [pre([text('deep')])],
		} as unknown as RootContent;
		const middle = {
			type: 'root',
			children: [deepest],
		} as unknown as RootContent;
		const tree = run({
			type: 'root',
			children: [middle],
		});
		const outer = tree.children[0] as unknown as Root;
		const inner = outer.children[0] as unknown as Root;
		expect((inner.children[0] as Element).tagName).toBe('code-gloss');
	});

	it('skips non-element / non-root children (text, comment, doctype)', () => {
		const tree = run({
			type: 'root',
			children: [
				{ type: 'doctype' },
				{ type: 'comment', value: 'stay' },
				text('loose text') as RootContent,
				pre([text('a')]),
			],
		});
		expect((tree.children[3] as Element).tagName).toBe('code-gloss');
		expect(tree.children[0].type).toBe('doctype');
		expect(tree.children[1].type).toBe('comment');
	});

	it('leaves non-<pre> elements alone and recurses into their children', () => {
		const tree = run({
			type: 'root',
			children: [
				{
					type: 'element',
					tagName: 'div',
					properties: {},
					children: [pre([text('x')])],
				},
			],
		});
		const wrapper = tree.children[0] as Element;
		expect(wrapper.tagName).toBe('div');
		expect((wrapper.children[0] as Element).tagName).toBe('code-gloss');
	});

	it('ignores <pre> without a <code> first child', () => {
		const tree = run({
			type: 'root',
			children: [
				{
					type: 'element',
					tagName: 'pre',
					properties: {},
					children: [text('plain')],
				},
			],
		});
		expect((tree.children[0] as Element).tagName).toBe('pre');
	});

	it('ignores empty <pre>', () => {
		const tree = run({
			type: 'root',
			children: [
				{
					type: 'element',
					tagName: 'pre',
					properties: {},
					children: [],
				},
			],
		});
		expect((tree.children[0] as Element).tagName).toBe('pre');
	});

	it('parses lang from a string className', () => {
		const tree = run({
			type: 'root',
			children: [pre([text('x')], { className: 'language-py' })],
		});
		expect(readConfig(tree.children[0] as Element).lang).toBe('py');
	});

	it('returns empty lang when className has no language- class', () => {
		const tree = run({
			type: 'root',
			children: [pre([text('x')], { className: ['other'] })],
		});
		expect(readConfig(tree.children[0] as Element).lang).toBe('');
	});

	it('returns empty lang when className is absent', () => {
		const tree = run({
			type: 'root',
			children: [pre([text('x')])],
		});
		expect(readConfig(tree.children[0] as Element).lang).toBe('');
	});

	it('serializes highlighter spans preserving class + kebab-cased data attrs', () => {
		const span: Element = {
			type: 'element',
			tagName: 'span',
			properties: { className: 'tok', dataLang: 'js' },
			children: [text('const')],
		};
		const tree = run({
			type: 'root',
			children: [pre([span, text(' x;')])],
		});
		const config = readConfig(tree.children[0] as Element);
		expect(config.highlightedHtml).toBe('<span class="tok" data-lang="js">const</span> x;');
	});

	it('escapes text entities in serialized HTML', () => {
		const tree = run({
			type: 'root',
			children: [pre([text('<x>&"')])],
		});
		expect(readConfig(tree.children[0] as Element).highlightedHtml).toBe('&lt;x&gt;&amp;"');
	});

	it('skips undefined / null / false attribute values', () => {
		const span: Element = {
			type: 'element',
			tagName: 'span',
			properties: {
				foo: undefined,
				bar: null,
				baz: false,
				qux: 'keep',
			},
			children: [text('x')],
		};
		const tree = run({
			type: 'root',
			children: [pre([span])],
		});
		const html = readConfig(tree.children[0] as Element).highlightedHtml as string;
		expect(html).toContain('qux="keep"');
		expect(html).not.toContain('foo=');
		expect(html).not.toContain('bar=');
		expect(html).not.toContain('baz=');
	});

	it('escapes double quotes in attribute values', () => {
		const span: Element = {
			type: 'element',
			tagName: 'span',
			properties: { title: 'say "hi"' },
			children: [text('x')],
		};
		const tree = run({
			type: 'root',
			children: [pre([span])],
		});
		const html = readConfig(tree.children[0] as Element).highlightedHtml as string;
		expect(html).toContain('title="say &quot;hi&quot;"');
	});

	it('escapes </script in the config JSON to prevent early termination', () => {
		const tree = run({
			type: 'root',
			children: [pre([text('</script>payload')])],
		});
		const scriptText = ((tree.children[0] as Element).children[0] as Element)
			.children[0] as { value: string };
		expect(scriptText.value).not.toContain('</script');
		expect(scriptText.value).toContain('<\\/script');
	});

	it('omits highlightedHtml when code has no rendered HTML', () => {
		const tree = run({
			type: 'root',
			children: [pre([])],
		});
		const config = readConfig(tree.children[0] as Element);
		expect(config.highlightedHtml).toBeUndefined();
		expect(config.code).toBe('');
	});

	it('extractText recurses through nested elements', () => {
		const nested: Element = {
			type: 'element',
			tagName: 'span',
			properties: {},
			children: [
				{
					type: 'element',
					tagName: 'em',
					properties: {},
					children: [text('hello')],
				},
			],
		};
		const tree = run({
			type: 'root',
			children: [pre([nested])],
		});
		expect(readConfig(tree.children[0] as Element).code).toBe('hello');
	});

	it('serializes elements that have no properties object at all', () => {
		const span = {
			type: 'element',
			tagName: 'span',
			children: [text('x')],
		} as unknown as Element;
		const tree = run({
			type: 'root',
			children: [pre([span])],
		});
		expect(readConfig(tree.children[0] as Element).highlightedHtml).toBe('<span>x</span>');
	});

	it('extractText and serializeToHtml skip comment / doctype children inside <code>', () => {
		const tree = run({
			type: 'root',
			children: [
				pre([
					text('a'),
					{ type: 'comment', value: 'skip' } as unknown as ElementContent,
					text('b'),
				]),
			],
		});
		const config = readConfig(tree.children[0] as Element);
		expect(config.code).toBe('ab');
		expect(config.highlightedHtml).toBe('ab');
	});
});
