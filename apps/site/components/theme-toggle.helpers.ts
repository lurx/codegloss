import type { ColorScheme } from './theme-toggle.types';
import { COLOR_SCHEME_STORAGE_KEY } from './theme-toggle.constants';

export function getInitialScheme(): ColorScheme {
	if (typeof window === 'undefined') return 'dark';

	const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') return stored;

	return window.matchMedia('(prefers-color-scheme: light)').matches
		? 'light'
		: 'dark';
}
