'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import type { SettingsDialogProps } from './settings-dialog.types';
import { AUTO_THEME_VALUE, THEME_OPTIONS } from './settings-dialog.constants';
import {
	parseOptionalNumber,
	patchArcs,
	patchCallouts,
} from './settings-dialog.helpers';
import styles from './settings-dialog.module.scss';

export function SettingsDialog({
	open,
	config,
	onCloseAction,
	onPatchAction,
}: Readonly<SettingsDialogProps>) {
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const arcs = config.arcs ?? {};
	const callouts = config.callouts ?? {};

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	}, [open]);

	const handleCancel = useCallback(
		(event: SyntheticEvent<HTMLDialogElement>) => {
			event.preventDefault();
			onCloseAction();
		},
		[onCloseAction],
	);

	const handleTheme = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const next = event.target.value;
			onPatchAction({ theme: next === AUTO_THEME_VALUE ? undefined : next });
		},
		[onPatchAction],
	);

	const handleArcNumber = useCallback(
		(key: 'dotRadius' | 'dotOpacity' | 'strokeWidth' | 'opacity') =>
			(event: ChangeEvent<HTMLInputElement>) => {
				onPatchAction({
					arcs: patchArcs(config.arcs, {
						[key]: parseOptionalNumber(event.target.value),
					}),
				});
			},
		[config.arcs, onPatchAction],
	);

	const handleDashArray = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onPatchAction({
				arcs: patchArcs(config.arcs, {
					strokeDasharray: event.target.value || undefined,
				}),
			});
		},
		[config.arcs, onPatchAction],
	);

	const handleArrowhead = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onPatchAction({
				arcs: patchArcs(config.arcs, {
					arrowhead: event.target.checked ? true : undefined,
				}),
			});
		},
		[config.arcs, onPatchAction],
	);

	const handlePopover = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onPatchAction({
				callouts: patchCallouts(config.callouts, {
					popover: event.target.checked ? true : undefined,
				}),
			});
		},
		[config.callouts, onPatchAction],
	);

	const renderThemeOptions = () =>
		THEME_OPTIONS.map((option) => (
			<option key={option.value} value={option.value}>
				{option.label}
			</option>
		));

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			onCancel={handleCancel}
			onClose={onCloseAction}
		>
			<div className={styles.header}>
				<h2 className={styles.heading}>Settings</h2>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>Theme</span>
				<select
					className={styles.select}
					value={config.theme ?? AUTO_THEME_VALUE}
					onChange={handleTheme}
					aria-label="Theme"
				>
					{renderThemeOptions()}
				</select>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>Arcs</span>
				<div className={styles.grid2}>
					<label className={styles.field}>
						dotRadius
						<input
							className={styles.input}
							type="number"
							step="0.5"
							value={arcs.dotRadius ?? ''}
							onChange={handleArcNumber('dotRadius')}
						/>
					</label>
					<label className={styles.field}>
						dotOpacity
						<input
							className={styles.input}
							type="number"
							step="0.05"
							min="0"
							max="1"
							value={arcs.dotOpacity ?? ''}
							onChange={handleArcNumber('dotOpacity')}
						/>
					</label>
					<label className={styles.field}>
						strokeWidth
						<input
							className={styles.input}
							type="number"
							step="0.5"
							value={arcs.strokeWidth ?? ''}
							onChange={handleArcNumber('strokeWidth')}
						/>
					</label>
					<label className={styles.field}>
						opacity
						<input
							className={styles.input}
							type="number"
							step="0.05"
							min="0"
							max="1"
							value={arcs.opacity ?? ''}
							onChange={handleArcNumber('opacity')}
						/>
					</label>
				</div>
				<label className={styles.field}>
					strokeDasharray
					<input
						className={styles.input}
						value={arcs.strokeDasharray ?? ''}
						onChange={handleDashArray}
						placeholder="e.g. 4 2"
					/>
				</label>
				<label className={styles.toggleRow}>
					<input
						type="checkbox"
						checked={arcs.arrowhead ?? false}
						onChange={handleArrowhead}
					/>{' '}
					arrowhead
				</label>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionTitle}>Callouts</span>
				<label className={styles.toggleRow}>
					<input
						type="checkbox"
						checked={callouts.popover ?? false}
						onChange={handlePopover}
					/>{' '}
					popover by default
				</label>
			</div>

			<div className={styles.footer}>
				<button
					type="button"
					className={styles.doneButton}
					onClick={onCloseAction}
				>
					Done
				</button>
			</div>
		</dialog>
	);
}
