'use client';

import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { useSiteTheme } from '@/hooks';
import { CopyCodeButton } from './copy-code-button.component';
import highlightedHtml from './usage-tabs-html.generated.json';
import type {
	CopyableBlockProps,
	HighlightedHtmlMap,
} from './usage-tabs.types';
import { TABS } from './usage-tabs.data';
import {
	BLOCK_LABEL_STYLE,
	BLOCK_WRAPPER_STYLE,
	TAB_CONTENT_STYLE,
} from './usage-tabs.constants';

const htmlData = highlightedHtml as HighlightedHtmlMap;

function CopyableBlock({ html, label }: CopyableBlockProps) {
	const codeRef = useRef<HTMLDivElement>(null);

	const getText = useCallback(() => codeRef.current?.textContent ?? '', []);

	const renderLabel = () => {
		if (!label) return null;
		return <div style={BLOCK_LABEL_STYLE}>{label}</div>;
	};

	return (
		<div style={BLOCK_WRAPPER_STYLE}>
			{renderLabel()}
			<div className="code-block-wrapper">
				<div
					ref={codeRef}
					className="usage-code-block"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
				<CopyCodeButton getTextAction={getText} />
			</div>
		</div>
	);
}

export function UsageTabs() {
	const [active, setActive] = useState(0);
	const siteTheme = useSiteTheme();

	const handleSelect = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		const index = Number(event.currentTarget.dataset.index);
		setActive(index);
	}, []);

	const tab = TABS[active];

	return (
		<div className="mdx-tabs">
			<div className="mdx-tabs-bar">
				{TABS.map((t, i) => (
					<button
						key={t.label}
						type="button"
						data-index={i}
						className={`mdx-tabs-trigger${i === active ? ' mdx-tabs-trigger-active' : ''}`}
						onClick={handleSelect}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="mdx-tabs-panel">
				<p style={TAB_CONTENT_STYLE}>{tab.content}</p>
				{tab.blocks.map(block => (
					<CopyableBlock
						key={block.htmlKey}
						html={htmlData[block.htmlKey]?.[siteTheme] ?? ''}
						label={tab.blocks.length > 1 ? block.label : undefined}
					/>
				))}
			</div>
		</div>
	);
}
