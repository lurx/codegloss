'use client';

import { useCallback } from 'react';
import type { ConnectionsPanelProps } from './connections-panel.types';
import { createBlankConnection } from './connections-panel.helpers';
import { ConnectionRow } from './connection-row.component';
import styles from './connections-panel.module.scss';

export function ConnectionsPanel({
	connections,
	annotations,
	issues,
	onAddAction,
	onUpdateAction,
	onRemoveAction,
}: Readonly<ConnectionsPanelProps>) {
	const canAdd = annotations.length >= 2;
	const handleAdd = useCallback(
		() => onAddAction(createBlankConnection(annotations)),
		[annotations, onAddAction],
	);

	const renderList = () => {
		if (connections.length === 0) {
			return (
				<div className={styles.empty}>
					{canAdd
						? 'No connections yet.'
						: 'Add at least two annotations to create a connection.'}
				</div>
			);
		}
		return connections.map((connection, i) => (
			<ConnectionRow
				key={`${connection.from}-${connection.to}-${i}`}
				index={i}
				value={connection}
				annotations={annotations}
				issues={issues[i] ?? []}
				onUpdateAction={onUpdateAction}
				onRemoveAction={onRemoveAction}
			/>
		));
	};

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<span className={styles.heading}>Connections</span>
				<button
					type="button"
					className={styles.addButton}
					onClick={handleAdd}
					disabled={!canAdd}
				>
					+ Add
				</button>
			</div>
			<div className={styles.list}>{renderList()}</div>
		</div>
	);
}
