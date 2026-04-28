import type { Annotation } from '@codegloss/react';

const AUTO_ID_PREFIX = 'a';

export function nextAutoId(annotations: Annotation[]): string {
	const used = new Set(annotations.map(a => a.id));
	let n = annotations.length + 1;
	while (used.has(`${AUTO_ID_PREFIX}${n}`)) n += 1;
	return `${AUTO_ID_PREFIX}${n}`;
}

export function createBlankAnnotation(existing: Annotation[]): Annotation {
	return {
		id: nextAutoId(existing),
		token: '',
		line: 0,
		occurrence: 0,
		title: '',
		text: '',
	};
}
