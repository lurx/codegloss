'use client';

import { CodeGloss } from '@codegloss/react';
import { useMemo } from 'react';
import styles from './preview-pane.module.scss';
import type { PreviewPaneProps } from './preview-pane.types';

export function PreviewPane({ config }: Readonly<PreviewPaneProps>) {
	const remountKey = useMemo(() => JSON.stringify(config), [config]);

	return (
		<div className={styles.root}>
			<h2 className={styles.heading}>Preview</h2>
			<CodeGloss
				key={remountKey}
				code={config.code}
				lang={config.lang}
				filename={config.filename}
				annotations={config.annotations}
				connections={config.connections}
				arcs={config.arcs}
				callouts={config.callouts}
			/>
		</div>
	);
}
