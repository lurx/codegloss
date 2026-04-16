// Server-only: top-level await + Shiki initialization runs at module load
// time on the server. Import only from server components or build-time
// configs — bringing this into a client bundle would ship Shiki to users.
import { createHighlighter } from 'shiki';
import {
	createShikiHighlighter,
	type ShikiLikeHighlighter,
} from 'codegloss/highlighters/shiki';
import codeglossConfig from '@/codegloss.config';

const SHIKI_THEME = String(codeglossConfig.theme ?? 'github-dark');
const SHIKI_DARK_THEME = String(codeglossConfig.darkTheme ?? SHIKI_THEME);

const shiki = await createHighlighter({
	themes: Array.from(new Set([SHIKI_THEME, SHIKI_DARK_THEME])),
	langs: [
		'js',
		'ts',
		'tsx',
		'jsx',
		'json',
		'md',
		'mdx',
		'bash',
		'shell',
		'html',
		'css',
		'scss',
		'vue',
		'svelte',
		'python',
		'rust',
		'go',
	],
});

/**
 * Shared codegloss highlighter for any React component on the site.
 *
 * Pass to `<CodeGloss highlight={highlight} />`. The wrapper invokes it at
 * render time (server-side for static pages) and bakes the resulting HTML
 * into the config — no client-side Shiki download.
 *
 * Single source of truth for theme/languages — mirrors what Velite uses for
 * fenced code blocks and codegloss remark blocks.
 */
export const highlight = createShikiHighlighter(
	shiki as unknown as ShikiLikeHighlighter,
	{ theme: SHIKI_THEME },
);
