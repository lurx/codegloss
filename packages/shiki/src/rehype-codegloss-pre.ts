/**
 * Rehype plugin that rewrites every `<pre><code>` block into a
 * `<code-gloss>` custom element with the highlighted HTML baked into a
 * JSON config script. Run this AFTER a syntax-highlighter rehype plugin
 * (rehype-shiki, rehype-prism, etc.) so the highlighted spans are
 * already in place.
 *
 * Blocks that the remark-codegloss plugin already transformed are
 * unaffected — they never appear as `<pre>` in the hAST.
 */
import type { Root, Element, ElementContent, Text } from 'hast';

function isElement(node: ElementContent): node is Element {
	return node.type === 'element';
}

function extractText(nodes: ElementContent[]): string {
	let out = '';
	for (const node of nodes) {
		if (node.type === 'text') out += node.value;
		else if (isElement(node)) out += extractText(node.children);
	}

	return out;
}

function serializeToHtml(nodes: ElementContent[]): string {
	let out = '';
	for (const node of nodes) {
		if (node.type === 'text') {
			out += node.value
				.replaceAll('&', '&amp;')
				.replaceAll('<', '&lt;')
				.replaceAll('>', '&gt;');
		} else if (isElement(node)) {
			out += `<${node.tagName}`;
			for (const [key, value] of Object.entries(node.properties ?? {})) {
				if (value === undefined || value === null || value === false) continue;
				const attr =
					key === 'className'
						? 'class'
						: key.replaceAll(/([A-Z])/g, '-$1').toLowerCase();
				out += ` ${attr}="${String(value).replaceAll('"', '&quot;')}"`;
			}

			out += `>${serializeToHtml(node.children)}</${node.tagName}>`;
		}
	}

	return out;
}

function parseLang(className: string | string[] | undefined): string {
	if (!className) return '';
	const classes = Array.isArray(className) ? className : [className];
	for (const cls of classes) {
		const match = /^language-(.+)$/.exec(String(cls));
		if (match) return match[1];
	}

	return '';
}

export function rehypeCodeglossPre() {
	return (tree: Root) => {
		visit(tree);
	};
}

function visit(parent: Root | Element): void {
	for (let i = 0; i < parent.children.length; i++) {
		// `rehype-raw` emits sub-trees of `type: 'root'` around raw-HTML
		// regions — hast's types don't model that shape, so widen the union
		// here so we can recurse into them. See
		// https://github.com/lurx/codegloss/issues/12.
		const child = parent.children[i] as ElementContent | Root;
		if (child.type !== 'element' && child.type !== 'root') continue;

		if (
			child.type === 'element' &&
			child.tagName === 'pre' &&
			child.children.length > 0 &&
			child.children[0].type === 'element' &&
			child.children[0].tagName === 'code'
		) {
			const codeElement = child.children[0];
			const lang = parseLang(
				codeElement.properties?.className as string | string[] | undefined,
			);
			const rawCode = extractText(codeElement.children).replace(/\n$/, '');
			const highlightedHtml = serializeToHtml(codeElement.children).replace(
				/\n$/,
				'',
			);

			const config: Record<string, unknown> = { code: rawCode, lang };
			if (highlightedHtml) config.highlightedHtml = highlightedHtml;

			const jsonString = JSON.stringify(config).replaceAll(
				'</script',
				String.raw`<\/script`,
			);

			const replacement: Element = {
				type: 'element',
				tagName: 'code-gloss',
				properties: {},
				children: [
					{
						type: 'element',
						tagName: 'script',
						properties: { type: 'application/json' },
						children: [{ type: 'text', value: jsonString }],
					},
				],
			};

			parent.children[i] = replacement;
			continue;
		}

		visit(child);
	}
}
