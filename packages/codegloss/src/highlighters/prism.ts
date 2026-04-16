import type { HighlightedCode, Highlighter } from '../core/code-gloss.types';

/**
 * Minimal slice of Prism's API that we actually call — limited to the
 * synchronous `highlight(code, grammar, lang)` signature.
 */
export type PrismLikeHighlighter = {
	highlight: (code: string, grammar: unknown, language: string) => string;
	languages: Record<string, unknown>;
};

/**
 * Chrome options. Prism ships its themes as external CSS files, so
 * there's no inline `style="..."` on the output for us to parse.
 * Either name a built-in Prism theme (we ship the bg/fg lookup) or
 * hand the colors in directly. Explicit fields win over the preset.
 */
export type CreatePrismHighlighterOptions = {
	/** Named Prism theme preset: resolves to a built-in bg/fg pair. */
	theme?: PrismThemeName;
	/** Explicit block background color. */
	background?: string;
	/** Explicit foreground color. */
	color?: string;
};

export type PrismThemeName =
	| 'default'
	| 'dark'
	| 'tomorrow'
	| 'okaidia'
	| 'twilight'
	| 'funky'
	| 'coy'
	| 'solarizedlight';

const PRISM_THEME_CHROME: Record<
	PrismThemeName,
	{ background: string; color: string }
> = {
	default: { background: '#f5f2f0', color: '#000' },
	dark: { background: '#1e1e1e', color: '#ccc' },
	tomorrow: { background: '#2d2d2d', color: '#ccc' },
	okaidia: { background: '#272822', color: '#f8f8f2' },
	twilight: { background: '#141414', color: '#f8f8f8' },
	funky: { background: '#000', color: '#fff' },
	coy: { background: '#fdfdfd', color: '#000' },
	solarizedlight: { background: '#fdf6e3', color: '#657b83' },
};

/**
 * Build a codegloss-compatible highlighter from a Prism-like instance.
 * The user is responsible for loading the language grammars they need
 * before rendering a block — Prism throws if `Prism.languages[lang]` is
 * missing. When the grammar is absent we fall back to Prism's `plain`
 * mapping so the block still renders (as escaped text).
 */
export function createPrismHighlighter(
	Prism: PrismLikeHighlighter,
	options: CreatePrismHighlighterOptions = {},
): Highlighter {
	const preset = options.theme ? PRISM_THEME_CHROME[options.theme] : undefined;
	const background = options.background ?? preset?.background;
	const color = options.color ?? preset?.color;

	return (code, lang): string | HighlightedCode => {
		const grammar = Prism.languages[lang] ?? Prism.languages.plain;
		const html = Prism.highlight(code, grammar, lang);
		if (!background && !color) return html;
		return {
			html,
			...(background ? { background } : {}),
			...(color ? { color } : {}),
		};
	};
}
