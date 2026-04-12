import type { SearchEntry, SearchResult } from './search.types';
import { MAX_RESULTS } from './search.constants';

export function searchDocs(
	query: string,
	index: SearchEntry[],
): SearchResult[] {
	const lower = query.toLowerCase();
	const results: SearchResult[] = [];

	for (const entry of index) {
		if (entry.title.toLowerCase().includes(lower)) {
			results.push({ entry });
			continue;
		}

		const matchedHeading = entry.headings.find(h =>
			h.toLowerCase().includes(lower),
		);
		if (matchedHeading) {
			results.push({ entry, matchedHeading });
			continue;
		}

		if (entry.text.toLowerCase().includes(lower)) {
			results.push({ entry });
		}
	}

	return results.slice(0, MAX_RESULTS);
}
