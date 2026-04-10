'use client';

import { useState } from 'react';

const TABS = [
	{
		label: 'Vanilla HTML',
		content: `Drop a <script> tag and a <code-gloss> custom element with a JSON config child.

Works in plain HTML pages, Hugo, Eleventy, Jekyll — anywhere you can drop a <script> tag.`,
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
	{
		label: 'React',
		content:
			'Import the wrapper and pass props. Works with React 16.14+. The React wrapper is a thin JSX adapter — zero React APIs beyond JSX itself.',
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
		label: 'MDX / Remark',
		content:
			'Use fenced code blocks with a sandbox tag. The remark plugin detects them and emits CodeGloss components at build time.',
		code: `// Configure the plugin in your MDX pipeline:
import remarkCodegloss from 'codegloss/remark';

// Then write annotated code in MDX:

\`\`\`js sandbox greet.js
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

\`\`\`json annotations
{
  "annotations": [{
    "id": "a1", "token": "name", "line": 0, "occurrence": 0,
    "title": "Parameter", "text": "The name to greet."
  }]
}
\`\`\``,
	},
	{
		label: 'Vue',
		content: 'Import the Vue 3 wrapper component.',
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
		content: 'Import the Svelte wrapper component.',
		code: `<script>
  import CodeGloss from 'codegloss/svelte';
</script>

<CodeGloss
  code={\`function greet(name) { return 'Hello, ' + name; }\`}
  lang="js"
  filename="greet.js"
/>`,
	},
];

export function UsageTabs() {
	const [active, setActive] = useState(0);
	const tab = TABS[active];

	return (
		<div className="mdx-tabs">
			<div className="mdx-tabs-bar">
				{TABS.map((t, i) => (
					<button
						key={t.label}
						type="button"
						className={`mdx-tabs-trigger${i === active ? ' mdx-tabs-trigger-active' : ''}`}
						onClick={() => setActive(i)}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="mdx-tabs-panel">
				<p style={{ color: 'var(--site-fg)', lineHeight: 1.72, fontSize: '0.9375rem', marginBottom: '1rem' }}>
					{tab.content}
				</p>
				<pre
					style={{
						background: 'var(--site-pre-bg)',
						border: '1px solid var(--site-border)',
						borderRadius: '8px',
						padding: '1rem',
						overflowX: 'auto',
						fontFamily: 'var(--font-mono)',
						fontSize: '0.75rem',
						lineHeight: 1.7,
						color: 'var(--site-pre-fg)',
					}}
				>
					<code>{tab.code}</code>
				</pre>
			</div>
		</div>
	);
}
