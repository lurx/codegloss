import { describe, expect, it } from 'vitest';
import type { ThemedToken } from 'shiki';
import { computeOccurrence, isWhitespace } from '../code-picker.helpers';

function token(content: string): ThemedToken {
	return { content, offset: 0 } as ThemedToken;
}

describe('computeOccurrence', () => {
	it('returns 0 for the first match on the line', () => {
		const line = [token('foo'), token(' '), token('bar')];
		expect(computeOccurrence(line, 0)).toBe(0);
	});

	it('counts prior tokens with the same content', () => {
		const line = [token('x'), token(' '), token('x'), token(' '), token('x')];
		expect(computeOccurrence(line, 4)).toBe(2);
	});

	it('returns 0 when the token at the index is missing or empty', () => {
		expect(computeOccurrence([], 0)).toBe(0);
		const line = [token('')];
		expect(computeOccurrence(line, 0)).toBe(0);
	});
});

describe('isWhitespace', () => {
	it('returns true for whitespace-only content', () => {
		expect(isWhitespace('')).toBe(true);
		expect(isWhitespace('   ')).toBe(true);
		expect(isWhitespace('\t\n')).toBe(true);
	});

	it('returns false for any visible character', () => {
		expect(isWhitespace(' x ')).toBe(false);
	});
});
