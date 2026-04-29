'use client';

import { useRef, useCallback } from 'react';
import { useSiteTheme } from '@/hooks';
import { CopyCodeButton } from './copy-code-button.component';
import highlightedHtml from './homepage-snippets-html.generated.json';
import type { HighlightedHtmlMap } from './highlighted-html.types';
import type { HighlightedBlockProps, Step } from './quick-start.types';

const htmlData = highlightedHtml as HighlightedHtmlMap;

const STEPS = [
	{ num: '1', label: 'Install', snippetKey: 'install' },
	{ num: '2', label: 'Configure your MDX pipeline', snippetKey: 'config' },
	{ num: '3', label: 'Write annotated code in MDX', snippetKey: 'mdx' },
] as const satisfies readonly Step[];

function HighlightedBlock({ html }: HighlightedBlockProps) {
	const codeRef = useRef<HTMLDivElement>(null);

	const getText = useCallback(() => codeRef.current?.textContent ?? '', []);

	return (
		<div className="code-block-wrapper">
			<div
				ref={codeRef}
				className="usage-code-block"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
			<CopyCodeButton getTextAction={getText} />
		</div>
	);
}

export function QuickStart() {
	const siteTheme = useSiteTheme();

	return (
		<section className="quickstart fade-in fade-in-delay-3">
			<h2>Quick start</h2>
			{STEPS.map(step => (
				<div
					key={step.num}
					className="step"
				>
					<span className="step-num">{step.num}</span>
					<div className="step-content">
						<div className="step-label">{step.label}</div>
						<HighlightedBlock
							html={htmlData[step.snippetKey]?.[siteTheme] ?? ''}
						/>
					</div>
				</div>
			))}
		</section>
	);
}
