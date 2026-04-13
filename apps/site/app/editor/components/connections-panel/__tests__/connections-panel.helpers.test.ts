import { describe, expect, it } from 'vitest';
import { createBlankConnection } from '../connections-panel.helpers';

describe('createBlankConnection', () => {
	it('points to empty ids when no annotations exist', () => {
		expect(createBlankConnection([])).toEqual({
			from: '',
			to: '',
			color: '#6c5ce7',
		});
	});

	it('mirrors the only annotation when one exists', () => {
		const conn = createBlankConnection([
			{ id: 'a1', token: 'x', line: 0, occurrence: 0 },
		]);
		expect(conn.from).toBe('a1');
		expect(conn.to).toBe('a1');
	});

	it('pairs the first two annotations when available', () => {
		const conn = createBlankConnection([
			{ id: 'a1', token: 'x', line: 0, occurrence: 0 },
			{ id: 'a2', token: 'y', line: 0, occurrence: 0 },
		]);
		expect(conn).toEqual({ from: 'a1', to: 'a2', color: '#6c5ce7' });
	});
});
