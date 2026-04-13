import React from 'react';
import type { CodeGlossProps } from './code-gloss.types';

export function CodeGloss(props: CodeGlossProps): React.ReactElement {
	const { theme, ...configProps } = props;
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
