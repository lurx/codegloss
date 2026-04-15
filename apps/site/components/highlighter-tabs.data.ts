import type { Tab } from './usage-tabs.types';

export const HIGHLIGHTER_TABS: Tab[] = [
	{
		label: 'Shiki',
		content:
			'TextMate-grade highlighting with real editor themes. Create a Shiki instance once (async — it loads grammars and themes), then register the adapter. Dual light/dark theming supported via the `themes` option. Because `createHighlighter` is async, blocks rendered before Shiki initializes briefly use the built-in regex tokenizer; setDefaultHighlighter refreshes them in place as soon as the swap happens.',
		install: 'codegloss shiki',
		blocks: [{ htmlKey: 'Highlighter — Shiki' }],
	},
	{
		label: 'Prism',
		content:
			"Smaller and fully synchronous — a good fit when you're already shipping Prism for the rest of your site. Load the languages you use before rendering; the adapter falls back to Prism's plain mapping when a language isn't registered.",
		install: 'codegloss prismjs',
		blocks: [{ htmlKey: 'Highlighter — Prism' }],
	},
	{
		label: 'highlight.js',
		content:
			'Similar ergonomics, different theming model — class-based rather than inline. Ship a highlight.js theme stylesheet (e.g. `highlight.js/styles/github-dark.css`) so the `hljs-*` class names get colors.',
		install: 'codegloss highlight.js',
		blocks: [{ htmlKey: 'Highlighter — hljs' }],
	},
	{
		label: 'Custom',
		content:
			'The contract is tiny — any function `(code, lang) => string` that returns span-wrapped HTML works. Use this for in-house highlighters, to post-process another tool\'s output, or to hard-code a preset for a single language.',
		blocks: [{ htmlKey: 'Highlighter — Custom' }],
	},
];
