'use client';

import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import type { BundledLanguage, BundledTheme } from 'shiki';
import type { HighlightedCodeProps } from './highlighted-code.types';
import { useCodeglossTheme } from '../../hooks/use-codegloss-theme';
import styles from './highlighted-code.module.scss';

export function HighlightedCode({
	code,
	lang,
	className,
}: Readonly<HighlightedCodeProps>) {
	const theme = useCodeglossTheme();
	const [html, setHtml] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		codeToHtml(code, {
			lang: lang as BundledLanguage,
			theme: theme as BundledTheme,
		})
			.then(result => {
				if (!cancelled) setHtml(result);
			})
			.catch(() => {
				if (!cancelled) setHtml(null);
			});
		return () => {
			cancelled = true;
		};
	}, [code, lang, theme]);

	const rootClass = className ? `${styles.root} ${className}` : styles.root;

	if (html === null) {
		return <pre className={styles.fallback}>{code}</pre>;
	}

	return (
		<div
			className={rootClass}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
