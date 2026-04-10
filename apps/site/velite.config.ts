import { defineConfig, s } from 'velite';
import remarkCodegloss from 'remark-codegloss';

export default defineConfig({
  mdx: {
    remarkPlugins: [[remarkCodegloss, { skipImport: true }]],
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
