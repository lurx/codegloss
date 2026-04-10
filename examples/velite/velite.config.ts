import { defineConfig, s } from 'velite';

import remarkCodegloss from 'remark-codegloss';

export default defineConfig({
  mdx: {
    // skipImport: the consumer wires CodeGloss in via an MDX components map,
    // so we don't want velite/mdx-bundler to try and import 'codegloss/react'
    // from the compiled-in-memory MDX module.
    remarkPlugins: [[remarkCodegloss, { skipImport: true }]],
  },
  collections: {
    posts: {
      name: 'Post',
      pattern: 'posts/**/*.mdx',
      schema: s.object({
        title: s.string(),
        slug: s.path(),
        body: s.mdx(),
      }),
    },
  },
});
