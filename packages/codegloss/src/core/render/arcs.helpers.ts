import {
	ARC_BASE_X,
	ARC_BEND,
	ARC_X_STEP,
	GUTTER_WIDTH,
	RIGHT_ARC_BEND,
	RIGHT_DOT_OFFSET,
} from '../code-gloss.constants';
import type { Connection } from '../code-gloss.types';
import type {
	AnnotationPosition,
	ArcStyleOverrides,
	DrawArcsParameters,
} from './arcs.types';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ARROWHEAD_MARKER_WIDTH = 7;
/** Factor applied to ARC_BEND when arrowhead is on — pulls the control point
 *  further out so the shaft has a visible sweep before meeting the arrow. */
const ARROWHEAD_BEND_FACTOR = 0.4;

type ResolvedStyle = {
	dotRadius: number;
	dotOpacity: number;
	strokeWidth: number;
	strokeDasharray: string;
	opacity: number;
	arrowhead: boolean;
};

function resolveStyle(arcStyle: ArcStyleOverrides | undefined): ResolvedStyle {
	return {
		dotRadius: arcStyle?.dotRadius ?? 2.5,
		dotOpacity: arcStyle?.dotOpacity ?? 0.8,
		strokeWidth: arcStyle?.strokeWidth ?? 1.5,
		strokeDasharray: arcStyle?.strokeDasharray ?? '4 3',
		opacity: arcStyle?.opacity ?? 0.55,
		arrowhead: arcStyle?.arrowhead ?? false,
	};
}

export function drawArcs({
	leftSvg,
	rightSvg,
	height,
	rightSvgWidth,
	connections,
	annotationPositions,
	onConnectionClickAction,
	arcStyle,
}: DrawArcsParameters): void {
	const style = resolveStyle(arcStyle);

	prepareSvg(leftSvg, GUTTER_WIDTH, height);
	prepareSvg(rightSvg, rightSvgWidth, height);

	const leftConnections: Connection[] = [];
	const rightConnections: Connection[] = [];

	for (const conn of connections) {
		if (conn.side === 'right') {
			rightConnections.push(conn);
		} else {
			leftConnections.push(conn);
		}
	}

	for (const [idx, conn] of leftConnections.entries()) {
		drawLeftArc({
			svg: leftSvg,
			conn,
			idx,
			style,
			annotationPositions,
			onConnectionClickAction,
		});
	}

	for (const [idx, conn] of rightConnections.entries()) {
		drawRightArc({
			svg: rightSvg,
			conn,
			idx,
			style,
			annotationPositions,
			onConnectionClickAction,
		});
	}
}

function prepareSvg(
	svg: SVGSVGElement,
	width: number,
	height: number,
): void {
	svg.setAttribute('height', String(height));
	svg.setAttribute('width', String(width));
	svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

	while (svg.firstChild) {
		svg.firstChild.remove();
	}
}

type DrawSideParameters = {
	svg: SVGSVGElement;
	conn: Connection;
	idx: number;
	style: ResolvedStyle;
	annotationPositions: Map<string, AnnotationPosition>;
	onConnectionClickAction: (conn: Connection, event: MouseEvent) => void;
};

function drawLeftArc({
	svg,
	conn,
	idx,
	style,
	annotationPositions,
	onConnectionClickAction,
}: DrawSideParameters): void {
	const from = annotationPositions.get(conn.from);
	const to = annotationPositions.get(conn.to);

	if (!from || !to) return;

	const xPos = ARC_BASE_X - idx * ARC_X_STEP;
	// When an arrowhead is attached, pull the path end back along the tangent
	// by the marker's length and widen the bend so the shaft sweeps into the
	// arrow base instead of terminating under its body.
	const arrowLength = style.arrowhead
		? ARROWHEAD_MARKER_WIDTH * style.strokeWidth
		: 0;
	const bendX = style.arrowhead ? ARC_BEND * ARROWHEAD_BEND_FACTOR : ARC_BEND;
	const endX = xPos - arrowLength;
	const path = buildCubicPath(xPos, from.y, bendX, endX, to.y);

	drawConnection({
		svg,
		conn,
		style,
		fromPoint: { x: xPos, y: from.y },
		toPoint: { x: endX, y: to.y },
		path,
		onConnectionClickAction,
	});
}

function drawRightArc({
	svg,
	conn,
	idx,
	style,
	annotationPositions,
	onConnectionClickAction,
}: DrawSideParameters): void {
	const from = annotationPositions.get(conn.from);
	const to = annotationPositions.get(conn.to);

	if (!from || !to) return;

	const fromX = from.lineEndX + RIGHT_DOT_OFFSET;
	const toX = to.lineEndX + RIGHT_DOT_OFFSET;
	const arrowLength = style.arrowhead
		? ARROWHEAD_MARKER_WIDTH * style.strokeWidth
		: 0;
	const rightBend = style.arrowhead
		? RIGHT_ARC_BEND / ARROWHEAD_BEND_FACTOR
		: RIGHT_ARC_BEND;
	const bendX = Math.max(fromX, toX) + rightBend + idx * ARC_X_STEP;
	const endX = toX + arrowLength;

	const path = buildCubicPath(fromX, from.y, bendX, endX, to.y);

	drawConnection({
		svg,
		conn,
		style,
		fromPoint: { x: fromX, y: from.y },
		toPoint: { x: endX, y: to.y },
		path,
		onConnectionClickAction,
	});
}

