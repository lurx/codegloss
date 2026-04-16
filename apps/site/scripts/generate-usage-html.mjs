#!/usr/bin/env node
import { codeToHtml } from 'shiki';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const TABS = [
	{
		label: 'MDX / Remark — Setup',
		lang: 'js',
		code: `import remarkCodegloss from 'codegloss/remark';

const withMdx = createMdx({
  options: {
    remarkPlugins: [remarkCodegloss],
  },
});`,
	},
	{
		label: 'MDX / Remark — Markdown',
		lang: 'md',
		code: `\`\`\`js codegloss greet.js
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

\`\`\`json annotations
{
  "annotations": [
    { "id": "a1", "token": "name", "line": 0,
      "occurrence": 0, "title": "Parameter",
      "text": "The name to greet." }
  ]
}
\`\`\``,
	},
	{
		label: 'React',
		lang: 'tsx',
		code: `import { CodeGloss } from '@codegloss/react';

<CodeGloss
  code="function greet(name) { return 'Hello, ' + name; }"
  lang="js"
  filename="greet.js"
  annotations={[
    { id: 'a1', token: 'name', line: 0, occurrence: 0,
      title: 'Parameter', text: 'The name to greet.' },
  ]}
/>`,
	},
	{
		label: 'Vue',
		lang: 'vue',
		code: `<script setup lang="ts">
import { CodeGloss } from '@codegloss/vue';
</script>

<template>
  <CodeGloss
    code="function greet(name) { return 'Hello, ' + name; }"
    lang="js"
    filename="greet.js"
  />
</template>`,
	},
	{
		label: 'Svelte',
		lang: 'svelte',
		code: `<script>
  import CodeGloss from '@codegloss/svelte';
</script>

<CodeGloss
  code={\`function greet(name) { return 'Hello, ' + name; }\`}
  lang="js"
  filename="greet.js"
/>`,
	},
	{
		label: 'Highlighter — Shiki',
		lang: 'ts',
		code: `import { setDefaultHighlighter } from 'codegloss';
import { createShikiHighlighter } from 'codegloss/highlighters/shiki';
import { createHighlighter } from 'shiki';

const shiki = await createHighlighter({
  themes: ['github-dark'],
  langs: ['js', 'ts', 'tsx', 'py', 'rust'],
});

setDefaultHighlighter(
  createShikiHighlighter(shiki, { theme: 'github-dark' }),
);`,
	},
	{
		label: 'Highlighter — Prism',
		lang: 'ts',
		code: `import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';
import { setDefaultHighlighter } from 'codegloss';
import { createPrismHighlighter } from 'codegloss/highlighters/prism';

// Name a built-in Prism theme for auto chrome, or pass
// { background, color } directly for a custom stylesheet.
setDefaultHighlighter(
  createPrismHighlighter(Prism, { theme: 'tomorrow' }),
);`,
	},
	{
		label: 'Highlighter — hljs',
		lang: 'ts',
		code: `import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/atom-one-dark.css';
import { setDefaultHighlighter } from 'codegloss';
import { createHljsHighlighter } from 'codegloss/highlighters/hljs';

hljs.registerLanguage('javascript', javascript);

// Named hljs preset resolves the bg/fg so codegloss's chrome matches.
setDefaultHighlighter(
  createHljsHighlighter(hljs, { theme: 'atom-one-dark' }),
);`,
	},
	{
		label: 'Highlighter — Custom',
		lang: 'ts',
		code: `import { setDefaultHighlighter } from 'codegloss';

setDefaultHighlighter((code, lang) => {
  if (lang !== 'sql') return code;
  return code.replace(
    /\\b(SELECT|FROM|WHERE|JOIN|ON|AS)\\b/g,
    '<span class="cg-keyword">$&</span>',
  );
});`,
	},
	{
		label: 'Vanilla HTML',
		lang: 'html',
		code: `<script type="module" src="https://unpkg.com/codegloss/dist/index.js"></script>

<code-gloss>
  <script type="application/json">
    {
      "code": "function greet(name) {\\n  return 'Hello, ' + name;\\n}",
      "lang": "js",
      "filename": "greet.js",
      "annotations": [
        { "id": "a1", "token": "name", "line": 0, "occurrence": 0,
          "title": "Parameter", "text": "The name to greet." }
      ]
    }
  </script>
</code-gloss>`,
	},
];

const result = {};

for (const tab of TABS) {
	const dark = await codeToHtml(tab.code, {
		lang: tab.lang,
		theme: 'github-dark',
	});
	const light = await codeToHtml(tab.code, {
		lang: tab.lang,
		theme: 'github-light',
	});
	result[tab.label] = { dark, light };
}

const outPath = path.resolve(
	import.meta.dirname,
	'../components/usage-tabs-html.generated.json',
);
writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`[generate-usage-html] wrote ${outPath}`);

// ── Homepage quick-start snippets ──────────────────────────────
const HOMEPAGE_SNIPPETS = [
	{
		label: 'install',
		lang: 'bash',
		code: 'npm install codegloss',
	},
	{
		label: 'config',
		lang: 'js',
		code: `import createMdx from '@next/mdx';
import remarkCodegloss from 'codegloss/remark';

const withMdx = createMdx({
  options: {
    remarkPlugins: [remarkCodegloss],
  },
});`,
	},
	{
		label: 'mdx',
		lang: 'md',
		code: `\`\`\`js codegloss fibonacci.js
function fibonacci(n) {
  const memo = {};
  // ...
}
\`\`\`

\`\`\`json annotations
{
  "annotations": [{
    "id": "a1",
    "token": "memo",
    "line": 1,
    "occurrence": 0,
    "title": "Cache",
    "text": "Stores computed values."
  }]
}
\`\`\``,
	},
];

const homepageResult = {};

for (const snippet of HOMEPAGE_SNIPPETS) {
	const dark = await codeToHtml(snippet.code, {
		lang: snippet.lang,
		theme: 'github-dark',
	});
	const light = await codeToHtml(snippet.code, {
		lang: snippet.lang,
		theme: 'github-light',
	});
	homepageResult[snippet.label] = { dark, light };
}

const homepageOutPath = path.resolve(
	import.meta.dirname,
	'../components/homepage-snippets-html.generated.json',
);
writeFileSync(homepageOutPath, JSON.stringify(homepageResult, null, 2));
console.log(`[generate-usage-html] wrote ${homepageOutPath}`);
