'use client';

import { useRef } from 'react';
import { CopyCodeButton } from './copy-code-button.component';
import type { CodeBlockProps } from './code-block.types';

export function CodeBlock({ children, ...rest }: CodeBlockProps) {
	const preRef = useRef<HTMLPreElement>(null);

	return (
		<div className="code-block-wrapper">
			<pre ref={preRef} {...rest}>
				{children}
			</pre>
			<CopyCodeButton getTextAction={() => preRef.current?.textContent ?? ''} />
		</div>
	);
}
