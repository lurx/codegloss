import type {
	CodeGlossConfig,
	CodeGlossStyleOverrides,
	Highlighter,
} from 'codegloss';

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
	/**
	 * Chrome-level style overrides applied as inline CSS custom properties
	 * on the rendered `<code-gloss>` host. Mirrors the `styleOverrides`
	 * field in `defineConfig` — set at the config level for a site-wide
	 * default, pass it per block for a one-off deviation.
	 */
	styleOverrides?: CodeGlossStyleOverrides;
};