type Point = { x: number; y: number };

type DrawConnectionParameters = {
	svg: SVGSVGElement;
	conn: Connection;
	style: ResolvedStyle;
	fromPoint: Point;
	toPoint: Point;
	path: string;
	onConnectionClickAction: (conn: Connection, event: MouseEvent) => void;
};

function drawConnection({
	svg,
	conn,
	style,
	fromPoint,
	toPoint,
	path,
	onConnectionClickAction,
}: DrawConnectionParameters): void {
	const interactive = Boolean(conn.text);
	const onClick = interactive
		? (event: MouseEvent) => onConnectionClickAction(conn, event)
		: null;

	const fromDot = createDot(
		fromPoint.x,
		fromPoint.y,
		conn.color,
		style.dotRadius,
		style.dotOpacity,
	);
	svg.append(fromDot);

	let toDot: SVGCircleElement | undefined;
	if (!style.arrowhead) {
		toDot = createDot(
			toPoint.x,
			toPoint.y,
			conn.color,
			style.dotRadius,
			style.dotOpacity,
		);
		svg.append(toDot);
	}

	const arcPath = createArcPath(path, {
		color: conn.color,
		strokeWidth: style.strokeWidth,
		strokeDasharray: style.strokeDasharray,
		opacity: style.opacity,
	});

	if (style.arrowhead) {
		attachArrowheadMarker(svg, arcPath, conn.color);
	}

	svg.append(arcPath);

	if (interactive && onClick) {
		const hit = createHitTarget(path);
		hit.addEventListener('click', onClick);
		svg.append(hit);

		fromDot.style.cursor = 'pointer';
		fromDot.style.pointerEvents = 'auto';
		fromDot.addEventListener('click', onClick);

		if (toDot) {
			toDot.style.cursor = 'pointer';
			toDot.style.pointerEvents = 'auto';
			toDot.addEventListener('click', onClick);
		}
	}
}

function buildCubicPath(
	fromX: number,
	fromY: number,
	controlX: number,
	toX: number,
	toY: number,
): string {
	return `M${fromX} ${fromY} C ${controlX} ${fromY} ${controlX} ${toY} ${toX} ${toY}`;
}

function createDot(
	cx: number,
	cy: number,
	color: string,
	radius: number,
	opacity: number,
): SVGCircleElement {
	const circle = document.createElementNS(SVG_NS, 'circle');
	circle.setAttribute('cx', String(cx));
	circle.setAttribute('cy', String(cy));
	circle.setAttribute('r', String(radius));
	circle.setAttribute('fill', color);
	circle.setAttribute('opacity', String(opacity));
	return circle;
}

type ArcPathStyle = {
	color: string;
	strokeWidth: number;
	strokeDasharray: string;
	opacity: number;
};

function createArcPath(d: string, style: ArcPathStyle): SVGPathElement {
	const path = document.createElementNS(SVG_NS, 'path');
	path.setAttribute('d', d);
	path.setAttribute('stroke', style.color);
	path.setAttribute('stroke-width', String(style.strokeWidth));
	if (style.strokeDasharray !== 'none') {
		path.setAttribute('stroke-dasharray', style.strokeDasharray);
	}

	path.setAttribute('opacity', String(style.opacity));
	path.setAttribute('fill', 'none');
	return path;
}

function createHitTarget(d: string): SVGPathElement {
	const hit = document.createElementNS(SVG_NS, 'path');
	hit.setAttribute('d', d);
	hit.setAttribute('stroke', 'transparent');
	hit.setAttribute('stroke-width', '12');
	hit.setAttribute('fill', 'none');
	hit.style.cursor = 'pointer';
	hit.style.pointerEvents = 'stroke';
	return hit;
}

let arrowheadCounter = 0;

function attachArrowheadMarker(
	svg: SVGSVGElement,
	path: SVGPathElement,
	color: string,
): void {
	const defs = getOrCreateDefs(svg);
	const markerId = `cg-arrowhead-${++arrowheadCounter}`;

	const marker = document.createElementNS(SVG_NS, 'marker');
	marker.setAttribute('id', markerId);
	marker.setAttribute('viewBox', '0 0 8 8');
	// refX=0 registers the marker's base at the path end so the shaft
	// visually terminates at the arrow base; the tip then extends forward
	// along the tangent to land at the original anchor (see the arrowLength
	// compensation in drawLeftArc / drawRightArc).
	marker.setAttribute('refX', '0');
	marker.setAttribute('refY', '4');
	marker.setAttribute('markerWidth', String(ARROWHEAD_MARKER_WIDTH));
	marker.setAttribute('markerHeight', String(ARROWHEAD_MARKER_WIDTH));
	marker.setAttribute('orient', 'auto-start-reverse');

	const tip = document.createElementNS(SVG_NS, 'path');
	tip.setAttribute('d', 'M0 0 L8 4 L0 8 z');
	tip.setAttribute('fill', color);
	marker.append(tip);
	defs.append(marker);

	path.setAttribute('marker-end', `url(#${markerId})`);
}

function getOrCreateDefs(svg: SVGSVGElement): SVGDefsElement {
	const existing = svg.querySelector('defs');
	if (existing) return existing;
	const defs = document.createElementNS(SVG_NS, 'defs');
	svg.prepend(defs);
	return defs;
}
