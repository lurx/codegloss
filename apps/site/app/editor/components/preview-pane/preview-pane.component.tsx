'use client';

import { useMemo } from 'react';
import { CodeGloss } from 'codegloss/react';
import { useSiteTheme } from '@/hooks';
import codeglossConfig from '@/codegloss.config';
import type { PreviewPaneProps } from './preview-pane.types';
import styles from './preview-pane.module.scss';

const LIGHT_THEME = String(codeglossConfig.theme ?? '');
const DARK_THEME = String(
	codeglossConfig.darkTheme ?? codeglossConfig.theme ?? '',
);

export function PreviewPane({ config }: Readonly<PreviewPaneProps>) {
	const siteTheme = useSiteTheme();
	const theme = siteTheme === 'dark' ? DARK_THEME : LIGHT_THEME;

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
				theme={theme}
			/>
		</div>
	);
}
