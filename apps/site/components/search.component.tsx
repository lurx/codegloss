'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import type { SearchEntry, SearchResult } from './search.types';

function searchDocs(query: string, index: SearchEntry[]): SearchResult[] {
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

	return results.slice(0, 8);
}

export function Search() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [index, setIndex] = useState<SearchEntry[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	useEffect(() => {
		void fetch('/search-index.json')
			.then(r => r.json())
			.then((data: SearchEntry[]) => setIndex(data))
			.catch(() => {});
	}, []);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
				event.preventDefault();
				setOpen(prev => !prev);
			}

			if (event.key === 'Escape') {
				setOpen(false);
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	useEffect(() => {
		if (open) {
			setQuery('');
			setActiveIndex(0);
			setTimeout(() => inputRef.current?.focus(), 0);
		}
	}, [open]);

	const results = query.length >= 2 ? searchDocs(query, index) : [];

	const navigate = useCallback(
		(slug: string) => {
			router.push(`/docs/${slug}/`);
			setOpen(false);
		},
		[router],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				setActiveIndex(i => Math.min(i + 1, results.length - 1));
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				setActiveIndex(i => Math.max(i - 1, 0));
			} else if (event.key === 'Enter' && results[activeIndex]) {
				navigate(results[activeIndex].entry.slug);
			}
		},
		[results, activeIndex, navigate],
	);

	return (
		<>
			<button
				type="button"
				className="search-trigger"
				onClick={() => setOpen(true)}
				aria-label="Search documentation"
			>
				<SearchIcon size={14} />
				<span className="search-trigger-text">Search</span>
				<kbd className="search-trigger-kbd">
					<span className="search-trigger-kbd-mod">⌘</span>K
				</kbd>
			</button>

			{open && (
				<div
					className="search-overlay"
					onClick={() => setOpen(false)}
				>
					<div
						className="search-dialog"
						onClick={event => event.stopPropagation()}
					>
						<input
							ref={inputRef}
							type="text"
							className="search-input"
							placeholder="Search docs..."
							value={query}
							onChange={event => {
								setQuery(event.target.value);
								setActiveIndex(0);
							}}
							onKeyDown={handleKeyDown}
						/>
						{results.length > 0 && (
							<ul className="search-results">
								{results.map((result, i) => (
									<li key={result.entry.slug}>
										<button
											type="button"
											className={`search-result${i === activeIndex ? ' search-result-active' : ''}`}
											onClick={() => navigate(result.entry.slug)}
											onMouseEnter={() => setActiveIndex(i)}
										>
											<span className="search-result-title">
												{result.entry.title}
											</span>
											{result.matchedHeading && (
												<span className="search-result-heading">
													{result.matchedHeading}
												</span>
											)}
										</button>
									</li>
								))}
							</ul>
						)}
						{query.length >= 2 && results.length === 0 && (
							<div className="search-empty">
								No results for &ldquo;{query}&rdquo;
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
