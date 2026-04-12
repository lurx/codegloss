'use client';

import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { Annotation } from 'codegloss/react';
import type { AnnotationRowProps } from './annotations-panel.types';
import { IssueList } from '../issue-list';
import styles from './annotations-panel.module.scss';

function parseIntSafe(value: string): number {
	const n = Number.parseInt(value, 10);
	return Number.isFinite(n) ? n : 0;
}

export function AnnotationRow({
	index,
	value,
	issues,
	onUpdateAction,
	onRemoveAction,
}: Readonly<AnnotationRowProps>) {
	const updateField = useCallback(
		<K extends keyof Annotation>(key: K, next: Annotation[K]) =>
			onUpdateAction(index, { ...value, [key]: next }),
		[index, value, onUpdateAction],
	);

	const handleId = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => updateField('id', e.target.value),
		[updateField],
	);
	const handleToken = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => updateField('token', e.target.value),
		[updateField],
	);
	const handleLine = useCallback(
		(e: ChangeEvent<HTMLInputElement>) =>
			updateField('line', parseIntSafe(e.target.value)),
		[updateField],
	);
	const handleOccurrence = useCallback(
		(e: ChangeEvent<HTMLInputElement>) =>
			updateField('occurrence', parseIntSafe(e.target.value)),
		[updateField],
	);
	const handleTitle = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => updateField('title', e.target.value),
		[updateField],
	);
	const handleText = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) =>
			updateField('text', e.target.value),
		[updateField],
	);
	const handlePopover = useCallback(
		(e: ChangeEvent<HTMLInputElement>) =>
			updateField('popover', e.target.checked),
		[updateField],
	);
	const handleDefaultOpen = useCallback(
		(e: ChangeEvent<HTMLInputElement>) =>
			updateField('defaultOpen', e.target.checked),
		[updateField],
	);
	const handleRemove = useCallback(
		() => onRemoveAction(index),
		[index, onRemoveAction],
	);

	return (
		<div className={styles.row}>
			<div className={styles.rowHeader}>
				<input
					className={`${styles.input} ${styles.idInput}`}
					value={value.id}
					onChange={handleId}
					placeholder="id"
					aria-label="Annotation id"
				/>
				<input
					className={`${styles.input} ${styles.grow}`}
					value={value.token}
					onChange={handleToken}
					placeholder="token"
					aria-label="Token"
				/>
				<button
					type="button"
					className={styles.removeButton}
					onClick={handleRemove}
					aria-label="Remove annotation"
				>
					×
				</button>
			</div>
			<div className={styles.grid2}>
				<input
					className={styles.input}
					type="number"
					value={value.line}
					onChange={handleLine}
					placeholder="line"
					aria-label="Line"
				/>
				<input
					className={styles.input}
					type="number"
					value={value.occurrence}
					onChange={handleOccurrence}
					placeholder="occurrence"
					aria-label="Occurrence"
				/>
			</div>
			<input
				className={styles.input}
				value={value.title}
				onChange={handleTitle}
				placeholder="title"
				aria-label="Title"
			/>
			<textarea
				className={styles.textArea}
				value={value.text}
				onChange={handleText}
				placeholder="text"
				aria-label="Text"
			/>
			<div className={styles.toggleRow}>
				<label>
					<input
						type="checkbox"
						checked={value.popover ?? false}
						onChange={handlePopover}
					/>{' '}
					popover
				</label>
				<label>
					<input
						type="checkbox"
						checked={value.defaultOpen ?? false}
						onChange={handleDefaultOpen}
					/>{' '}
					defaultOpen
				</label>
			</div>
			<IssueList issues={issues} />
		</div>
	);
}
