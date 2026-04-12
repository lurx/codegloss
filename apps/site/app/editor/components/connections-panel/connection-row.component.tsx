'use client';

import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { Connection } from 'codegloss/react';
import type { ConnectionRowProps } from './connections-panel.types';
import styles from './connections-panel.module.scss';

export function ConnectionRow({
	index,
	value,
	annotations,
	onUpdateAction,
	onRemoveAction,
}: Readonly<ConnectionRowProps>) {
	const updateField = useCallback(
		<K extends keyof Connection>(key: K, next: Connection[K]) =>
			onUpdateAction(index, { ...value, [key]: next }),
		[index, value, onUpdateAction],
	);

	const handleFrom = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => updateField('from', e.target.value),
		[updateField],
	);
	const handleTo = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => updateField('to', e.target.value),
		[updateField],
	);
	const handleColor = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => updateField('color', e.target.value),
		[updateField],
	);
	const handleSide = useCallback(
		(e: ChangeEvent<HTMLSelectElement>) => {
			const v = e.target.value;
			updateField('side', v === 'right' ? 'right' : 'left');
		},
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
	const handleDefaultOpen = useCallback(
		(e: ChangeEvent<HTMLInputElement>) =>
			updateField('defaultOpen', e.target.checked),
		[updateField],
	);
	const handleRemove = useCallback(
		() => onRemoveAction(index),
		[index, onRemoveAction],
	);

	const renderAnnotationOptions = () =>
		annotations.map((a) => (
			<option key={a.id} value={a.id}>
				{a.id} — {a.token || '(no token)'}
			</option>
		));

	return (
		<div className={styles.row}>
			<div className={styles.grid3}>
				<select
					className={styles.select}
					value={value.from}
					onChange={handleFrom}
					aria-label="From annotation"
				>
					{renderAnnotationOptions()}
				</select>
				<select
					className={styles.select}
					value={value.to}
					onChange={handleTo}
					aria-label="To annotation"
				>
					{renderAnnotationOptions()}
				</select>
				<button
					type="button"
					className={styles.removeButton}
					onClick={handleRemove}
					aria-label="Remove connection"
				>
					×
				</button>
			</div>
			<div className={styles.rowHeader}>
				<input
					className={styles.colorInput}
					type="color"
					value={value.color}
					onChange={handleColor}
					aria-label="Color"
				/>
				<select
					className={styles.select}
					value={value.side ?? 'left'}
					onChange={handleSide}
					aria-label="Side"
				>
					<option value="left">left</option>
					<option value="right">right</option>
				</select>
			</div>
			<input
				className={styles.input}
				value={value.title ?? ''}
				onChange={handleTitle}
				placeholder="title (optional)"
				aria-label="Title"
			/>
			<textarea
				className={styles.textArea}
				value={value.text ?? ''}
				onChange={handleText}
				placeholder="text (optional — required for arc click)"
				aria-label="Text"
			/>
			<div className={styles.toggleRow}>
				<label>
					<input
						type="checkbox"
						checked={value.defaultOpen ?? false}
						onChange={handleDefaultOpen}
					/>{' '}
					defaultOpen
				</label>
			</div>
		</div>
	);
}
