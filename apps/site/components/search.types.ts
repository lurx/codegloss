export type SearchEntry = {
	title: string;
	slug: string;
	headings: string[];
	text: string;
};

export type SearchResult = {
	entry: SearchEntry;
	matchedHeading?: string;
};
