import { afterEach, describe, expect, it } from 'vitest';
import { CodeGlossElement } from '../code-gloss.element';
import { initCodegloss } from '../init-codegloss.helpers';

describe('initCodegloss', () => {
	afterEach(() => {
		CodeGlossElement.prototype.highlight = undefined;
	});

	it('registers config.highlight as the default highlighter', () => {
		const highlight = (code: string) => `<span>${code}</span>`;
		initCodegloss({ highlight });
		expect(CodeGlossElement.prototype.highlight).toBe(highlight);
	});

	it('is a no-op when the config carries no highlight', () => {
		initCodegloss({ theme: 'github-dark' });
		expect(CodeGlossElement.prototype.highlight).toBeUndefined();
	});
});
