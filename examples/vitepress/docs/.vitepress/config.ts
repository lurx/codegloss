import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'codegloss · VitePress example',
  description: 'Annotated code blocks in VitePress',
  vue: {
    template: {
      compilerOptions: {
        // Treat any element starting with `code-gloss` as a custom element so
        // VitePress's Vue compiler doesn't warn about it as an unknown component.
        isCustomElement: (tag) => tag === 'code-gloss',
      },
    },
  },
  themeConfig: {
    nav: [{ text: 'Intro', link: '/intro' }],
    sidebar: [{ text: 'Docs', items: [{ text: 'Intro', link: '/intro' }] }],
  },
});
