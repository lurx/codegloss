'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import type { AnnotationsPanelProps } from './annotations-panel.types';
import { createBlankAnnotation } from './annotations-panel.helpers';
import { AnnotationRow } from './annotation-row.component';
import { ConnectArcOverlay } from './connect-arc-overlay.component';
import styles from './annotations-panel.module.scss';

const DATA_CONNECT_ID = 'data-connect-id';

function findConnectTarget(element: Element | null): string | null {
	const hit = element?.closest(`[${DATA_CONNECT_ID}]`);
	return hit ? hit.getAttribute(DATA_CONNECT_ID) : null;
}

export function AnnotationsPanel({
	annotations,
	issues,
	onAddAction,
	onUpdateAction,
	onRemoveAction,
	onConnectAction,
}: Readonly<AnnotationsPanelProps>) {
	const [dragFromId, setDragFromId] = useState<string | null>(null);

	const canConnect = annotations.length >= 2;

	const handleAdd = useCallback(
		() => onAddAction(createBlankAnnotation(annotations)),
		[annotations, onAddAction],
	);

	const handleDragStart = useCallback(
		(id: string) => {
			if (!canConnect) return;
			setDragFromId(id);
		},
		[canConnect],
	);

	useEffect(() => {
		if (dragFromId === null) return undefined;
		const handleUp = (event: PointerEvent) => {
			const target = document.elementFromPoint(event.clientX, event.clientY);
			const toId = findConnectTarget(target);
			if (toId && toId !== dragFromId) {
				onConnectAction(dragFromId, toId);
			}
			setDragFromId(null);
		};
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setDragFromId(null);
		};
		globalThis.addEventListener('pointerup', handleUp);
		globalThis.addEventListener('keydown', handleKey);
		return () => {
			globalThis.removeEventListener('pointerup', handleUp);
			globalThis.removeEventListener('keydown', handleKey);
		};
	}, [dragFromId, onConnectAction]);

	const renderList = () => {
		if (annotations.length === 0) {
			return <div className={styles.empty}>No annotations yet.</div>;
		}
		return annotations.map((annotation, i) => (
			<AnnotationRow
				key={`${annotation.id}-${i}`}
				index={i}
				value={annotation}
				issues={issues[i] ?? []}
				dragFromId={dragFromId}
				canConnect={canConnect}
				onUpdateAction={onUpdateAction}
				onRemoveAction={onRemoveAction}
				onDragStartAction={handleDragStart}
			/>
		));
	};

	const dragging = dragFromId !== null;
	const showTip = canConnect || dragging;
	const tipClass = dragging ? styles.tipActive : styles.tip;

	const renderTip = () => {
		if (dragging) {
			return 'Release on another annotation to connect — Esc to cancel';
		}
		return (
			<>
				Tip — drag the{' '}
				<ArrowLeft
					size={12}
					aria-hidden="true"
					className={styles.tipIcon}
				/>{' '}
				on any annotation onto another to draw a connection.
			</>
		);
	};

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<span className={styles.heading}>Annotations</span>
				<button
					type="button"
					className={styles.addButton}
					onClick={handleAdd}
				>
					<Plus
						size={14}
						aria-hidden="true"
					/>{' '}
					Add
				</button>
			</div>
			{showTip && <p className={tipClass}>{renderTip()}</p>}
			<div className={styles.list}>{renderList()}</div>
			{dragFromId !== null && <ConnectArcOverlay fromId={dragFromId} />}
		</div>
	);
}
