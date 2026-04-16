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
					const highlightResult = options.highlight?.(pair.code, pair.lang);
					const highlightFields =
						highlightResult === undefined
							? {}
							: typeof highlightResult === 'string'
								? { highlightedHtml: highlightResult }
								: {
										highlightedHtml: highlightResult.html,
										...(highlightResult.background
											? { highlightBackground: highlightResult.background }
											: {}),
										...(highlightResult.color
											? { highlightColor: highlightResult.color }
											: {}),
									};

					const pairWithDefaults = {
						...pair,
						...(options.theme ? { theme: options.theme } : {}),
						...(options.arcs && Object.keys(options.arcs).length > 0
							? { arcs: options.arcs }
							: {}),
						...(options.callouts && Object.keys(options.callouts).length > 0
							? { callouts: options.callouts }
							: {}),
						...highlightFields,
					};
					const node =
						output === 'html'
							? buildCodeGlossHtmlNode(pairWithDefaults)
							: buildCodeGlossMdxNode(pairWithDefaults);

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
