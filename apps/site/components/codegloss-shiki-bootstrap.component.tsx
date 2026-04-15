'use client';

import { useEffect } from 'react';
import { setDefaultHighlighter } from 'codegloss';
import {
	createShikiHighlighter,
	type ShikiLikeHighlighter,
} from 'codegloss/highlighters/shiki';
import {
	SHIKI_LANGS,
	SHIKI_THEMES,
	SHIKI_ACTIVE_THEME,
} from './codegloss-shiki-bootstrap.constants';

async function bootstrapShiki(): Promise<void> {
	const { createHighlighter } = await import('shiki');
	const shiki = (await createHighlighter({
		themes: SHIKI_THEMES as unknown as Parameters<typeof createHighlighter>[0]['themes'],
		langs: SHIKI_LANGS as unknown as Parameters<typeof createHighlighter>[0]['langs'],
	})) as unknown as ShikiLikeHighlighter;

	setDefaultHighlighter(
		createShikiHighlighter(shiki, { theme: SHIKI_ACTIVE_THEME }),
	);
}

export function CodeglossShikiBootstrap() {
	useEffect(() => {
		void bootstrapShiki();
	}, []);
	return null;
}
