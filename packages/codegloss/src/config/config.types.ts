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

export type CodeGlossUserConfig = {
	/** Named bundled theme, or an inline theme object. */
	theme?: string | CodeGlossTheme;
	/** Override for dark mode only (applied on top of theme). */
	darkTheme?: string | CodeGlossTheme;
	/** Style overrides for connection arcs. */
	arcs?: CodeGlossArcStyle;
};
