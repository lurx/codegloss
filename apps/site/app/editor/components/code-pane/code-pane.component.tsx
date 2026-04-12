'use client';

import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { CodePaneProps } from './code-pane.types';
import styles from './code-pane.module.scss';

export function CodePane({
	code,
	lang,
	filename,
	runnable,
	onCodeChangeAction,
	onLangChangeAction,
	onFilenameChangeAction,
	onRunnableChangeAction,
}: Readonly<CodePaneProps>) {
	const handleCodeChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) =>
			onCodeChangeAction(event.target.value),
		[onCodeChangeAction],
	);
	const handleLangChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			onLangChangeAction(event.target.value),
		[onLangChangeAction],
	);
	const handleFilenameChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			onFilenameChangeAction(event.target.value),
		[onFilenameChangeAction],
	);
	const handleRunnableChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			onRunnableChangeAction(event.target.checked),
		[onRunnableChangeAction],
	);

	return (
		<div className={styles.root}>
			<div className={styles.fieldRow}>
				<label className={styles.field}>
					Language
					<input
						className={styles.input}
						value={lang}
						onChange={handleLangChange}
					/>
				</label>
				<label className={styles.field}>
					Filename
					<input
						className={styles.input}
						value={filename}
						onChange={handleFilenameChange}
					/>
				</label>
				<label className={styles.checkbox}>
					<input
						type="checkbox"
						checked={runnable}
						onChange={handleRunnableChange}
					/>
					Runnable
				</label>
			</div>
			<textarea
				className={styles.codeArea}
				value={code}
				onChange={handleCodeChange}
				spellCheck={false}
			/>
		</div>
	);
}
