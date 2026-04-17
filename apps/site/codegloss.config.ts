import { defineConfig } from 'codegloss/config';
import {
	createShikiHighlighter,
	type ShikiLikeHighlighter,
} from '@codegloss/shiki';
import { createHighlighter } from 'shiki';

const SHIKI_THEME = 'laserwave';

const SHIKI_LANGS = [
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
] as const;

// One Shiki instance shared by every codegloss render path on this site:
// build-time (via the remark plugin), server-side (page.tsx hero pre-render),
// rehype-shiki for non-codegloss fenced blocks, and the editor's runtime
// initCodegloss bootstrap. Single source of truth for theme + langs.
export const shiki = await createHighlighter({
	themes: [SHIKI_THEME],
	langs: [...SHIKI_LANGS],
});

export default defineConfig({
	// codegloss is intentionally syntax-agnostic — colors come from the
	// highlighter below, which forwards Shiki tokens and the theme's chrome
	// (background/foreground) on each return value.
	theme: SHIKI_THEME,
	arcs: {
		strokeDasharray: 'none',
		opacity: 0.65,
	},
	highlight: createShikiHighlighter(shiki as unknown as ShikiLikeHighlighter, {
		theme: SHIKI_THEME,
	}),
});
