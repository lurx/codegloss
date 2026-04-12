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
		code: `\`\`\`js sandbox greet.js
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
		code: `import { CodeGloss } from 'codegloss/react';

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
import { CodeGloss } from 'codegloss/vue';
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
  import CodeGloss from 'codegloss/svelte';
</script>

<CodeGloss
  code={\`function greet(name) { return 'Hello, ' + name; }\`}
  lang="js"
  filename="greet.js"
/>`,
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
		code: `\`\`\`js sandbox fibonacci.js
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
