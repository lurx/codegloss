import {
	ARC_BASE_X,
	ARC_BEND,
	ARC_X_STEP,
	GUTTER_WIDTH,
} from '../code-gloss.constants';
import type { DrawArcsParameters } from './arcs.types';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function drawArcs({
	svg,
	height,
	connections,
	annotationYMap,
	onConnectionClick,
	arcStyle,
}: DrawArcsParameters): void {
	const dotR = arcStyle?.dotRadius ?? 2.5;
	const dotOp = arcStyle?.dotOpacity ?? 0.8;
	const sw = arcStyle?.strokeWidth ?? 1.5;
	const dash = arcStyle?.strokeDasharray ?? '4 3';
	const arcOp = arcStyle?.opacity ?? 0.55;
	svg.setAttribute('height', String(height));
	svg.setAttribute('viewBox', `0 0 ${GUTTER_WIDTH} ${height}`);

	while (svg.firstChild) {
		svg.firstChild.remove();
	}

	for (const [idx, conn] of connections.entries()) {
		const fromY = annotationYMap.get(conn.from);
		const toY = annotationYMap.get(conn.to);

		if (fromY === undefined || toY === undefined) continue;

		const xPos = ARC_BASE_X - idx * ARC_X_STEP;
		const interactive = Boolean(conn.text);
		const onClick = interactive
			? (event: MouseEvent) => onConnectionClick(conn, event)
			: null;

		const dot1 = createDot(xPos, fromY, conn.color, dotR, dotOp);
		const dot2 = createDot(xPos, toY, conn.color, dotR, dotOp);
		svg.append(dot1);
		svg.append(dot2);

		const path = createArcPath(xPos, fromY, toY, conn.color, sw, dash, arcOp);
		svg.append(path);

		if (interactive && onClick) {
			const hit = createHitTarget(xPos, fromY, toY);
			hit.addEventListener('click', onClick);
			svg.append(hit);

			dot1.style.cursor = 'pointer';
			dot1.style.pointerEvents = 'auto';
			dot1.addEventListener('click', onClick);

			dot2.style.cursor = 'pointer';
			dot2.style.pointerEvents = 'auto';
			dot2.addEventListener('click', onClick);
		}
	}
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

function createArcPath(
	xPos: number,
	fromY: number,
	toY: number,
	color: string,
	strokeWidth: number,
	dasharray: string,
	opacity: number,
): SVGPathElement {
	const path = document.createElementNS(SVG_NS, 'path');
	path.setAttribute(
		'd',
		`M${xPos} ${fromY} C ${ARC_BEND} ${fromY} ${ARC_BEND} ${toY} ${xPos} ${toY}`,
	);
	path.setAttribute('stroke', color);
	path.setAttribute('stroke-width', String(strokeWidth));
	if (dasharray !== 'none') {
		path.setAttribute('stroke-dasharray', dasharray);
	}

	path.setAttribute('opacity', String(opacity));
	path.setAttribute('fill', 'none');
	return path;
}

function createHitTarget(
	xPos: number,
	fromY: number,
	toY: number,
): SVGPathElement {
	const hit = document.createElementNS(SVG_NS, 'path');
	hit.setAttribute(
		'd',
		`M${xPos} ${fromY} C ${ARC_BEND} ${fromY} ${ARC_BEND} ${toY} ${xPos} ${toY}`,
	);
	hit.setAttribute('stroke', 'transparent');
	hit.setAttribute('stroke-width', '12');
	hit.setAttribute('fill', 'none');
	hit.style.cursor = 'pointer';
	hit.style.pointerEvents = 'stroke';
	return hit;
}
