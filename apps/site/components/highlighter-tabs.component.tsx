'use client';

import { useCallback, useState, type MouseEvent } from 'react';
import { useSiteTheme } from '@/hooks';
import { CopyableBlock } from './copyable-block.component';
import { InstallTabs } from './install-tabs.component';
import highlightedHtml from './usage-tabs-html.generated.json';
import type { HighlightedHtmlMap } from './highlighted-html.types';
import { HIGHLIGHTER_TABS } from './highlighter-tabs.data';
import { TAB_CONTENT_STYLE } from './usage-tabs.constants';
import { renderInlineCode } from './render-inline-code.helpers';

const htmlData = highlightedHtml as HighlightedHtmlMap;

export function HighlighterTabs() {
	const [active, setActive] = useState(0);
	const siteTheme = useSiteTheme();

	const handleSelect = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		const index = Number(event.currentTarget.dataset.index);
		setActive(index);
	}, []);

	const tab = HIGHLIGHTER_TABS[active]!;

	return (
		<div className="mdx-tabs">
			<div className="mdx-tabs-bar">
				{HIGHLIGHTER_TABS.map((t, i) => (
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
				<p style={TAB_CONTENT_STYLE}>{renderInlineCode(tab.content)}</p>
				{tab.install ? <InstallTabs packages={tab.install} /> : null}
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
