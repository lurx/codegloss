'use client';

import { useEffect, useState } from 'react';
import type { SiteTheme } from './use-site-theme.types';

/**
 * Observes the `data-theme` attribute on `<html>` and returns the
 * current site color scheme. Reacts to changes from ThemeToggle.
 */
export function useSiteTheme(): SiteTheme {
	const [theme, setTheme] = useState<SiteTheme>('dark');

	useEffect(() => {
		const update = () => {
			const value = document.documentElement.dataset.theme;
			setTheme(value === 'light' ? 'light' : 'dark');
		};

		update();

		const observer = new MutationObserver(update);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		return () => observer.disconnect();
	}, []);

	return theme;
}
