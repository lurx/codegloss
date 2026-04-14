import type { Highlighter } from '../core/code-gloss.types';

/**
 * Minimal slice of Prism's API that we actually call — limited to the
 * synchronous `highlight(code, grammar, lang)` signature.
 */
export type PrismLikeHighlighter = {
	highlight: (code: string, grammar: unknown, language: string) => string;
	languages: Record<string, unknown>;
};

/**
 * Build a codegloss-compatible highlighter from a Prism-like instance.
 * The user is responsible for loading the language grammars they need
 * before rendering a block — Prism throws if `Prism.languages[lang]` is
 * missing. When the grammar is absent we fall back to Prism's `plain`
 * mapping so the block still renders (as escaped text).
 */
export function createPrismHighlighter(Prism: PrismLikeHighlighter): Highlighter {
	return (code, lang) => {
		const grammar = Prism.languages[lang] ?? Prism.languages.plain;
		return Prism.highlight(code, grammar, lang);
	};
}
