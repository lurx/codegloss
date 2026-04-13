import { defineConfig, s } from 'velite';
import rehypeShiki from '@shikijs/rehype';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkCodegloss from 'codegloss/remark';
import codeglossConfig from './codegloss.config';

const theme =
	typeof codeglossConfig.theme === 'string'
		? codeglossConfig.theme
		: undefined;
const { arcs, callouts } = codeglossConfig;

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
      [remarkCodegloss, { skipImport: true, theme, arcs, callouts }],
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
      [rehypeShiki, { theme: 'github-dark' }],
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
