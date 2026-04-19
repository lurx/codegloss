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

/**
 * CSS-string-valued fields — accept any CSS custom property value: literal
 * colors (`#fff`, `oklch(...)`), variable references (`var(--my-var)`),
 * `calc(...)`, gradients, etc. Passed through verbatim as inline styles on
 * the `<code-gloss>` host element.
 *
 * Overrides win over both the theme default and the host page's own
 * `--cg-*` custom properties because they land as inline styles. One value
 * covers both light and dark mode; the default dark-mode remap can't beat
 * an inline-level declaration.
 */
export type CodeGlossStyleOverrides = {
	/** Outer block chrome: container background, border, text color, etc. */
	codeBlock?: {
		/** Maps to `--cg-bg`. */
		background?: string;
		/** Maps to `--cg-text`. */
		foreground?: string;
		/** Maps to `--cg-border`. */
		border?: string;
		/** Maps to `--cg-radius`. Defaults to `8px`. */
		borderRadius?: string;
		/** Maps to `--cg-toolbar-bg`. */
		toolbarBackground?: string;
		/** Maps to `--cg-muted` — filename, callout body, copy button. */
		mutedForeground?: string;
	};
	/** Inline annotation marker (the highlighted token in the code area). */
	annotations?: {
		/** Maps to `--cg-ann-bg`. */
		markerBackground?: string;
		/** Maps to `--cg-ann-border`. */
		markerBorder?: string;
		/** Maps to `--cg-ann-hover`. */
		markerHover?: string;
	};
	/** Language badge in the toolbar (top-right). */
	badge?: {
		/** Maps to `--cg-badge-bg`. */
		background?: string;
		/** Maps to `--cg-badge-text`. */
		foreground?: string;
	};
	/** Gutter line numbers on the left edge of the code area. */
	lineNumbers?: {
		/** Maps to `--cg-line-num`. */
		foreground?: string;
	};
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
	/**
	 * Chrome colors and sizing that blend a block into the host site's
	 * design system. Values are forwarded as inline CSS custom properties
	 * on the `<code-gloss>` host, so `var(--my-site-bg)` references
	 * resolve against the page's own variables at render time.
	 */
	styleOverrides?: CodeGlossStyleOverrides;
};
