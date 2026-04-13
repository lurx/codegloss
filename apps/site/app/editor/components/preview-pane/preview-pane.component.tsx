'use client';

import { CodeGloss } from '@codegloss/react';
import { useMemo } from 'react';
import { useCodeglossTheme } from '../../hooks/use-codegloss-theme';
import styles from './preview-pane.module.scss';
import type { PreviewPaneProps } from './preview-pane.types';

export function PreviewPane({ config }: Readonly<PreviewPaneProps>) {
	const siteTheme = useCodeglossTheme();
	const theme = config.theme || siteTheme;

	const remountKey = useMemo(
		() => JSON.stringify({ ...config, theme }),
		[config, theme],
	);

	return (
		<div className={styles.root}>
			<h2 className={styles.heading}>Preview</h2>
			<CodeGloss
				key={remountKey}
				code={config.code}
				lang={config.lang}
				filename={config.filename}
				runnable={config.runnable}
				annotations={config.annotations}
				connections={config.connections}
				arcs={config.arcs}
				callouts={config.callouts}
				theme={theme}
			/>
		</div>
	);
}
