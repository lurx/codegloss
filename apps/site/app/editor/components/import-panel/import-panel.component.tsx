'use client';

import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ImportPanelProps } from './import-panel.types';
import { importConfig } from '../../helpers/import-config.helpers';
import type { ImportFormat } from '../../helpers/import-config.types';
import styles from './import-panel.module.scss';

type ImportStatus =
	| { kind: 'idle' }
	| { kind: 'success'; format: ImportFormat }
	| { kind: 'error'; message: string };

const INITIAL_STATUS: ImportStatus = { kind: 'idle' };

export function ImportPanel({ onImportAction }: Readonly<ImportPanelProps>) {
	const [input, setInput] = useState('');
	const [status, setStatus] = useState<ImportStatus>(INITIAL_STATUS);

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
			setStatus({ kind: 'success', format: result.format });
		} else {
			setStatus({ kind: 'error', message: result.error });
		}
	}, [input, onImportAction]);

	const renderStatus = () => {
		if (status.kind === 'success') {
			return (
				<span className={styles.success}>
					Imported as {status.format.toUpperCase()}
				</span>
			);
		}
		if (status.kind === 'error') {
			return <span className={styles.error}>{status.message}</span>;
		}
		return null;
	};

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<span className={styles.heading}>Import</span>
				<span className={styles.hint}>
					Paste JSON, MDX (sandbox + annotations), or a &lt;CodeGloss/&gt;
					element
				</span>
			</div>
			<textarea
				className={styles.textArea}
				value={input}
				onChange={handleChange}
				placeholder={'{\n  "code": "...",\n  "lang": "js",\n  ...\n}'}
				spellCheck={false}
			/>
			<div className={styles.actions}>
				<button
					type="button"
					className={styles.button}
					onClick={handleImport}
					disabled={input.trim() === ''}
				>
					Replace editor state
				</button>
				{renderStatus()}
			</div>
		</div>
	);
}
