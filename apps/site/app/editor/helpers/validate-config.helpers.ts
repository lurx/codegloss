import type { Annotation, Connection } from '@codegloss/react';
import type { EditorConfig } from '../hooks/use-editor-state';

export type AnnotationIssue =
	| 'duplicate-id'
	| 'empty-id'
	| 'token-mismatch';

export type ConnectionIssue = 'missing-from' | 'missing-to' | 'same-endpoints';

export type ValidationResult = {
	annotationIssues: Record<number, AnnotationIssue[]>;
	connectionIssues: Record<number, ConnectionIssue[]>;
};

const ISSUE_LABELS: Record<AnnotationIssue | ConnectionIssue, string> = {
	'duplicate-id': 'Duplicate id',
	'empty-id': 'Id is required',
	'token-mismatch': 'Token not found at line / occurrence',
	'missing-from': 'From id does not exist',
	'missing-to': 'To id does not exist',
	'same-endpoints': 'From and to are the same',
};

export function describeIssue(
	issue: AnnotationIssue | ConnectionIssue,
): string {
	return ISSUE_LABELS[issue];
}

function validateAnnotations(
	annotations: Annotation[],
	code: string,
): Record<number, AnnotationIssue[]> {
	const idCounts = new Map<string, number>();
	annotations.forEach((a) => {
		idCounts.set(a.id, (idCounts.get(a.id) ?? 0) + 1);
	});

	const codeLines = code.split('\n');
	const result: Record<number, AnnotationIssue[]> = {};

	annotations.forEach((a, i) => {
		const issues: AnnotationIssue[] = [];
		if (a.id.trim() === '') issues.push('empty-id');
		/* v8 ignore next -- idCounts always contains a.id */
		if ((idCounts.get(a.id) ?? 0) > 1) issues.push('duplicate-id');

		const lineText = codeLines[a.line];
		if (a.token && lineText !== undefined) {
			const matches: number[] = [];
			let searchFrom = 0;
			while (searchFrom <= lineText.length) {
				const found = lineText.indexOf(a.token, searchFrom);
				if (found === -1) break;
				matches.push(found);
				searchFrom = found + Math.max(a.token.length, 1);
			}
			if (matches[a.occurrence] === undefined) {
				issues.push('token-mismatch');
			}
		}

		if (issues.length > 0) result[i] = issues;
	});

	return result;
}

function validateConnections(
	connections: Connection[],
	annotations: Annotation[],
): Record<number, ConnectionIssue[]> {
	const ids = new Set(annotations.map((a) => a.id));
	const result: Record<number, ConnectionIssue[]> = {};
	connections.forEach((c, i) => {
		const issues: ConnectionIssue[] = [];
		if (!ids.has(c.from)) issues.push('missing-from');
		if (!ids.has(c.to)) issues.push('missing-to');
		if (c.from && c.from === c.to) issues.push('same-endpoints');
		if (issues.length > 0) result[i] = issues;
	});
	return result;
}

export function validateConfig(config: EditorConfig): ValidationResult {
	return {
		annotationIssues: validateAnnotations(config.annotations, config.code),
		connectionIssues: validateConnections(
			config.connections,
			config.annotations,
		),
	};
}
