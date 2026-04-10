import {
	ARC_BASE_X,
	ARC_BEND,
	ARC_X_STEP,
	GUTTER_WIDTH,
} from '../code-gloss.constants';
import type { Annotation, Connection } from '../code-gloss.types';

const SVG_NS = 'http://www.w3.org/2000/svg';

type DrawArcsParameters = {
	svg: SVGSVGElement;
	height: number;
	annotations: Annotation[];
	connections: Connection[];
	/** Map from annotation id → vertical position (px) within the code area */
	annotationYMap: Map<string, number>;
	/** Click handler invoked when an interactive arc/dot is clicked */
	onConnectionClick: (conn: Connection, event: MouseEvent) => void;
};

export function drawArcs({
	svg,
	height,
	connections,
	annotationYMap,
	onConnectionClick,
}: DrawArcsParameters): void {
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

		const dot1 = createDot(xPos, fromY, conn.color);
		const dot2 = createDot(xPos, toY, conn.color);
		svg.append(dot1);
		svg.append(dot2);

		const path = createArcPath(xPos, fromY, toY, conn.color);
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

function createDot(cx: number, cy: number, color: string): SVGCircleElement {
	const circle = document.createElementNS(SVG_NS, 'circle');
	circle.setAttribute('cx', String(cx));
	circle.setAttribute('cy', String(cy));
	circle.setAttribute('r', '2.5');
	circle.setAttribute('fill', color);
	circle.setAttribute('opacity', '0.8');
	return circle;
}

function createArcPath(
	xPos: number,
	fromY: number,
	toY: number,
	color: string,
): SVGPathElement {
	const path = document.createElementNS(SVG_NS, 'path');
	path.setAttribute(
		'd',
		`M${xPos} ${fromY} C ${ARC_BEND} ${fromY} ${ARC_BEND} ${toY} ${xPos} ${toY}`,
	);
	path.setAttribute('stroke', color);
	path.setAttribute('stroke-width', '1.5');
	path.setAttribute('stroke-dasharray', '4 3');
	path.setAttribute('opacity', '0.55');
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
