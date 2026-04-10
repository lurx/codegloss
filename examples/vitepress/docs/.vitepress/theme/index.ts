import DefaultTheme from 'vitepress/theme';

import { CodeGloss } from 'codegloss/vue';

import type { Theme } from 'vitepress';

// Globally register the Vue wrapper so markdown pages can drop a
// <CodeGloss /> element without an explicit per-file import.
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CodeGloss', CodeGloss);
  },
} satisfies Theme;
