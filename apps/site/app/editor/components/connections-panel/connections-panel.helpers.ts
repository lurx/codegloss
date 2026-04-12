import type { Annotation, Connection } from 'codegloss/react';

const DEFAULT_COLOR = '#6c5ce7';

export function createBlankConnection(annotations: Annotation[]): Connection {
	const first = annotations[0]?.id ?? '';
	const second = annotations[1]?.id ?? first;
	return {
		from: first,
		to: second,
		color: DEFAULT_COLOR,
	};
}
