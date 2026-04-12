'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { AnnotationsPanelProps } from './annotations-panel.types';
import { createBlankAnnotation } from './annotations-panel.helpers';
import { AnnotationRow } from './annotation-row.component';
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

	const handleAdd = useCallback(
		() => onAddAction(createBlankAnnotation(annotations)),
		[annotations, onAddAction],
	);

	const handleDragStart = useCallback((id: string) => setDragFromId(id), []);

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
		window.addEventListener('pointerup', handleUp);
		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('pointerup', handleUp);
			window.removeEventListener('keydown', handleKey);
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
				onUpdateAction={onUpdateAction}
				onRemoveAction={onRemoveAction}
				onDragStartAction={handleDragStart}
			/>
		));
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
					<Plus size={14} aria-hidden="true" /> Add
				</button>
			</div>
			{dragFromId !== null && (
				<div className={styles.dragHint}>
					Release on another annotation to connect — Esc to cancel
				</div>
			)}
			<div className={styles.list}>{renderList()}</div>
		</div>
	);
}
