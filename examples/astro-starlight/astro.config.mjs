import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

import remarkCodegloss from 'codegloss/remark';

// Astro 5 + Starlight + remark-codegloss in HTML mode. Astro renders pages
// to static HTML, so we ask remark-codegloss to emit raw <code-gloss> nodes
// (rather than MDX JSX) and ship the runtime via a global script in the head.
export default defineConfig({
  integrations: [
    starlight({
      title: 'codegloss · Astro + Starlight example',
      head: [
        {
          tag: 'script',
          attrs: { type: 'module', src: '/codegloss.js' },
        },
      ],
      sidebar: [
        { label: 'Intro', link: '/intro/' },
      ],
    }),
  ],
  markdown: {
    remarkPlugins: [[remarkCodegloss, { output: 'html' }]],
  },
});
