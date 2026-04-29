import { CodeGlossElement } from './code-gloss.element';
import { CUSTOM_ELEMENT_NAME } from './code-gloss.constants';
import type { Highlighter } from './code-gloss.types';

/**
 * Set the default syntax highlighter for every `<code-gloss>` instance
 * on the page — current and future. Pass `undefined` to clear it and
 * fall back to the built-in regex tokenizer.
 *
 * Safe to call more than once (e.g. when an async highlighter such as
 * Shiki finishes loading): already-mounted blocks are torn down and
 * rebuilt with the new highlighter so the swap is visible without a
 * full page reload.
 */
export function setDefaultHighlighter(
	highlight: Highlighter | undefined,
): void {
	CodeGlossElement.prototype.highlight = highlight;

	/* v8 ignore next -- SSR guard, unreachable in a browser test env */
	if (typeof document === 'undefined') return;
	for (const element of document.querySelectorAll(CUSTOM_ELEMENT_NAME)) {
		/* v8 ignore next -- querySelectorAll(<code-gloss>) only returns CodeGlossElement */
		if (!(element instanceof CodeGlossElement)) continue;
		element.refresh();
	}
}
