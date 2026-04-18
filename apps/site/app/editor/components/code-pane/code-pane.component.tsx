'use client';

import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import type { CodePaneProps } from './code-pane.types';
import styles from './code-pane.module.scss';

export function CodePane({
	code,
	lang,
	filename,
	onCodeChangeAction,
	onLangChangeAction,
	onFilenameChangeAction,
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
			</div>
			<textarea
				className={styles.codeArea}
				value={code}
				onChange={handleCodeChange}
				spellCheck={false}
				aria-label="Code"
			/>
		</div>
	);
}
