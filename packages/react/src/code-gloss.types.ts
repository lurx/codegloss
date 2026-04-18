import type { CodeGlossConfig, Highlighter } from 'codegloss';

export type CodeGlossProps = CodeGlossConfig & {
	/**
	 * Optional highlighter invoked at render time. The wrapper calls
	 * `highlight(code, lang)` and bakes the result into the config so the
	 * runtime element renders pre-highlighted markup directly — no
	 * client-side highlight pass.
	 *
	 * Use the same shared adapter you'd pass to the remark plugin, e.g.
	 * `createShikiHighlighter(shiki)`.
	 */
	highlight?: Highlighter;
};
