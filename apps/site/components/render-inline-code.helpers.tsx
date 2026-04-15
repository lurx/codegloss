import type { ReactNode } from 'react';

const INLINE_CODE_PATTERN = /`([^`]+)`/g;

/**
 * Splits a plain string on backtick-wrapped runs and renders each match as a
 * `<code>` element. Everything between matches stays as text. Used by the
 * tabbed MDX components where the `content` field is authored as a string
 * literal rather than JSX.
 */
export function renderInlineCode(text: string): ReactNode[] {
	const parts: ReactNode[] = [];
	let cursor = 0;
	let match: RegExpExecArray | null;

	INLINE_CODE_PATTERN.lastIndex = 0;
	while ((match = INLINE_CODE_PATTERN.exec(text)) !== null) {
		if (match.index > cursor) {
			parts.push(text.slice(cursor, match.index));
		}
		parts.push(<code key={match.index}>{match[1]}</code>);
		cursor = match.index + match[0].length;
	}

	if (cursor < text.length) {
		parts.push(text.slice(cursor));
	}

	return parts;
}
