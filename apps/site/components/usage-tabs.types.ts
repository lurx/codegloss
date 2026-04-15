export type CodeBlockEntry = {
	/** Key in the generated JSON */
	htmlKey: string;
	/** Optional label shown above the block */
	label?: string;
};

export type Tab = {
	label: string;
	content: string;
	/** Space-separated packages to install; rendered as an <InstallTabs />. */
	install?: string;
	blocks: CodeBlockEntry[];
};

export type { CopyableBlockProps } from './copyable-block.types';
