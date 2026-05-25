import type { Root } from 'mdast';
import { detectCodeglossPair } from './detect.helpers';
import { buildCodeGlossMdxNode } from './transform-mdx.helpers';
import { buildCodeGlossHtmlNode } from './transform-html.helpers';
import { injectImportIfNeeded } from './inject-import.helpers';
import type { RemarkCodeglossOptions } from './remark.types';

function remarkCodegloss(options: RemarkCodeglossOptions = {}) {
	const output = options.output ?? 'mdx';
	const { styleOverrides } = options;
	const hasStyleOverrides =
		styleOverrides !== undefined &&
		Object.values(styleOverrides).some(
			group =>
				group !== undefined && Object.values(group).some(v => v !== undefined),
		);

	return (tree: Root) => {
		let hasTransformed = false;

		processChildren(tree);

		if (hasTransformed && output === 'mdx' && !options.skipImport) {
			injectImportIfNeeded(tree);
		}

		function processChildren(parent: { children: Root['children'] }): void {
			let index = 0;

			while (index < parent.children.length) {
				const pair = detectCodeglossPair(parent.children, index, {
					transformAllCodeFences: options.transformAllCodeFences,
				});

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
						...(hasStyleOverrides
							? { styleOverrides: options.styleOverrides }
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
