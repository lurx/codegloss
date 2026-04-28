import type { ReactNode } from 'react';

export type DocsLayoutProps = {
	children: ReactNode;
};

export type SidebarItem = {
	label: string;
	slug: string;
};

export type SidebarSection = {
	title: string;
	items: readonly SidebarItem[];
};
