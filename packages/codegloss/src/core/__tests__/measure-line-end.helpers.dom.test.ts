import { afterEach, describe, expect, it, vi } from 'vitest';
import { measureTextRight } from '../measure-line-end.helpers';

afterEach(() => {
	document.body.innerHTML = '';
	vi.restoreAllMocks();
});

describe('measureTextRight', () => {
	it('uses a Range over the element children instead of the element itself', () => {
		const element = document.createElement('span');
		element.append(document.createTextNode('hi'));
		document.body.append(element);

		vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
			right: 999,
			left: 0,
			top: 0,
			bottom: 0,
			width: 999,
			height: 0,
			x: 0,
			y: 0,
			toJSON() {
				// Noop
			},
		});

		vi.spyOn(Range.prototype, 'getBoundingClientRect').mockReturnValue({
			right: 120,
			left: 0,
			top: 0,
			bottom: 0,
			width: 120,
			height: 0,
			x: 0,
			y: 0,
			toJSON() {
				// Noop
			},
		});

		expect(measureTextRight(element)).toBe(120);
	});

	it('falls back to the element left edge when the line is empty', () => {
		const empty = document.createElement('span');
		document.body.append(empty);

		vi.spyOn(empty, 'getBoundingClientRect').mockReturnValue({
			right: 0,
			left: 42,
			top: 0,
			bottom: 0,
			width: 0,
			height: 0,
			x: 42,
			y: 0,
			toJSON() {
				// Noop
			},
		});

		expect(measureTextRight(empty)).toBe(42);
	});
});
