import type { HighlightedCode, Highlighter } from '../core/code-gloss.types';

/**
 * Minimal slice of highlight.js's API that we actually call.
 */
export type HljsLikeHighlighter = {
	highlight: (
		code: string,
		options: { language: string; ignoreIllegals?: boolean },
	) => { value: string };
	getLanguage: (lang: string) => unknown;
};

/**
 * Chrome options. highlight.js themes are CSS-class-based — colors live
 * in a stylesheet the consumer imports separately. Either name a known
 * hljs theme (we ship the bg/fg lookup) or hand the colors in directly.
 * Explicit fields win over the preset.
 */
export type CreateHljsHighlighterOptions = {
	/** Named hljs theme preset: resolves to a built-in bg/fg pair. */
	theme?: HljsThemeName;
	/** Explicit block background color. */
	background?: string;
	/** Explicit foreground color. */
	color?: string;
};

export type HljsThemeName =
	| 'default'
	| 'github'
	| 'github-dark'
	| 'atom-one-dark'
	| 'atom-one-light'
	| 'monokai'
	| 'dracula'
	| 'nord'
	| 'tokyo-night-dark';

const HLJS_THEME_CHROME: Record<
	HljsThemeName,
	{ background: string; color: string }
> = {
	default: { background: '#f0f0f0', color: '#444' },
	github: { background: '#f6f8fa', color: '#24292e' },
	'github-dark': { background: '#24292e', color: '#e1e4e8' },
	'atom-one-dark': { background: '#282c34', color: '#abb2bf' },
	'atom-one-light': { background: '#fafafa', color: '#383a42' },
	monokai: { background: '#272822', color: '#ddd' },
	dracula: { background: '#282a36', color: '#f8f8f2' },
	nord: { background: '#2e3440', color: '#d8dee9' },
	'tokyo-night-dark': { background: '#1a1b26', color: '#c0caf5' },
};

/**
 * Build a codegloss-compatible highlighter from a highlight.js instance.
 * When the requested language isn't registered, fall back to rendering
 * the code as-is (escaped by hljs internally via `ignoreIllegals`).
 */
export function createHljsHighlighter(
	hljs: HljsLikeHighlighter,
	options: CreateHljsHighlighterOptions = {},
): Highlighter {
	const preset = options.theme ? HLJS_THEME_CHROME[options.theme] : undefined;
	const background = options.background ?? preset?.background;
	const color = options.color ?? preset?.color;

	return (code, lang): string | HighlightedCode => {
		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
		const html = hljs.highlight(code, { language, ignoreIllegals: true }).value;
		if (!background && !color) return html;
		return {
			html,
			...(background ? { background } : {}),
			...(color ? { color } : {}),
		};
	};
}
