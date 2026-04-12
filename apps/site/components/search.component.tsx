'use client';

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ChangeEvent,
	type KeyboardEvent,
	type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import type { SearchEntry } from './search.types';
import { searchDocs } from './search.helpers';
import {
	MIN_QUERY_LENGTH,
	SEARCH_INDEX_URL,
	SEARCH_TRIGGER_ICON_SIZE,
} from './search.constants';

export function Search() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [index, setIndex] = useState<SearchEntry[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);

	const inputRef = useRef<HTMLInputElement>(null);

	const router = useRouter();

	const results = useMemo(() => {
		if (query.length < MIN_QUERY_LENGTH) return [];
		return searchDocs(query, index);
	}, [query, index]);

	const openDialog = useCallback(() => setOpen(true), []);
	const closeDialog = useCallback(() => setOpen(false), []);

	const navigate = useCallback(
		(slug: string) => {
			router.push(`/docs/${slug}/`);
			setOpen(false);
		},
		[router],
	);

	const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
		setActiveIndex(0);
	}, []);

	const handleInputKeyDown = useCallback(
		(event: KeyboardEvent<HTMLInputElement>) => {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				setActiveIndex(i => Math.min(i + 1, results.length - 1));
				return;
			}
			if (event.key === 'ArrowUp') {
				event.preventDefault();
				setActiveIndex(i => Math.max(i - 1, 0));
				return;
			}
			if (event.key === 'Enter' && results[activeIndex]) {
				navigate(results[activeIndex].entry.slug);
			}
		},
		[results, activeIndex, navigate],
	);

	const handleResultClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const slug = event.currentTarget.dataset.slug;
			if (slug) navigate(slug);
		},
		[navigate],
	);

	const handleResultHover = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			const i = Number(event.currentTarget.dataset.index);
			setActiveIndex(i);
		},
		[],
	);

	const stopPropagation = useCallback((event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
	}, []);

	useEffect(() => {
		void fetch(SEARCH_INDEX_URL)
			.then(r => r.json())
			.then((data: SearchEntry[]) => setIndex(data))
			.catch(() => {});
	}, []);

	useEffect(() => {
		function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
				event.preventDefault();
				setOpen(prev => !prev);
			}

			if (event.key === 'Escape') {
				setOpen(false);
			}
		}

		document.addEventListener('keydown', handleGlobalKeyDown);
		return () => document.removeEventListener('keydown', handleGlobalKeyDown);
	}, []);

	useEffect(() => {
		if (open) {
			setQuery('');
			setActiveIndex(0);
			document.body.style.overflow = 'hidden';
			setTimeout(() => inputRef.current?.focus(), 0);
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	const renderResults = () => {
		if (results.length === 0) {
			if (query.length >= MIN_QUERY_LENGTH) {
				return (
					<div className="search-empty">
						No results for &ldquo;{query}&rdquo;
					</div>
				);
			}
			return null;
		}

		return (
			<ul className="search-results">
				{results.map((result, i) => (
					<li key={result.entry.slug}>
						<button
							type="button"
							data-slug={result.entry.slug}
							data-index={i}
							className={`search-result${i === activeIndex ? ' search-result-active' : ''}`}
							onClick={handleResultClick}
							onMouseEnter={handleResultHover}
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
		);
	};

	const renderDialog = () => {
		if (!open) return null;

		return createPortal(
			<div className="search-overlay" onClick={closeDialog}>
				<div className="search-dialog" onClick={stopPropagation}>
					<input
						ref={inputRef}
						type="text"
						className="search-input"
						placeholder="Search docs..."
						value={query}
						onChange={handleInputChange}
						onKeyDown={handleInputKeyDown}
					/>
					{renderResults()}
				</div>
			</div>,
			document.body,
		);
	};

	return (
		<>
			<button
				type="button"
				className="search-trigger"
				onClick={openDialog}
				aria-label="Search documentation"
			>
				<SearchIcon size={SEARCH_TRIGGER_ICON_SIZE} />
				<span className="search-trigger-text">Search</span>
				<kbd className="search-trigger-kbd">
					<span className="search-trigger-kbd-mod">⌘</span>K
				</kbd>
			</button>
			{renderDialog()}
		</>
	);
}
