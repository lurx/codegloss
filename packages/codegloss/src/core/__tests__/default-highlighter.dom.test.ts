import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeGlossElement, defineCodeGloss } from '../code-gloss.element';
import { setDefaultHighlighter } from '../default-highlighter.helpers';

defineCodeGloss();

function mount(): CodeGlossElement {
	const element = document.createElement('code-gloss') as CodeGlossElement;
	const scriptNode = document.createElement('script');
	scriptNode.type = 'application/json';
	scriptNode.textContent = JSON.stringify({ code: 'one\ntwo', lang: 'js' });
	element.append(scriptNode);
	document.body.append(element);
	return element;
}

describe('setDefaultHighlighter', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		CodeGlossElement.prototype.highlight = undefined;
	});

	it('assigns the highlighter on the prototype', () => {
		const fn = vi.fn(() => 'out');
		setDefaultHighlighter(fn);
		expect(CodeGlossElement.prototype.highlight).toBe(fn);
	});

	it('refreshes already-mounted elements so the new highlighter takes effect', () => {
		const element = mount();
		expect(
			element.shadowRoot?.querySelector('.lineContent')?.innerHTML,
		).not.toContain('swapped');

		setDefaultHighlighter(
			(code: string) => `<span class="hl">swapped:${code}</span>`,
		);

		expect(
			element.shadowRoot?.querySelector('.lineContent')?.innerHTML,
		).toContain('swapped');
	});

	it('clears the highlighter when passed undefined', () => {
		setDefaultHighlighter(() => 'ignored');
		setDefaultHighlighter(undefined);
		expect(CodeGlossElement.prototype.highlight).toBeUndefined();
	});
});
