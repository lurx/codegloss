import type { Code } from 'mdast';

export type DetectedPair = {
	lang: string;
	filename: string | undefined;
	code: string;
	annotationsJson: string | undefined;
	/** Index of the code node in parent.children */
	codeIndex: number;
	/** Number of nodes consumed (1 if no annotations block, 2 if paired) */
	nodeCount: number;
	/** Theme name injected by the remark plugin from config */
	theme?: string;
};

const SANDBOX_PATTERN = /^(\w+)\s+sandbox(?:\s+(.+))?$/;

export function detectSandboxPair(
	children: unknown[],
	index: number,
): DetectedPair | undefined {
	const node = children[index] as Code;

	if (node.type !== 'code') return null;

	const langMeta = [node.lang, node.meta].filter(Boolean).join(' ');
	const match = SANDBOX_PATTERN.exec(langMeta);

	if (!match) return null;

	const lang = match[1];
	const filename = match[2] || undefined;
	const code = node.value;

	const nextNode = children[index + 1] as Code | undefined;
	const isAnnotationsBlock =
		nextNode?.type === 'code' &&
		(nextNode.lang === 'json annotations' ||
			(nextNode.lang === 'json' && nextNode.meta === 'annotations'));

	if (isAnnotationsBlock) {
		return {
			lang,
			filename,
			code,
			annotationsJson: nextNode.value,
			codeIndex: index,
			nodeCount: 2,
		};
	}

	return {
		lang,
		filename,
		code,
		annotationsJson: undefined,
		codeIndex: index,
		nodeCount: 1,
	};
}
