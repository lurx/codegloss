import React from 'react';
import { styleOverridesToCssVars } from 'codegloss';
import type { CodeGlossProps } from './code-gloss.types';

export function CodeGloss(props: CodeGlossProps): React.ReactElement {
	const { theme, highlight, styleOverrides, ...rest } = props;
	let configProps = rest;

	if (highlight && rest.highlightedHtml === undefined) {
		const result = highlight(rest.code, rest.lang);
		configProps =
			typeof result === 'string'
				? { ...rest, highlightedHtml: result }
				: {
						...rest,
						highlightedHtml: result.html,
						...(result.background
							? { highlightBackground: result.background }
							: {}),
						...(result.color ? { highlightColor: result.color } : {}),
					};
	}

	const json = JSON.stringify(configProps);
	const styleVars = styleOverridesToCssVars(styleOverrides);
	const styleProp =
		styleVars.length > 0
			? (Object.fromEntries(styleVars) as React.CSSProperties)
			: undefined;

	const hostProps: Record<string, unknown> = {};
	if (theme) hostProps.theme = theme;
	if (styleProp) hostProps.style = styleProp;

	return React.createElement(
		'code-gloss',
		Object.keys(hostProps).length > 0 ? hostProps : undefined,
		React.createElement('script', {
			type: 'application/json',
			dangerouslySetInnerHTML: { __html: json },
		}),
	);
}
