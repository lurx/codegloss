import { afterEach, describe, expect, it } from 'vitest';
import { getLabels, setDefaultLabels } from '../labels.helpers';

describe('setDefaultLabels', () => {
	afterEach(() => {
		setDefaultLabels(undefined);
	});

	it('starts with the English defaults', () => {
		expect(getLabels()).toEqual({
			copy: 'Copy code',
			copied: 'Copied',
			copiedTitle: 'Copied!',
			closeAnnotation: 'Close annotation',
			invalidConfig: '[code-gloss] missing or invalid config',
		});
	});

	it('merges a partial override on top of the defaults', () => {
		setDefaultLabels({ copy: 'Kopieren', copied: 'Kopiert' });
		const labels = getLabels();
		expect(labels.copy).toBe('Kopieren');
		expect(labels.copied).toBe('Kopiert');
		expect(labels.copiedTitle).toBe('Copied!');
		expect(labels.closeAnnotation).toBe('Close annotation');
	});

	it('resets to the defaults when called with undefined', () => {
		setDefaultLabels({ copy: 'Kopieren' });
		expect(getLabels().copy).toBe('Kopieren');
		setDefaultLabels(undefined);
		expect(getLabels().copy).toBe('Copy code');
	});
});
