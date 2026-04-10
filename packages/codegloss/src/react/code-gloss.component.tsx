import React from 'react';
import type { CodeGlossConfig } from '../core/code-gloss.types';

export type CodeGlossProps = CodeGlossConfig;

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
