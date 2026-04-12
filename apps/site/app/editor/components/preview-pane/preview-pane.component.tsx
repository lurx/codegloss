'use client';

import { useMemo } from 'react';
import { CodeGloss } from 'codegloss/react';
import type { PreviewPaneProps } from './preview-pane.types';
import { useCodeglossTheme } from '../../hooks/use-codegloss-theme';
import styles from './preview-pane.module.scss';

export function PreviewPane({ config }: Readonly<PreviewPaneProps>) {
	const siteTheme = useCodeglossTheme();
	const theme = config.theme || siteTheme;

	const remountKey = useMemo(
		() => JSON.stringify({ ...config, theme }),
		[config, theme],
	);

	return (
		<div className={styles.root}>
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
