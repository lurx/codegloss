import type { CodeGlossThemeVariant } from './theme.types';

function variantToCss(variant: CodeGlossThemeVariant): string {
	return [
		`:host {`,
		`\t--cg-bg: ${variant.bg};`,
		`\t--cg-text: ${variant.text};`,
		`\t--cg-border: ${variant.border};`,
		`\t--cg-muted: ${variant.muted};`,
		`\t--cg-line-num: ${variant.lineNum};`,
		`\t--cg-toolbar-bg: ${variant.toolbarBg};`,
		`\t--cg-badge-bg: ${variant.badgeBg};`,
		`\t--cg-badge-text: ${variant.badgeText};`,
		`\t--cg-ann-bg: ${variant.annBg};`,
		`\t--cg-ann-border: ${variant.annBorder};`,
		`\t--cg-ann-hover: ${variant.annHover};`,
		`}`,
		`.cg-keyword { color: ${variant.keyword}; }`,
		`.cg-string { color: ${variant.string}; }`,
		`.cg-number { color: ${variant.number}; }`,
		`.cg-comment { color: ${variant.comment}; font-style: italic; }`,
	].join('\n');
}

/**
 * Build a CSS string from a theme's light/dark variants.
 *
 * - Both variants → light is default, dark inside @media query.
 * - Single variant → applied unconditionally.
 */
export function buildThemeCss(
	light: CodeGlossThemeVariant | undefined,
	dark: CodeGlossThemeVariant | undefined,
): string {
	if (light && dark) {
		return [
			variantToCss(light),
			`@media (prefers-color-scheme: dark) {`,
			variantToCss(dark),
			`}`,
		].join('\n');
	}

	if (light) {
		return variantToCss(light);
	}

	if (dark) {
		return variantToCss(dark);
	}

	return '';
}
