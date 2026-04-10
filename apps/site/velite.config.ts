import { defineConfig, s } from 'velite';
import remarkCodegloss from 'codegloss/remark';
import codeglossConfig from './codegloss.config';

const theme =
	typeof codeglossConfig.theme === 'string'
		? codeglossConfig.theme
		: undefined;

export default defineConfig({
  mdx: {
    remarkPlugins: [[remarkCodegloss, { skipImport: true, theme }]],
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
