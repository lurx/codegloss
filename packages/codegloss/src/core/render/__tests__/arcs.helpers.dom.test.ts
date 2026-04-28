import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ARC_BASE_X,
	ARC_BEND,
	ARC_X_STEP,
	GUTTER_WIDTH,
	RIGHT_ARC_BEND,
	RIGHT_DOT_OFFSET,
} from '../../code-gloss.constants';
import { drawArcs } from '../arcs.helpers';
import type { AnnotationPosition, DrawArcsParameters } from '../arcs.types';
import type { Annotation, Connection } from '../../code-gloss.types';

const SVG_NS = 'http://www.w3.org/2000/svg';

const ann = (id: string): Annotation => ({
	id,
	token: id,
	line: 0,
	occurrence: 0,
	title: id,
	text: id,
});

const conn = (overrides: Partial<Connection> = {}): Connection => ({
	from: 'a',
	to: 'b',
	color: '#f00',
	...overrides,
});

const pos = (y: number, lineEndX = 100): AnnotationPosition => ({
	y,
	lineEndX,
});

let leftSvg: SVGSVGElement;
let rightSvg: SVGSVGElement;

beforeEach(() => {
	leftSvg = document.createElementNS(SVG_NS, 'svg');
	rightSvg = document.createElementNS(SVG_NS, 'svg');
});

const defaultParams = (
	overrides: Partial<DrawArcsParameters> = {},
): DrawArcsParameters => ({
	leftSvg,
	rightSvg,
	height: 100,
	rightSvgWidth: 400,
	annotations: [],
	connections: [],
	annotationPositions: new Map(),
	onConnectionClickAction() {
		// Noop
	},
	...overrides,
});

