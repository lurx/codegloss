import type { Code } from 'mdast';
import type { DetectedPair } from './remark.types';

const SANDBOX_PATTERN = /^(\w+)\s+sandbox(?:\s+(.+))?$/;

export function detectSandboxPair(
	children: unknown[],
	index: number,
): DetectedPair | undefined {
	const node = children[index] as Code | undefined;

	if (node?.type !== 'code') return undefined;

	const langMeta = [node.lang, node.meta].filter(Boolean).join(' ');
	const match = SANDBOX_PATTERN.exec(langMeta);

	if (!match) return undefined;

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
