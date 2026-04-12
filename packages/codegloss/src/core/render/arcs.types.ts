import type { Annotation, Connection } from '../code-gloss.types';

export type ArcStyleOverrides = {
	dotRadius?: number;
	dotOpacity?: number;
	strokeWidth?: number;
	strokeDasharray?: string;
	opacity?: number;
	/** Draw an arrowhead at the `to` endpoint. Default: false. */
	arrowhead?: boolean;
};

export type AnnotationPosition = {
	/** Vertical center (px) of the annotation's line within the code area */
	y: number;
	/**
	 * Right edge (px) of the annotation's line content, relative to the code
	 * area. Used to anchor right-side arc endpoints at the end of each line.
	 */
	lineEndX: number;
};

export type DrawArcsParameters = {
	/** SVG element covering the left gutter. */
	leftSvg: SVGSVGElement;
	/** SVG element covering the right side of the code area. */
	rightSvg: SVGSVGElement;
	/** Pixel height of the code area — sets both SVGs' viewBox height. */
	height: number;
	/**
	 * Pixel width of the right-side SVG (typically `codeArea.scrollWidth`).
	 * Sets the right SVG's `width`/`viewBox` so dots placed at a line's end
	 * map to real pixel positions.
	 */
	rightSvgWidth: number;
	annotations: Annotation[];
	connections: Connection[];
	/** Map from annotation id → { y, lineEndX } within the code area. */
	annotationPositions: Map<string, AnnotationPosition>;
	/** Click handler invoked when an interactive arc/dot is clicked. */
	onConnectionClickAction: (conn: Connection, event: MouseEvent) => void;
	/** Optional style overrides for arcs. */
	arcStyle?: ArcStyleOverrides;
};
