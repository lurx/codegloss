import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import remarkCodegloss from 'codegloss/remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { defineConfig, s } from 'velite';
import codeglossConfig, { shiki } from './codegloss.config';
import { rehypeCodeglossPre } from '@codegloss/shiki';

const { arcs, callouts, highlight: codeglossHighlight } = codeglossConfig;
const SHIKI_THEME = String(codeglossConfig.theme);

/** Lucide `link` icon, inlined as hast for the autolink-headings
 *  build-time render. The check-icon swap happens client-side in
 *  use-copy-heading-anchors.hook.ts so the CSS doesn't need to
 *  juggle visibility of two sibling SVGs. */
const LINK_ICON_HAST = {
	type: 'element',
	tagName: 'svg',
	properties: {
		className: 'heading-anchor-icon',
		width: '14',
		height: '14',
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: '2',
		strokeLinecap: 'round',
		strokeLinejoin: 'round',
		'aria-hidden': 'true',
	},
	children: [
		{
			type: 'element',
			tagName: 'path',
			properties: {
				d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
			},
			children: [],
		},
		{
			type: 'element',
			tagName: 'path',
			properties: {
				d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
			},
			children: [],
		},
	],
} as const;

export default defineConfig({
	mdx: {
		remarkPlugins: [
			[
				remarkCodegloss,
				{
					skipImport: true,
					arcs,
					callouts,
					// No `theme` here on purpose: codegloss is syntax-agnostic, and
					// forwarding a name (Shiki's theme) that isn't in codegloss's
					// theme registry stamps a `theme="…"` attr that blocks the
					// built-in `prefers-color-scheme: dark` rules — leaving the
					// toolbar / border / line-number gutter on light defaults while
					// the inner code area is dark from the highlighter's `--cg-bg`.
					highlight: codeglossHighlight,
				},
			],
		],
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: 'append',
					properties: {
						className: 'heading-anchor',
						'aria-label': 'Copy link to this section',
					},
					content: LINK_ICON_HAST,
				},
			],
			[rehypeShikiFromHighlighter, shiki, { theme: SHIKI_THEME }],
			rehypeCodeglossPre,
		],
	},
	collections: {
		docs: {
			name: 'Doc',
			pattern: 'docs/**/*.mdx',
			schema: s
				.object({
					title: s.string(),
					slug: s.path(),
					description: s.string().optional(),
					sidebar_position: s.number(),
					body: s.mdx(),
				})
				.transform(data => ({
					...data,
					slug: data.slug.replace(/^docs\//, ''),
				})),
		},
	},
});
