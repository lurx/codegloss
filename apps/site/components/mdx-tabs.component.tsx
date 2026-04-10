'use client';

import { useState, type ReactNode } from 'react';

type TabItem = {
	label: string;
	children: ReactNode;
};

type MdxTabsProps = {
	items: TabItem[];
};

export function MdxTabs({ items }: MdxTabsProps) {
	const [active, setActive] = useState(0);

	return (
		<div className="mdx-tabs">
			<div className="mdx-tabs-bar">
				{items.map((item, i) => (
					<button
						key={item.label}
						type="button"
						className={`mdx-tabs-trigger${i === active ? ' mdx-tabs-trigger-active' : ''}`}
						onClick={() => setActive(i)}
					>
						{item.label}
					</button>
				))}
			</div>
			<div className="mdx-tabs-panel">{items[active].children}</div>
		</div>
	);
}
