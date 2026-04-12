'use client';

import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { SettingsPanelProps } from './settings-panel.types';
import { AUTO_THEME_VALUE, THEME_OPTIONS } from './settings-panel.constants';
import {
	parseOptionalNumber,
	patchArcs,
	patchCallouts,
} from './settings-panel.helpers';
import styles from './settings-panel.module.scss';

export function SettingsPanel({
	config,
	onPatchAction,
}: Readonly<SettingsPanelProps>) {
	const arcs = config.arcs ?? {};
	const callouts = config.callouts ?? {};

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
		<div className={styles.root}>
			<div className={styles.header}>
				<span className={styles.heading}>Settings</span>
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
		</div>
	);
}
