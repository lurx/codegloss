import { describe, expect, it } from 'vitest';
import {
	createBlankAnnotation,
	nextAutoId,
} from '../annotations-panel.helpers';

describe('nextAutoId', () => {
	it('returns a1 for an empty list', () => {
		expect(nextAutoId([])).toBe('a1');
	});

	it('skips existing auto ids', () => {
		const id = nextAutoId([
			{ id: 'a1', token: '', line: 0, occurrence: 0 },
			{ id: 'a2', token: '', line: 0, occurrence: 0 },
		]);
		expect(id).toBe('a3');
	});

	it('keeps incrementing past gaps when the default is already taken', () => {
		const id = nextAutoId([
			{ id: 'a3', token: '', line: 0, occurrence: 0 },
			{ id: 'a2', token: '', line: 0, occurrence: 0 },
		]);
		expect(id).toBe('a4');
	});
});

describe('createBlankAnnotation', () => {
	it('auto-fills id and returns empty fields', () => {
		const blank = createBlankAnnotation([]);
		expect(blank).toEqual({
			id: 'a1',
			token: '',
			line: 0,
			occurrence: 0,
			title: '',
			text: '',
		});
	});
});
