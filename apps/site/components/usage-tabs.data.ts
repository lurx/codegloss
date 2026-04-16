import type { Tab } from './usage-tabs.types';

export const TABS: Tab[] = [
	{
		label: 'MDX / Remark',
		content:
			'Use fenced code blocks with a `codegloss` tag. The remark plugin detects them and emits CodeGloss components at build time.',
		install: 'codegloss @codegloss/react',
		blocks: [
			{ htmlKey: 'MDX / Remark — Setup', label: 'Setup' },
			{ htmlKey: 'MDX / Remark — Markdown', label: 'Markdown' },
		],
	},
	{
		label: 'React',
		content:
			'Import the wrapper and pass props. Works with React 16.14+. The React wrapper is a thin JSX adapter — zero React APIs beyond JSX itself.',
		install: 'codegloss @codegloss/react',
		blocks: [{ htmlKey: 'React' }],
	},
	{
		label: 'Vue',
		content: 'Import the Vue 3 wrapper component.',
		install: 'codegloss @codegloss/vue',
		blocks: [{ htmlKey: 'Vue' }],
	},
	{
		label: 'Svelte',
		content: 'Import the Svelte wrapper component.',
		install: 'codegloss @codegloss/svelte',
		blocks: [{ htmlKey: 'Svelte' }],
	},
	{
		label: 'Vanilla HTML',
		content:
			'Drop a <script> tag and a <code-gloss> custom element with a JSON config child. Works in plain HTML pages, Hugo, Eleventy, Jekyll — anywhere you can drop a <script> tag.',
		blocks: [{ htmlKey: 'Vanilla HTML' }],
	},
];
