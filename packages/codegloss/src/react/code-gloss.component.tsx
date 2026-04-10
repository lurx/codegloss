import type { JSX } from 'react';
import type { CodeGlossConfig } from '../core/code-gloss.types';

declare module 'react' {
	namespace JSX {
		type IntrinsicElements = {
			'code-gloss': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
		};
	}
}

export type CodeGlossProps = CodeGlossConfig;

export function CodeGloss(props: CodeGlossProps): JSX.Element {
	const json = JSON.stringify(props);

	return (
		<code-gloss>
			<script
				type="application/json"
				dangerouslySetInnerHTML={{ __html: json }}
			/>
		</code-gloss>
	);
}
