import type { ThemedToken } from 'shiki';

export function computeOccurrence(
	lineTokens: ThemedToken[],
	tokenIndex: number,
): number {
	const target = lineTokens[tokenIndex]?.content;
	if (!target) return 0;
	let seen = 0;
	for (let i = 0; i < tokenIndex; i += 1) {
		if (lineTokens[i]?.content === target) seen += 1;
	}
	return seen;
}

export function isWhitespace(content: string): boolean {
	return content.trim().length === 0;
}
