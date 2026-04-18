import type { Highlighter } from '../core/code-gloss.types';
import type { CodeGlossLabels } from '../core/labels.types';
import type { CodeGlossTheme } from '../themes/theme.types';

export type CodeGlossArcStyle = {
	/** Dot radius in px. Default: 2.5 */
	dotRadius?: number;
	/** Dot opacity (0–1). Default: 0.8 */
	dotOpacity?: number;
	/** Arc stroke width in px. Default: 1.5 */
	strokeWidth?: number;
	/** Dash pattern, e.g. '4 3' (dashed) or 'none' (solid). Default: '4 3' */
	strokeDasharray?: string;
	/** Arc opacity (0–1). Default: 0.55 */
	opacity?: number;
	/**
	 * Draw an arrowhead at the `to` endpoint of each connection arc. The
	 * `from` endpoint always renders as a plain dot. Default: false.
	 */
	arrowhead?: boolean;
};

export type CodeGlossCallouts = {
	/**
	 * When `true`, annotations open as a floating popover at the click
	 * position instead of the default inline expanding callout. Individual
	 * annotations can still override via `annotation.popover`. Default: false.
	 */
	popover?: boolean;
};

export type CodeGlossUserConfig = {
	/** Named bundled theme, or an inline theme object. */
	theme?: string | CodeGlossTheme;
	/** Override for dark mode only (applied on top of theme). */
	darkTheme?: string | CodeGlossTheme;
	/** Style overrides for connection arcs. */
	arcs?: CodeGlossArcStyle;
	/** Block-level callout behavior for annotations. */
	callouts?: CodeGlossCallouts;
	/**
	 * Project-wide syntax highlighter. Used by the remark plugin at build
	 * time and by `initCodegloss(config)` at runtime to drive every
	 * `<code-gloss>` block on the page. Plug in any adapter — Shiki,
	 * Prism, hljs, or your own `(code, lang) => string | HighlightedCode`
	 * function — and codegloss stays out of theming.
	 */
	highlight?: Highlighter;
	/**
	 * Localizable strings rendered by the element itself (copy button
	 * labels, callout close button, fallback error). Pass any subset; the
	 * rest fall back to English defaults. Applied via `initCodegloss`.
	 */
	labels?: CodeGlossLabels;
};
