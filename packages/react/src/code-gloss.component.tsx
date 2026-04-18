import React from 'react';
import type { CodeGlossProps } from './code-gloss.types';

export function CodeGloss(props: CodeGlossProps): React.ReactElement {
	const { theme, highlight, ...rest } = props;
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

	return React.createElement(
		'code-gloss',
		theme ? { theme } : undefined,
		React.createElement('script', {
			type: 'application/json',
			dangerouslySetInnerHTML: { __html: json },
		}),
	);
}
