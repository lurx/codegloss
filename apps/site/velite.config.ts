import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import {
	createShikiHighlighter,
	type ShikiLikeHighlighter,
} from 'codegloss/highlighters/shiki';
import remarkCodegloss from 'codegloss/remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { createHighlighter } from 'shiki';
import { defineConfig, s } from 'velite';
import codeglossConfig from './codegloss.config';

const { arcs, callouts } = codeglossConfig;
const SHIKI_THEME = String(codeglossConfig.theme ?? 'github-dark');
const SHIKI_DARK_THEME = String(codeglossConfig.darkTheme ?? SHIKI_THEME);

// One Shiki instance, shared by rehype (regular fenced blocks) and the
// codegloss remark plugin (build-time pre-highlight for <code-gloss>). Same
// languages, same theme, no drift between the two render paths.
const sharedShiki = await createHighlighter({
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

const codeglossHighlight = createShikiHighlighter(
	sharedShiki as unknown as ShikiLikeHighlighter,
	{ theme: SHIKI_THEME },
);

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
          theme: SHIKI_THEME,
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
      [rehypeShikiFromHighlighter, sharedShiki, { theme: SHIKI_THEME }],
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
        .transform((data) => ({
          ...data,
          slug: data.slug.replace(/^docs\//, ''),
        })),
    },
  },
});
