import type { Root } from 'mdast';
import { detectSandboxPair } from './detect.helpers';
import { buildCodeGlossMdxNode } from './transform-mdx.helpers';
import { buildCodeGlossHtmlNode } from './transform-html.helpers';
import { injectImportIfNeeded } from './inject-import.helpers';

type RemarkCodeglossOptions = {
	/**
	 * Output mode:
	 * - `'mdx'` (default) — emits an `<CodeGloss />` MDX JSX element. Requires
	 *   an MDX pipeline (e.g. @next/mdx, next-mdx-remote, Velite, Docusaurus).
	 *   The remark-rendered tree includes an auto-injected import for the
	 *   React component (unless `skipImport` is true).
	 * - `'html'` — emits a raw `<code-gloss>` HTML node with the config in a
	 *   `<script type="application/json">` child. Use with plain markdown
	 *   pipelines (remark-rehype → rehype-stringify, etc.). Consumers must
	 *   load the `codegloss` runtime separately via a `<script>` tag.
	 */
	output?: 'mdx' | 'html';
	/**
	 * (mdx only) Skip injecting `import { CodeGloss } from 'codegloss/react'`.
	 * Set to true when providing CodeGloss via MDX component mapping
	 * (e.g. Docusaurus MDXComponents swizzle).
	 */
	skipImport?: boolean;
	/**
	 * Default theme applied to all code blocks unless the block specifies its own.
	 * Accepts a bundled theme name (e.g. 'github-dark', 'dracula').
	 */
	theme?: string;
};

export function remarkCodegloss(options: RemarkCodeglossOptions = {}) {
	const output = options.output ?? 'mdx';

	return (tree: Root) => {
		let hasTransformed = false;

		processChildren(tree);

		if (hasTransformed && output === 'mdx' && !options.skipImport) {
			injectImportIfNeeded(tree);
		}

		function processChildren(parent: { children: Root['children'] }): void {
			let index = 0;

			while (index < parent.children.length) {
				const pair = detectSandboxPair(parent.children, index);

				if (pair) {
					const pairWithTheme = options.theme
						? { ...pair, theme: options.theme }
						: pair;
					const node =
						output === 'html'
							? buildCodeGlossHtmlNode(pairWithTheme)
							: buildCodeGlossMdxNode(pairWithTheme);

					parent.children.splice(
						pair.codeIndex,
						pair.nodeCount,
						node as unknown as Root['children'][number],
					);

					hasTransformed = true;
					index++;
				} else {
					const child = parent.children[index];

					if ('children' in child && Array.isArray(child.children)) {
						processChildren(child as { children: Root['children'] });
					}

					index++;
				}
			}
		}
	};
}

export default remarkCodegloss;
