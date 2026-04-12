'use client';

import { useCallback, useState, type MouseEvent } from 'react';
import type { MdxTabsProps } from './mdx-tabs.types';

export function MdxTabs({ items }: MdxTabsProps) {
	const [active, setActive] = useState(0);

	const handleSelect = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		const index = Number(event.currentTarget.dataset.index);
		setActive(index);
	}, []);

	return (
		<div className="mdx-tabs">
			<div className="mdx-tabs-bar">
				{items.map((item, i) => (
					<button
						key={item.label}
						type="button"
						data-index={i}
						className={`mdx-tabs-trigger${i === active ? ' mdx-tabs-trigger-active' : ''}`}
						onClick={handleSelect}
					>
						{item.label}
					</button>
				))}
			</div>
			<div className="mdx-tabs-panel">{items[active].children}</div>
		</div>
	);
}
