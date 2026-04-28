'use client';

import { useCallback, useMemo, useRef, useState, type MouseEvent } from 'react';
import * as runtime from 'react/jsx-runtime';
import { CodeGloss } from '@codegloss/react';
import type { CodeGlossProps } from '@codegloss/react';
import { ThemeShowcase } from './theme-showcase.component';
import { MdxTabs } from './mdx-tabs.component';
import { UsageTabs } from './usage-tabs.component';
import { HighlighterTabs } from './highlighter-tabs.component';
import { InstallTabs } from './install-tabs.component';
import { DocLink } from './doc-link.component';
import { useCopyHeadingAnchors } from '@/hooks';
import type {
	CodeGlossTab,
	CompiledMdxFactory,
	MdxContentProps,
} from './mdx-content.types';
import { SOURCE_PRE_STYLE } from './mdx-content.constants';
import { buildSourceFence } from './mdx-content.helpers';

const MDX_COMPONENTS = {
	CodeGloss: CodeGlossWithTabs,
	ThemeShowcase,
	MdxTabs,
	UsageTabs,
	HighlighterTabs,
	InstallTabs,
	a: DocLink,
};

function CodeGlossWithTabs(props: CodeGlossProps) {
	const [tab, setTab] = useState<CodeGlossTab>('sandbox');

	const source = useMemo(() => buildSourceFence(props), [props]);

	const handleSelectTab = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			setTab(event.currentTarget.dataset.tab as CodeGlossTab);
		},
		[],
	);

	const renderContent = () => {
		if (tab === 'sandbox') {
			return <CodeGloss {...props} />;
		}
		return (
			<pre style={SOURCE_PRE_STYLE}>
				<code>{source}</code>
			</pre>
		);
	};

	return (
		<div>
			<div className="tabs">
				<button
					type="button"
					className="tab-btn"
					data-tab="sandbox"
					data-active={tab === 'sandbox'}
					onClick={handleSelectTab}
				>
					Sandbox
				</button>
				<button
					type="button"
					className="tab-btn"
					data-tab="source"
					data-active={tab === 'source'}
					onClick={handleSelectTab}
				>
					Source (MD+JSON)
				</button>
			</div>
			{renderContent()}
		</div>
	);
}

function useMDXComponent(code: string) {
	return useMemo(() => {
		const factory = new Function(code) as CompiledMdxFactory;
		return factory({ ...runtime }).default;
	}, [code]);
}

export function MdxContent({ code }: MdxContentProps) {
	const Component = useMDXComponent(code);
	const proseRef = useRef<HTMLDivElement>(null);

	useCopyHeadingAnchors(proseRef);

	return (
		<div
			ref={proseRef}
			className="prose"
		>
			<Component components={MDX_COMPONENTS} />
		</div>
	);
}
