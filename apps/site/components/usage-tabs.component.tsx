'use client';

import { useState, useRef, useCallback } from 'react';
import { useSiteTheme } from '@/hooks/use-site-theme.hook';
import { CopyCodeButton } from './copy-code-button.component';
import highlightedHtml from './usage-tabs-html.generated.json';

type CodeBlockEntry = {
	/** Key in the generated JSON */
	htmlKey: string;
	/** Optional label shown above the block */
	label?: string;
};

type Tab = {
	label: string;
	content: string;
	blocks: CodeBlockEntry[];
};

const TABS: Tab[] = [
	{
		label: 'MDX / Remark',
		content:
			'Use fenced code blocks with a sandbox tag. The remark plugin detects them and emits CodeGloss components at build time.',
		blocks: [
			{ htmlKey: 'MDX / Remark — Setup', label: 'Setup' },
			{ htmlKey: 'MDX / Remark — Markdown', label: 'Markdown' },
		],
	},
	{
		label: 'React',
		content:
			'Import the wrapper and pass props. Works with React 16.14+. The React wrapper is a thin JSX adapter — zero React APIs beyond JSX itself.',
		blocks: [{ htmlKey: 'React' }],
	},
	{
		label: 'Vue',
		content: 'Import the Vue 3 wrapper component.',
		blocks: [{ htmlKey: 'Vue' }],
	},
	{
		label: 'Svelte',
		content: 'Import the Svelte wrapper component.',
		blocks: [{ htmlKey: 'Svelte' }],
	},
	{
		label: 'Vanilla HTML',
		content:
			'Drop a <script> tag and a <code-gloss> custom element with a JSON config child. Works in plain HTML pages, Hugo, Eleventy, Jekyll — anywhere you can drop a <script> tag.',
		blocks: [{ htmlKey: 'Vanilla HTML' }],
	},
];

const htmlData = highlightedHtml as Record<
	string,
	Record<string, string>
>;

function CopyableBlock({
	html,
	label,
}: {
	html: string;
	label?: string;
}) {
	const codeRef = useRef<HTMLDivElement>(null);

	const getText = useCallback(() => codeRef.current?.textContent ?? '', []);

	return (
		<div style={{ marginBottom: '0.75rem' }}>
			{label && (
				<div
					style={{
						fontSize: '0.6875rem',
						fontWeight: 600,
						textTransform: 'uppercase',
						letterSpacing: '0.06em',
						color: 'var(--site-muted)',
						marginBottom: '0.375rem',
					}}
				>
					{label}
				</div>
			)}
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
	const tab = TABS[active];
	const variant = siteTheme === 'dark' ? 'dark' : 'light';

	return (
		<div className="mdx-tabs">
			<div className="mdx-tabs-bar">
				{TABS.map((t, i) => (
					<button
						key={t.label}
						type="button"
						className={`mdx-tabs-trigger${i === active ? ' mdx-tabs-trigger-active' : ''}`}
						onClick={() => setActive(i)}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="mdx-tabs-panel">
				<p
					style={{
						color: 'var(--site-fg)',
						lineHeight: 1.72,
						fontSize: '0.9375rem',
						marginBottom: '1rem',
					}}
				>
					{tab.content}
				</p>
				{tab.blocks.map(block => (
					<CopyableBlock
						key={block.htmlKey}
						html={htmlData[block.htmlKey]?.[variant] ?? ''}
						label={tab.blocks.length > 1 ? block.label : undefined}
					/>
				))}
			</div>
		</div>
	);
}
