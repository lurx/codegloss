import type { Code } from 'mdast';
import type { DetectedPair } from './remark.types';

const CODEGLOSS_PATTERN = /^(\w+)\s+codegloss(?:\s+(.+))?$/;

function isAnnotationsMetadataBlock(node: Code): boolean {
	return (
		node.lang === 'json annotations' ||
		(node.lang === 'json' && node.meta === 'annotations')
	);
}

export function detectCodeglossPair(
	children: unknown[],
	index: number,
	options: { transformAllCodeFences?: boolean } = {},
): DetectedPair | undefined {
	const node = children[index] as Code | undefined;

	if (node?.type !== 'code') return undefined;

	const langMeta = [node.lang, node.meta].filter(Boolean).join(' ');
	const match = CODEGLOSS_PATTERN.exec(langMeta);

	if (match) {
		const lang = match[1];
		const filename = match[2] || undefined;
		const code = node.value;

		const nextNode = children[index + 1] as Code | undefined;
		const isAnnotationsBlock =
			nextNode?.type === 'code' && isAnnotationsMetadataBlock(nextNode);

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

	if (!options.transformAllCodeFences) return undefined;
	if (!node.lang) return undefined;
	if (isAnnotationsMetadataBlock(node)) return undefined;

	return {
		lang: node.lang,
		filename: undefined,
		code: node.value,
		annotationsJson: undefined,
		codeIndex: index,
		nodeCount: 1,
	};
}
