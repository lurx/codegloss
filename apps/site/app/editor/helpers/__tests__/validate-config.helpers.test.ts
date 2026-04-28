import { describe, expect, it } from 'vitest';
import type { EditorConfig } from '../../hooks/use-editor-state';
import { describeIssue, validateConfig } from '../validate-config.helpers';

function baseConfig(overrides: Partial<EditorConfig> = {}): EditorConfig {
	return {
		code: 'const answer = 42;',
		lang: 'js',
		annotations: [],
		connections: [],
		...overrides,
	};
}

describe('validateConfig annotations', () => {
	it('returns no issues for a valid configuration', () => {
		const result = validateConfig(
			baseConfig({
				annotations: [{ id: 'a1', token: 'answer', line: 0, occurrence: 0 }],
			}),
		);
		expect(result.annotationIssues).toEqual({});
	});

	it('flags empty-id', () => {
		const result = validateConfig(
			baseConfig({
				annotations: [{ id: '   ', token: 'answer', line: 0, occurrence: 0 }],
			}),
		);
		expect(result.annotationIssues[0]).toContain('empty-id');
	});

	it('flags duplicate-id on every row sharing the id', () => {
		const result = validateConfig(
			baseConfig({
				annotations: [
					{ id: 'a1', token: 'answer', line: 0, occurrence: 0 },
					{ id: 'a1', token: 'answer', line: 0, occurrence: 0 },
				],
			}),
		);
		expect(result.annotationIssues[0]).toContain('duplicate-id');
		expect(result.annotationIssues[1]).toContain('duplicate-id');
	});

	it('flags token-mismatch when token cannot be found at the requested occurrence', () => {
		const result = validateConfig(
			baseConfig({
				annotations: [{ id: 'a1', token: 'answer', line: 0, occurrence: 5 }],
			}),
		);
		expect(result.annotationIssues[0]).toContain('token-mismatch');
	});

	it('skips token check when token is empty or line is out of range', () => {
		const result = validateConfig(
			baseConfig({
				annotations: [
					{ id: 'a1', token: '', line: 0, occurrence: 0 },
					{ id: 'a2', token: 'x', line: 99, occurrence: 0 },
				],
			}),
		);
		expect(result.annotationIssues).toEqual({});
	});

	it('matches an empty-length token without looping forever', () => {
		const result = validateConfig(
			baseConfig({
				code: 'aaa',
				annotations: [{ id: 'a1', token: 'a', line: 0, occurrence: 1 }],
			}),
		);
		expect(result.annotationIssues).toEqual({});
	});
});

describe('validateConfig connections', () => {
	it('flags missing endpoints and same-endpoint connections', () => {
		const result = validateConfig(
			baseConfig({
				annotations: [{ id: 'a1', token: 'answer', line: 0, occurrence: 0 }],
				connections: [
					{ from: 'ghost', to: 'also-ghost', color: '#000' },
					{ from: 'a1', to: 'a1', color: '#000' },
				],
			}),
		);
		expect(result.connectionIssues[0]).toEqual(
			expect.arrayContaining(['missing-from', 'missing-to']),
		);
		expect(result.connectionIssues[1]).toContain('same-endpoints');
	});

	it('returns no issues for valid connections', () => {
		const result = validateConfig(
			baseConfig({
				annotations: [
					{ id: 'a1', token: 'answer', line: 0, occurrence: 0 },
					{ id: 'a2', token: 'answer', line: 0, occurrence: 0 },
				],
				connections: [{ from: 'a1', to: 'a2', color: '#000' }],
			}),
		);
		expect(result.connectionIssues).toEqual({});
	});
});

describe('describeIssue', () => {
	it('maps every issue kind to a human-readable label', () => {
		expect(describeIssue('duplicate-id')).toBe('Duplicate id');
		expect(describeIssue('empty-id')).toBe('Id is required');
		expect(describeIssue('token-mismatch')).toMatch(/Token/);
		expect(describeIssue('missing-from')).toMatch(/From/);
		expect(describeIssue('missing-to')).toMatch(/To/);
		expect(describeIssue('same-endpoints')).toMatch(/same/);
	});
});
