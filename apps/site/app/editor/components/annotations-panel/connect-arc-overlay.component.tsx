'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ConnectArcOverlayProps, Point } from './connect-arc-overlay.types';
import styles from './connect-arc-overlay.module.scss';

const DATA_CONNECT_ID = 'data-connect-id';
const HANDLE_SELECTOR = `[${DATA_CONNECT_ID}]`;
const BEND = 60;
const END_DOT_RADIUS = 5;

function findHandle(id: string): HTMLElement | null {
	return document.querySelector<HTMLElement>(
		`[${DATA_CONNECT_ID}="${CSS.escape(id)}"]`,
	);
}

function centerOf(element: Element): Point {
	const rect = element.getBoundingClientRect();
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function buildArcPath(from: Point, end: Point): string {
	const dx = end.x - from.x;
	const dy = end.y - from.y;
	const length = Math.hypot(dx, dy) || 1;
	// perpendicular to the from→end vector, rotated counter-clockwise so the
	// curve bows consistently to one side regardless of drag direction
	const nx = -dy / length;
	const ny = dx / length;
	const cx = (from.x + end.x) / 2 + nx * BEND;
	const cy = (from.y + end.y) / 2 + ny * BEND;
	return `M${from.x} ${from.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
}

export function ConnectArcOverlay({
	fromId,
}: Readonly<ConnectArcOverlayProps>) {
	const [from, setFrom] = useState<Point | null>(null);
	const [cursor, setCursor] = useState<Point | null>(null);
	const [snap, setSnap] = useState<Point | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const handleMove = (event: PointerEvent) => {
			const sourceElement = findHandle(fromId);
			if (sourceElement) setFrom(centerOf(sourceElement));
			setCursor({ x: event.clientX, y: event.clientY });

			const hit = document
				.elementFromPoint(event.clientX, event.clientY)
				?.closest<HTMLElement>(HANDLE_SELECTOR);
			const hitId = hit?.getAttribute(DATA_CONNECT_ID);
			setSnap(hit && hitId && hitId !== fromId ? centerOf(hit) : null);
		};

		globalThis.addEventListener('pointermove', handleMove);
		return () => globalThis.removeEventListener('pointermove', handleMove);
	}, [fromId]);

	if (!mounted || !from || !cursor) return null;

	const end = snap ?? cursor;
	const path = buildArcPath(from, end);
	const pathClass = snap ? styles.pathSnapped : styles.path;

	return createPortal(
		<svg className={styles.overlay} aria-hidden="true">
			<path d={path} className={pathClass} />
			<circle
				cx={end.x}
				cy={end.y}
				r={END_DOT_RADIUS}
				className={styles.endDot}
			/>
		</svg>,
		document.body,
	);
}
