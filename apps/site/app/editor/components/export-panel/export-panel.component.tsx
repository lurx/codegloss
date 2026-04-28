'use client';

import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ExportPanelProps } from './export-panel.types';
import type { ExportFormat } from './export-panel.constants';
import { EXPORT_FORMATS } from './export-panel.constants';
import { HighlightedCode } from '../highlighted-code';
import styles from './export-panel.module.scss';

const COPIED_RESET_MS = 1200;
const DATA_FORMAT = 'data-format';

function isExportFormat(value: string | null): value is ExportFormat {
	return value === 'json' || value === 'mdx' || value === 'jsx';
}

export function ExportPanel({ config }: Readonly<ExportPanelProps>) {
	const [active, setActive] = useState<ExportFormat>('json');
	const [copied, setCopied] = useState(false);

	const activeEntry = EXPORT_FORMATS.find(f => f.id === active);
	const activeLang = activeEntry?.lang ?? 'json';
	const output = useMemo(
		() => (activeEntry ? activeEntry.render(config) : ''),
		[activeEntry, config],
	);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(output);
			setCopied(true);
			window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
		} catch {
			setCopied(false);
		}
	}, [output]);

	const handleTabsClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
		const target = (event.target as HTMLElement).closest(`[${DATA_FORMAT}]`);
		if (!target) return;
		const format = target.getAttribute(DATA_FORMAT);
		if (isExportFormat(format)) {
			setActive(format);
			setCopied(false);
		}
	}, []);

	const renderTabs = () =>
		EXPORT_FORMATS.map(format => {
			const isActive = format.id === active;
			const attrs = { [DATA_FORMAT]: format.id };
			return (
				<button
					key={format.id}
					type="button"
					className={isActive ? styles.tabActive : styles.tab}
					aria-pressed={isActive}
					{...attrs}
				>
					{format.label}
				</button>
			);
		});

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<div
					className={styles.tabs}
					onClick={handleTabsClick}
				>
					{renderTabs()}
				</div>
				<button
					type="button"
					className={styles.copyButton}
					onClick={handleCopy}
				>
					{copied ? (
						<>
							<Check
								size={14}
								aria-hidden="true"
							/>{' '}
							Copied
						</>
					) : (
						<>
							<Copy
								size={14}
								aria-hidden="true"
							/>{' '}
							Copy
						</>
					)}
				</button>
			</div>
			<HighlightedCode
				code={output}
				lang={activeLang}
			/>
		</div>
	);
}
