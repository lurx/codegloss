import type { Annotation, Connection } from '../code-gloss.types';

export type ArcStyleOverrides = {
	dotRadius?: number;
	dotOpacity?: number;
	strokeWidth?: number;
	strokeDasharray?: string;
	opacity?: number;
};

export type DrawArcsParameters = {
	svg: SVGSVGElement;
	height: number;
	annotations: Annotation[];
	connections: Connection[];
	/** Map from annotation id → vertical position (px) within the code area */
	annotationYMap: Map<string, number>;
	/** Click handler invoked when an interactive arc/dot is clicked */
	onConnectionClick: (conn: Connection, event: MouseEvent) => void;
	/** Optional style overrides for arcs */
	arcStyle?: ArcStyleOverrides;
};
