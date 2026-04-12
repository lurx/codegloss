import type { Root } from 'mdast';
import { detectSandboxPair } from './detect.helpers';
import { buildCodeGlossMdxNode } from './transform-mdx.helpers';
import { buildCodeGlossHtmlNode } from './transform-html.helpers';
import { injectImportIfNeeded } from './inject-import.helpers';
import type { RemarkCodeglossOptions } from './remark.types';

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
