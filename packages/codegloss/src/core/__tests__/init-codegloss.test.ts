import { afterEach, describe, expect, it } from 'vitest';
import { CodeGlossElement } from '../code-gloss.element';
import { initCodegloss } from '../init-codegloss.helpers';
import { getLabels, setDefaultLabels } from '../labels.helpers';

describe('initCodegloss', () => {
	afterEach(() => {
		CodeGlossElement.prototype.highlight = undefined;
		setDefaultLabels(undefined);
	});

	it('registers config.highlight as the default highlighter', () => {
		const highlight = (code: string) => `<span>${code}</span>`;
		initCodegloss({ highlight });
		expect(CodeGlossElement.prototype.highlight).toBe(highlight);
	});

	it('registers config.labels as overrides on the active labels', () => {
		initCodegloss({ labels: { copy: 'Copier', copied: 'Copié' } });
		expect(getLabels().copy).toBe('Copier');
		expect(getLabels().copied).toBe('Copié');
		// Unspecified keys keep their English defaults.
		expect(getLabels().closeAnnotation).toBe('Close annotation');
	});

	it('is a no-op when the config carries neither highlight nor labels', () => {
		initCodegloss({ theme: 'github-dark' });
		expect(CodeGlossElement.prototype.highlight).toBeUndefined();
		expect(getLabels().copy).toBe('Copy code');
	});
});
