'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { codeToTokens } from 'shiki';
import type { BundledLanguage, BundledTheme, ThemedToken } from 'shiki';
import type { CodePickerProps } from './code-picker.types';
import { computeOccurrence, isWhitespace } from './code-picker.helpers';
import styles from './code-picker.module.scss';

const DATA_LINE = 'data-line';
const DATA_TOKEN_INDEX = 'data-token-index';

export function CodePicker({
	code,
	lang,
	theme,
	onTokenPickAction,
}: Readonly<CodePickerProps>) {
	const [lines, setLines] = useState<ThemedToken[][] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setError(null);
		codeToTokens(code, {
			lang: lang as BundledLanguage,
			theme: theme as BundledTheme,
		})
			.then((result) => {
				if (!cancelled) setLines(result.tokens);
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					const message = err instanceof Error ? err.message : String(err);
					setError(message);
					setLines(null);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [code, lang, theme]);

	const handleClick = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			if (!lines) return;
			const target = (event.target as HTMLElement).closest(
				`[${DATA_TOKEN_INDEX}]`,
			);
			if (!target) return;
			const lineAttr = target.getAttribute(DATA_LINE);
			const indexAttr = target.getAttribute(DATA_TOKEN_INDEX);
			if (lineAttr === null || indexAttr === null) return;
			const line = Number.parseInt(lineAttr, 10);
			const tokenIndex = Number.parseInt(indexAttr, 10);
			const token = lines[line]?.[tokenIndex];
			if (!token) return;
			onTokenPickAction({
				token: token.content,
				line,
				occurrence: computeOccurrence(lines[line], tokenIndex),
			});
		},
		[lines, onTokenPickAction],
	);

	const renderToken = (
		token: ThemedToken,
		lineIndex: number,
		tokenIndex: number,
	) => {
		const style = { color: token.color };
		if (isWhitespace(token.content)) {
			return (
				<span
					key={`${lineIndex}-${tokenIndex}`}
					style={style}
				>
					{token.content}
				</span>
			);
		}
		const attrs = {
			[DATA_LINE]: lineIndex,
			[DATA_TOKEN_INDEX]: tokenIndex,
		};
		return (
			<span
				key={`${lineIndex}-${tokenIndex}`}
				className={styles.token}
				style={style}
				{...attrs}
			>
				{token.content}
			</span>
		);
	};

	const renderBody = () => {
		if (error) {
			return <div className={styles.error}>Highlight failed: {error}</div>;
		}
		if (!lines) {
			return <div className={styles.loading}>Loading highlight…</div>;
		}
		return lines.map((lineTokens, lineIndex) => (
			<div key={lineIndex} className={styles.line}>
				<span className={styles.lineNum}>{lineIndex}</span>
				<span>
					{lineTokens.length === 0
						? '\u00A0'
						: lineTokens.map((token, tokenIndex) =>
								renderToken(token, lineIndex, tokenIndex),
							)}
				</span>
			</div>
		));
	};

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<span className={styles.heading}>Token picker</span>
				<span className={styles.hint}>Click any token to annotate it</span>
			</div>
			<div onClick={handleClick}>{renderBody()}</div>
		</div>
	);
}
