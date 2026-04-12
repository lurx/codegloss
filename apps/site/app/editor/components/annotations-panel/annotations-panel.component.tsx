'use client';

import { useCallback } from 'react';
import type { AnnotationsPanelProps } from './annotations-panel.types';
import { createBlankAnnotation } from './annotations-panel.helpers';
import { AnnotationRow } from './annotation-row.component';
import styles from './annotations-panel.module.scss';

export function AnnotationsPanel({
	annotations,
	onAddAction,
	onUpdateAction,
	onRemoveAction,
}: Readonly<AnnotationsPanelProps>) {
	const handleAdd = useCallback(
		() => onAddAction(createBlankAnnotation(annotations)),
		[annotations, onAddAction],
	);

	const renderList = () => {
		if (annotations.length === 0) {
			return <div className={styles.empty}>No annotations yet.</div>;
		}
		return annotations.map((annotation, i) => (
			<AnnotationRow
				key={`${annotation.id}-${i}`}
				index={i}
				value={annotation}
				onUpdateAction={onUpdateAction}
				onRemoveAction={onRemoveAction}
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
					+ Add
				</button>
			</div>
			<div className={styles.list}>{renderList()}</div>
		</div>
	);
}
