'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ExportPanelProps } from './export-panel.types';
import { serializeConfig } from './export-panel.helpers';
import styles from './export-panel.module.scss';

const COPIED_RESET_MS = 1200;

export function ExportPanel({ config }: Readonly<ExportPanelProps>) {
	const [copied, setCopied] = useState(false);

	const json = useMemo(() => serializeConfig(config), [config]);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(json);
			setCopied(true);
			window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
		} catch {
			setCopied(false);
		}
	}, [json]);

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<span className={styles.heading}>Export (JSON)</span>
				<button
					type="button"
					className={styles.copyButton}
					onClick={handleCopy}
				>
					{copied ? 'Copied' : 'Copy'}
				</button>
			</div>
			<pre className={styles.output}>{json}</pre>
		</div>
	);
}
