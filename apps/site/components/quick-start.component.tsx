'use client';

import { useRef, useState, useCallback } from 'react';
import { useSiteTheme } from '@/hooks/use-site-theme.hook';
import { COPY_ICON, CHECK_ICON } from './code-block.component';
import highlightedHtml from './homepage-snippets-html.generated.json';

const htmlData = highlightedHtml as Record<
	string,
	Record<string, string>
>;

const STEPS = [
	{ num: '1', label: 'Install', snippetKey: 'install' },
	{ num: '2', label: 'Configure your MDX pipeline', snippetKey: 'config' },
	{ num: '3', label: 'Write annotated code in MDX', snippetKey: 'mdx' },
] as const;

function HighlightedBlock({ html }: { html: string }) {
	const codeRef = useRef<HTMLDivElement>(null);
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		const text = codeRef.current?.textContent ?? '';
		void navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, []);

	return (
		<div className="code-block-wrapper">
			<div
				ref={codeRef}
				className="usage-code-block"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
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

export function QuickStart() {
	const siteTheme = useSiteTheme();
	const variant = siteTheme === 'dark' ? 'dark' : 'light';

	return (
		<section className="quickstart fade-in fade-in-delay-3">
			<h2>Quick start</h2>
			{STEPS.map(step => (
				<div key={step.num} className="step">
					<span className="step-num">{step.num}</span>
					<div className="step-content">
						<div className="step-label">{step.label}</div>
						<HighlightedBlock
							html={htmlData[step.snippetKey]?.[variant] ?? ''}
						/>
					</div>
				</div>
			))}
		</section>
	);
}
