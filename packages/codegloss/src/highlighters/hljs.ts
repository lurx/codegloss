import type { Highlighter } from '../core/code-gloss.types';

/**
 * Minimal slice of highlight.js's API that we actually call.
 */
export type HljsLikeHighlighter = {
	highlight: (
		code: string,
		options: { language: string; ignoreIllegals?: boolean },
	) => { value: string };
	getLanguage: (lang: string) => unknown;
};

/**
 * Build a codegloss-compatible highlighter from a highlight.js instance.
 * When the requested language isn't registered, fall back to rendering
 * the code as-is (escaped by hljs internally via `ignoreIllegals`).
 */
export function createHljsHighlighter(hljs: HljsLikeHighlighter): Highlighter {
	return (code, lang) => {
		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
		return hljs.highlight(code, { language, ignoreIllegals: true }).value;
	};
}
