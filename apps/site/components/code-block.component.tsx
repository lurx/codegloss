'use client';

import { useRef, useState, useCallback, type ReactNode } from 'react';

const COPY_ICON =
	'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

const CHECK_ICON =
	'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

type CodeBlockProps = {
	children: ReactNode;
	className?: string;
};

export function CodeBlock({ children, ...rest }: CodeBlockProps) {
	const preRef = useRef<HTMLPreElement>(null);
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		const text = preRef.current?.textContent ?? '';
		void navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, []);

	return (
		<div className="code-block-wrapper">
			<pre ref={preRef} {...rest}>
				{children}
			</pre>
			<button
				type="button"
				className="code-block-copy"
				onClick={handleCopy}
				aria-label={copied ? 'Copied' : 'Copy code'}
				title={copied ? 'Copied!' : 'Copy code'}
				dangerouslySetInnerHTML={{
					__html: copied ? CHECK_ICON : COPY_ICON,
				}}
			/>
		</div>
	);
}

export { COPY_ICON, CHECK_ICON };
