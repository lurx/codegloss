import type { HighlightedCode, Highlighter } from '../core/code-gloss.types';
import { parsePreChrome } from './parse-pre-style.helpers';

/**
 * Minimal slice of Shiki's Highlighter API that we actually call.
 * We only care about the synchronous `codeToHtml` path — users create
 * their Shiki instance async (loading themes and grammars) and pass it
 * here once it's ready.
 */
export type ShikiLikeHighlighter = {
	codeToHtml: (
		code: string,
		options: { lang: string; theme?: string; themes?: Record<string, string> },
	) => string;
};

export type CreateShikiHighlighterOptions = {
	/** Single-theme mode: pass a Shiki theme name. Mutually exclusive with `themes`. */
	theme?: string;
	/** Dual-theme mode: e.g. `{ light: 'github-light', dark: 'github-dark' }`. */
	themes?: Record<string, string>;
};

const OUTER_WRAPPER_PATTERN = /^<pre[^>]*><code[^>]*>|<\/code><\/pre>$/g;

/**
 * Build a codegloss-compatible highlighter from a pre-initialized Shiki
 * instance. codegloss handles splitting the HTML into lines, so this
 * adapter strips Shiki's outer `<pre>` / `<code>` wrappers and forwards
 * the wrapper's background/color so codegloss can paint matching chrome.
 */
export function createShikiHighlighter(
	shiki: ShikiLikeHighlighter,
	options: CreateShikiHighlighterOptions = {},
): Highlighter {
	const { theme, themes } = options;
	return (code, lang): HighlightedCode => {
		const raw = shiki.codeToHtml(
			code,
			themes ? { lang, themes } : { lang, theme },
		);
		const chrome = parsePreChrome(raw);
		return {
			html: raw.replaceAll(OUTER_WRAPPER_PATTERN, ''),
			...chrome,
		};
	};
}
