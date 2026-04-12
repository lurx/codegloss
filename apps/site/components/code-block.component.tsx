'use client';

import { useRef, type ReactNode } from 'react';
import { CopyCodeButton } from './copy-code-button.component';

type CodeBlockProps = {
	children: ReactNode;
	className?: string;
};

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
