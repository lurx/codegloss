'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import type { ImportDialogProps } from './import-dialog.types';
import { importConfig } from '../../helpers/import-config.helpers';
import styles from './import-dialog.module.scss';

type ImportStatus =
	| { kind: 'idle' }
	| { kind: 'error'; message: string };

const INITIAL_STATUS: ImportStatus = { kind: 'idle' };

export function ImportDialog({
	open,
	onCloseAction,
	onImportAction,
}: Readonly<ImportDialogProps>) {
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const [input, setInput] = useState('');
	const [status, setStatus] = useState<ImportStatus>(INITIAL_STATUS);

	useEffect(() => {
		const dialog = dialogRef.current;
		/* v8 ignore next -- ref is always set after first paint */
		if (!dialog) return;
		if (open && !dialog.open) {
			setInput('');
			setStatus(INITIAL_STATUS);
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	const handleChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) => {
			setInput(event.target.value);
			setStatus(INITIAL_STATUS);
		},
		[],
	);

	const handleImport = useCallback(() => {
		const result = importConfig(input);
		if (result.ok) {
			onImportAction(result.config);
			onCloseAction();
		} else {
			setStatus({ kind: 'error', message: result.error });
		}
	}, [input, onImportAction, onCloseAction]);

	/* v8 ignore start -- onCancel fires on native ESC, not simulable in happy-dom */
	const handleCancel = useCallback(
		(event: SyntheticEvent<HTMLDialogElement>) => {
			event.preventDefault();
			onCloseAction();
		},
		[onCloseAction],
	);
	/* v8 ignore stop */

	const renderStatus = () => {
		if (status.kind === 'error') {
			return <span className={styles.error}>{status.message}</span>;
		}
		return <span />;
	};

	return (
		<dialog
			ref={dialogRef}
			className={styles.dialog}
			onCancel={handleCancel}
			onClose={onCloseAction}
		>
			<div className={styles.header}>
				<h2 className={styles.heading}>Import</h2>
				<p className={styles.hint}>
					Paste JSON, MDX (sandbox + annotations), or a &lt;CodeGloss/&gt;
					element
				</p>
			</div>
			<textarea
				className={styles.textArea}
				value={input}
				onChange={handleChange}
				placeholder={'{\n  "code": "...",\n  "lang": "js",\n  ...\n}'}
				spellCheck={false}
			/>
			<div className={styles.footer}>
				{renderStatus()}
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.cancelButton}
						onClick={onCloseAction}
					>
						Cancel
					</button>
					<button
						type="button"
						className={styles.importButton}
						onClick={handleImport}
						disabled={input.trim() === ''}
					>
						Import
					</button>
				</div>
			</div>
		</dialog>
	);
}
