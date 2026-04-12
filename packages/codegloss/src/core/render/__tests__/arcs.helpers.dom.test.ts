import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ARC_BASE_X,
	ARC_BEND,
	ARC_X_STEP,
	GUTTER_WIDTH,
} from '../../code-gloss.constants';
import { drawArcs } from '../arcs.helpers';
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

let svg: SVGSVGElement;

beforeEach(() => {
	svg = document.createElementNS(SVG_NS, 'svg');
});

describe('drawArcs', () => {
	it('sets the height attribute and viewBox using the gutter width', () => {
		drawArcs({
			svg,
			height: 200,
			annotations: [],
			connections: [],
			annotationYMap: new Map(),
			onConnectionClickAction() {
				// Noop
			},
		});

		expect(svg.getAttribute('height')).toBe('200');
		expect(svg.getAttribute('viewBox')).toBe(`0 0 ${GUTTER_WIDTH} 200`);
	});

	it('clears existing children before drawing', () => {
		const stale = document.createElementNS(SVG_NS, 'circle');
		svg.append(stale);
		expect(svg.childNodes.length).toBe(1);

		drawArcs({
			svg,
			height: 100,
			annotations: [],
			connections: [],
			annotationYMap: new Map(),
			onConnectionClickAction() {
				// Noop
			},
		});

		expect(svg.childNodes.length).toBe(0);
	});

	it('skips a connection whose endpoints are missing from the y-map', () => {
		drawArcs({
			svg,
			height: 100,
			annotations: [ann('a'), ann('b')],
			connections: [conn({ from: 'a', to: 'missing' })],
			annotationYMap: new Map([['a', 10]]),
			onConnectionClickAction() {
				// Noop
			},
		});

		expect(svg.childNodes.length).toBe(0);
	});

	it('renders two dots and one decorative arc for a non-interactive connection', () => {
		drawArcs({
			svg,
			height: 100,
			annotations: [ann('a'), ann('b')],
			connections: [conn({ from: 'a', to: 'b', color: '#0af' })],
			annotationYMap: new Map([
				['a', 10],
				['b', 50],
			]),
			onConnectionClickAction() {
				// Noop
			},
		});

		// 2 dots + 1 path (no hit target since !interactive)
		expect(svg.childNodes.length).toBe(3);

		const circles = svg.querySelectorAll('circle');
		expect(circles).toHaveLength(2);
		expect(circles[0].getAttribute('cx')).toBe(String(ARC_BASE_X));
		expect(circles[0].getAttribute('cy')).toBe('10');
		expect(circles[0].getAttribute('fill')).toBe('#0af');
		expect(circles[1].getAttribute('cy')).toBe('50');

		const path = svg.querySelector('path');
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

		drawArcs({
			svg,
			height: 100,
			annotations: [ann('a'), ann('b')],
			connections: [interactive],
			annotationYMap: new Map([
				['a', 10],
				['b', 50],
			]),
			onConnectionClickAction: onClick,
		});

		// 2 dots + decorative path + hit target
		expect(svg.childNodes.length).toBe(4);

		const paths = svg.querySelectorAll('path');
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

		// Each dot is also clickable
		const circles = svg.querySelectorAll('circle');
		circles[0].dispatchEvent(new MouseEvent('click'));
		circles[1].dispatchEvent(new MouseEvent('click'));
		expect(onClick).toHaveBeenCalledTimes(3);
		expect(circles[0].style.cursor).toBe('pointer');
		expect(circles[0].style.pointerEvents).toBe('auto');
	});

	it('omits the stroke-dasharray attribute when arcStyle.strokeDasharray is "none"', () => {
		drawArcs({
			svg,
			height: 100,
			annotations: [ann('a'), ann('b')],
			connections: [conn({ from: 'a', to: 'b' })],
			annotationYMap: new Map([
				['a', 10],
				['b', 20],
			]),
			onConnectionClickAction() {
				// Noop
			},
			arcStyle: { strokeDasharray: 'none' },
		});

		const path = svg.querySelector('path');
		expect(path?.hasAttribute('stroke-dasharray')).toBe(false);
	});

	it('offsets each subsequent arc horizontally by ARC_X_STEP', () => {
		drawArcs({
			svg,
			height: 100,
			annotations: [ann('a'), ann('b'), ann('c'), ann('d')],
			connections: [conn({ from: 'a', to: 'b' }), conn({ from: 'c', to: 'd' })],
			annotationYMap: new Map([
				['a', 10],
				['b', 20],
				['c', 30],
				['d', 40],
			]),
			onConnectionClickAction() {
				// Noop
			},
		});

		const circles = svg.querySelectorAll('circle');
		expect(circles[0].getAttribute('cx')).toBe(String(ARC_BASE_X));
		expect(circles[2].getAttribute('cx')).toBe(String(ARC_BASE_X - ARC_X_STEP));
	});
});
