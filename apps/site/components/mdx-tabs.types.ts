import type { ReactNode } from 'react';

export type TabItem = {
	label: string;
	children: ReactNode;
};

export type MdxTabsProps = {
	items: TabItem[];
};
