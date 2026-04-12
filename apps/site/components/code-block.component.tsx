'use client';

import { useCallback, useRef } from 'react';
import { CopyCodeButton } from './copy-code-button.component';
import type { CodeBlockProps } from './code-block.types';

export function CodeBlock({ children, className }: CodeBlockProps) {
	const preRef = useRef<HTMLPreElement>(null);

	const getText = useCallback(() => preRef.current?.textContent ?? '', []);

	return (
		<div className="code-block-wrapper">
			<pre ref={preRef} className={className}>
				{children}
			</pre>
			<CopyCodeButton getTextAction={getText} />
		</div>
	);
}
