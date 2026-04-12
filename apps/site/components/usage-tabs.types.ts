export type CodeBlockEntry = {
	/** Key in the generated JSON */
	htmlKey: string;
	/** Optional label shown above the block */
	label?: string;
};

export type Tab = {
	label: string;
	content: string;
	blocks: CodeBlockEntry[];
};

export type CopyableBlockProps = {
	html: string;
	label?: string;
};

export type HighlightedHtmlMap = Record<string, Record<string, string>>;