describe('drawArcs', () => {
	it('sets height and viewBox on both SVGs', () => {
		drawArcs(defaultParams({ height: 200, rightSvgWidth: 500 }));

		expect(leftSvg.getAttribute('height')).toBe('200');
		expect(leftSvg.getAttribute('viewBox')).toBe(`0 0 ${GUTTER_WIDTH} 200`);
		expect(rightSvg.getAttribute('height')).toBe('200');
		expect(rightSvg.getAttribute('viewBox')).toBe('0 0 500 200');
	});

	it('clears existing children from both SVGs before drawing', () => {
		leftSvg.append(document.createElementNS(SVG_NS, 'circle'));
		rightSvg.append(document.createElementNS(SVG_NS, 'rect'));

		drawArcs(defaultParams());

		expect(leftSvg.childNodes.length).toBe(0);
		expect(rightSvg.childNodes.length).toBe(0);
	});

	describe('left-side (default)', () => {
		it('skips a connection whose endpoints are missing', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'missing' })],
					annotationPositions: new Map([['a', pos(10)]]),
				}),
			);

			expect(leftSvg.childNodes.length).toBe(0);
		});

		it('renders two dots and one decorative arc for a non-interactive connection', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b', color: '#0af' })],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(50)],
					]),
				}),
			);

			expect(leftSvg.childNodes.length).toBe(3);

			const circles = leftSvg.querySelectorAll('circle');
			expect(circles).toHaveLength(2);
			expect(circles[0].getAttribute('cx')).toBe(String(ARC_BASE_X));
			expect(circles[0].getAttribute('cy')).toBe('10');
			expect(circles[0].getAttribute('fill')).toBe('#0af');
			expect(circles[1].getAttribute('cy')).toBe('50');

			const path = leftSvg.querySelector('path');
			expect(path?.getAttribute('d')).toBe(
				`M${ARC_BASE_X} 10 C ${ARC_BEND} 10 ${ARC_BEND} 50 ${ARC_BASE_X} 50`,
			);
			expect(path?.getAttribute('stroke')).toBe('#0af');
			expect(path?.getAttribute('opacity')).toBe('0.55');
			expect(path?.getAttribute('fill')).toBe('none');
		});

		it('adds a hit target and click handlers for an interactive connection', () => {
			const onClick = vi.fn();
			const interactive = conn({ from: 'a', to: 'b', text: 'tooltip body' });

			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [interactive],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(50)],
					]),
					onConnectionClickAction: onClick,
				}),
			);

			expect(leftSvg.childNodes.length).toBe(4);

			const paths = leftSvg.querySelectorAll('path');
			expect(paths).toHaveLength(2);
			const hit = paths[1];
			expect(hit.getAttribute('stroke')).toBe('transparent');
			expect(hit.getAttribute('stroke-width')).toBe('12');
			expect(hit.style.cursor).toBe('pointer');
			expect(hit.style.pointerEvents).toBe('stroke');

			const event = new MouseEvent('click', { bubbles: true });
			hit.dispatchEvent(event);
			expect(onClick).toHaveBeenCalledTimes(1);
			expect(onClick).toHaveBeenCalledWith(interactive, event);

			const circles = leftSvg.querySelectorAll('circle');
			circles[0].dispatchEvent(new MouseEvent('click'));
			circles[1].dispatchEvent(new MouseEvent('click'));
			expect(onClick).toHaveBeenCalledTimes(3);
			expect(circles[0].style.cursor).toBe('pointer');
			expect(circles[0].style.pointerEvents).toBe('auto');
		});

		it('omits stroke-dasharray when arcStyle.strokeDasharray is "none"', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b' })],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(20)],
					]),
					arcStyle: { strokeDasharray: 'none' },
				}),
			);

			expect(
				leftSvg.querySelector('path')?.hasAttribute('stroke-dasharray'),
			).toBe(false);
		});

		it('offsets each subsequent arc horizontally by ARC_X_STEP', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b'), ann('c'), ann('d')],
					connections: [
						conn({ from: 'a', to: 'b' }),
						conn({ from: 'c', to: 'd' }),
					],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(20)],
						['c', pos(30)],
						['d', pos(40)],
					]),
				}),
			);

			const circles = leftSvg.querySelectorAll('circle');
			expect(circles[0].getAttribute('cx')).toBe(String(ARC_BASE_X));
			expect(circles[2].getAttribute('cx')).toBe(
				String(ARC_BASE_X - ARC_X_STEP),
			);
		});
	});

	describe('right-side', () => {
		it('draws right-side connections into the right SVG, not the left', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [
						conn({ from: 'a', to: 'b', color: '#0af', side: 'right' }),
					],
					annotationPositions: new Map([
						['a', pos(10, 120)],
						['b', pos(50, 180)],
					]),
				}),
			);

			expect(leftSvg.childNodes.length).toBe(0);
			expect(rightSvg.childNodes.length).toBe(3);
		});

		it('anchors each endpoint at its own line-end + RIGHT_DOT_OFFSET', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b', side: 'right' })],
					annotationPositions: new Map([
						['a', pos(10, 120)],
						['b', pos(50, 180)],
					]),
				}),
			);

			const circles = rightSvg.querySelectorAll('circle');
			expect(circles[0].getAttribute('cx')).toBe(
				String(120 + RIGHT_DOT_OFFSET),
			);
			expect(circles[0].getAttribute('cy')).toBe('10');
			expect(circles[1].getAttribute('cx')).toBe(
				String(180 + RIGHT_DOT_OFFSET),
			);
			expect(circles[1].getAttribute('cy')).toBe('50');
		});

		it('bends the arc to the right of the farthest endpoint', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b', side: 'right' })],
					annotationPositions: new Map([
						['a', pos(10, 120)],
						['b', pos(50, 180)],
					]),
				}),
			);

			const fromX = 120 + RIGHT_DOT_OFFSET;
			const toX = 180 + RIGHT_DOT_OFFSET;
			const bendX = toX + RIGHT_ARC_BEND;

			expect(rightSvg.querySelector('path')?.getAttribute('d')).toBe(
				`M${fromX} 10 C ${bendX} 10 ${bendX} 50 ${toX} 50`,
			);
		});

		it('stacks multiple right-side arcs outward by ARC_X_STEP', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b'), ann('c'), ann('d')],
					connections: [
						conn({ from: 'a', to: 'b', side: 'right' }),
						conn({ from: 'c', to: 'd', side: 'right' }),
					],
					annotationPositions: new Map([
						['a', pos(10, 120)],
						['b', pos(20, 120)],
						['c', pos(30, 120)],
						['d', pos(40, 120)],
					]),
				}),
			);

			const paths = rightSvg.querySelectorAll('path');
			expect(paths).toHaveLength(2);

			const extract = (d: string): number => {
				const match = /C (\d+(?:\.\d+)?)/.exec(d);
				return match ? Number(match[1]) : 0;
			};

			const firstBend = extract(paths[0].getAttribute('d') ?? '');
			const secondBend = extract(paths[1].getAttribute('d') ?? '');
			expect(secondBend - firstBend).toBe(ARC_X_STEP);
		});

		it('skips a right-side connection whose endpoints are missing', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'missing', side: 'right' })],
					annotationPositions: new Map([['a', pos(10, 120)]]),
				}),
			);

			expect(rightSvg.childNodes.length).toBe(0);
		});

		it('partitions left and right connections independently', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b'), ann('c'), ann('d')],
					connections: [
						conn({ from: 'a', to: 'b' }),
						conn({ from: 'c', to: 'd', side: 'right' }),
					],
					annotationPositions: new Map([
						['a', pos(10, 120)],
						['b', pos(20, 120)],
						['c', pos(30, 120)],
						['d', pos(40, 120)],
					]),
				}),
			);

			expect(leftSvg.querySelectorAll('circle')).toHaveLength(2);
			expect(rightSvg.querySelectorAll('circle')).toHaveLength(2);
		});
	});

	describe('arrowhead', () => {
		it('renders a dot for "from" and a marker-end arrowhead for "to"', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b' })],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(50)],
					]),
					arcStyle: { arrowhead: true },
				}),
			);

			const circles = leftSvg.querySelectorAll('circle');
			expect(circles).toHaveLength(1);

			const marker = leftSvg.querySelector('marker');
			expect(marker).toBeTruthy();
			expect(marker?.getAttribute('orient')).toBe('auto-start-reverse');

			// querySelector('path') would also match the marker's inner tip path;
			// scope to paths that are direct SVG children instead.
			const arcPath = leftSvg.querySelector<SVGPathElement>(':scope > path');
			expect(arcPath?.getAttribute('marker-end')).toMatch(
				/^url\(#cg-arrowhead-\d+\)$/,
			);
		});

		it('paints the marker tip with the connection color', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b', color: '#0af' })],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(50)],
					]),
					arcStyle: { arrowhead: true },
				}),
			);

			const tip = leftSvg.querySelector('marker path');
			expect(tip?.getAttribute('fill')).toBe('#0af');
		});

		it('reuses a single <defs> when multiple arrowheaded arcs share an SVG', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b'), ann('c'), ann('d')],
					connections: [
						conn({ from: 'a', to: 'b' }),
						conn({ from: 'c', to: 'd' }),
					],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(20)],
						['c', pos(30)],
						['d', pos(40)],
					]),
					arcStyle: { arrowhead: true },
				}),
			);

			expect(leftSvg.querySelectorAll('defs')).toHaveLength(1);
			expect(leftSvg.querySelectorAll('marker')).toHaveLength(2);
		});

		it('wires the from-dot click handler but omits the to-dot when arrowhead replaces it', () => {
			const onClick = vi.fn();

			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b', text: 'info' })],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(50)],
					]),
					arcStyle: { arrowhead: true },
					onConnectionClickAction: onClick,
				}),
			);

			const circles = leftSvg.querySelectorAll('circle');
			expect(circles).toHaveLength(1);
			circles[0].dispatchEvent(new MouseEvent('click'));

			const hit = leftSvg.querySelector<SVGPathElement>(
				':scope > path[stroke="transparent"]',
			);
			hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(onClick).toHaveBeenCalledTimes(2);
		});

		it('registers the arrowhead marker at its base so the tip overshoots the path end', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b' })],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(50)],
					]),
					arcStyle: { arrowhead: true },
				}),
			);

			const marker = leftSvg.querySelector('marker');
			expect(marker?.getAttribute('refX')).toBe('0');
		});

		it('shortens the path end by the arrow length so the shaft meets the base', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b' })],
					annotationPositions: new Map([
						['a', pos(10)],
						['b', pos(50)],
					]),
					arcStyle: { arrowhead: true, strokeWidth: 2 },
				}),
			);

			const arcPath = leftSvg.querySelector<SVGPathElement>(':scope > path');
			const d = arcPath?.getAttribute('d') ?? '';
			// Path ends at xPos - 7*strokeWidth = 34 - 14 = 20. The trailing
			// coordinate pair in the cubic is the endpoint.
			expect(d.endsWith(' 20 50')).toBe(true);
		});

		it('applies the arrowhead to right-side arcs as well', () => {
			drawArcs(
				defaultParams({
					annotations: [ann('a'), ann('b')],
					connections: [conn({ from: 'a', to: 'b', side: 'right' })],
					annotationPositions: new Map([
						['a', pos(10, 120)],
						['b', pos(50, 180)],
					]),
					arcStyle: { arrowhead: true },
				}),
			);

			expect(rightSvg.querySelector('marker')).toBeTruthy();
			expect(rightSvg.querySelectorAll('circle')).toHaveLength(1);
		});
	});
});
