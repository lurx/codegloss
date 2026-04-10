import type { Root, RootContent } from 'mdast';

type MdxjsEsm = {
	type: 'mdxjsEsm';
	value: string;
	data?: {
		estree?: {
			type: 'Program';
			sourceType: 'module';
			body: unknown[];
		};
	};
};

const CODEGLOSS_IMPORT = "import { CodeGloss } from 'codegloss/react'";

export function injectImportIfNeeded(tree: Root): void {
	const hasImport = tree.children.some((node: RootContent | MdxjsEsm) => {
		if (node.type !== 'mdxjsEsm') return false;

		const esmNode = node as unknown as MdxjsEsm;
		return esmNode.value.includes('CodeGloss');
	});

	if (hasImport) return;

	const importNode: MdxjsEsm = {
		type: 'mdxjsEsm',
		value: CODEGLOSS_IMPORT,
		data: {
			estree: {
				type: 'Program',
				sourceType: 'module',
				body: [
					{
						type: 'ImportDeclaration',
						specifiers: [
							{
								type: 'ImportSpecifier',
								imported: { type: 'Identifier', name: 'CodeGloss' },
								local: { type: 'Identifier', name: 'CodeGloss' },
							},
						],
						source: {
							type: 'Literal',
							value: 'codegloss/react',
							raw: "'codegloss/react'",
						},
					},
				],
			},
		},
	};

	tree.children.unshift(importNode as unknown as Root['children'][number]);
}
