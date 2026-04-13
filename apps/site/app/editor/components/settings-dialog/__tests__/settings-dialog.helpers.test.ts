import { describe, expect, it } from 'vitest';
import {
	parseOptionalNumber,
	patchArcs,
	patchCallouts,
} from '../settings-dialog.helpers';

describe('parseOptionalNumber', () => {
	it('returns undefined for empty input', () => {
		expect(parseOptionalNumber('')).toBeUndefined();
		expect(parseOptionalNumber('   ')).toBeUndefined();
	});

	it('parses finite numbers', () => {
		expect(parseOptionalNumber('1.25')).toBe(1.25);
	});

	it('returns undefined for non-finite input', () => {
		expect(parseOptionalNumber('abc')).toBeUndefined();
	});
});

describe('patchArcs', () => {
	it('returns undefined when the result has no keys', () => {
		expect(patchArcs(undefined, {})).toBeUndefined();
	});

	it('merges partial updates into existing arcs', () => {
		expect(patchArcs({ opacity: 0.5 }, { dotRadius: 2 })).toEqual({
			opacity: 0.5,
			dotRadius: 2,
		});
	});

	it('drops keys set to undefined or empty string', () => {
		const result = patchArcs(
			{ opacity: 0.5, strokeDasharray: '4 2' },
			{ strokeDasharray: '' as unknown as undefined },
		);
		expect(result).toEqual({ opacity: 0.5 });
	});

	it('returns undefined when clearing the last key', () => {
		expect(
			patchArcs({ opacity: 0.5 }, { opacity: undefined }),
		).toBeUndefined();
	});
});

describe('patchCallouts', () => {
	it('returns undefined when empty', () => {
		expect(patchCallouts(undefined, {})).toBeUndefined();
	});

	it('merges partial updates', () => {
		expect(patchCallouts({ popover: true }, {})).toEqual({ popover: true });
	});

	it('drops popover when set to undefined', () => {
		expect(
			patchCallouts({ popover: true }, { popover: undefined }),
		).toBeUndefined();
	});
});
