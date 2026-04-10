import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import remarkCodegloss from 'remark-codegloss';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [
    mdsvex({
      extensions: ['.svx', '.md'],
      // mdsvex doesn't process mdxJsxFlowElement nodes from MDX mode, so we
      // ask remark-codegloss to emit raw HTML <code-gloss> nodes. Authors who
      // want a typed Svelte wrapper invocation just write <CodeGloss /> by
      // hand in the .md file (see src/routes/+page.md).
      remarkPlugins: [[remarkCodegloss, { output: 'html' }]],
    }),
  ],
  kit: {
    // No fallback — every route is fully prerendered.
    adapter: adapter(),
  },
};

export default config;
