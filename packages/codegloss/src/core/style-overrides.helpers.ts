import type { CodeGlossStyleOverrides } from '../config/config.types';

type StyleOverrideGroup = keyof CodeGlossStyleOverrides;

/**
 * Map from `[group, field]` to the `--cg-*` CSS custom property on the
 * `<code-gloss>` host. One entry per supported field — unknown fields
 * are a TypeScript error rather than a silent no-op.
 */
const CSS_VAR_MAP: ReadonlyArray<
	readonly [StyleOverrideGroup, string, string]
> = [
	['codeBlock', 'background', '--cg-bg'],
	['codeBlock', 'foreground', '--cg-text'],
	['codeBlock', 'border', '--cg-border'],
	['codeBlock', 'borderRadius', '--cg-radius'],
	['codeBlock', 'maxInlineSize', '--cg-max-inline-size'],
	['codeBlock', 'toolbarBackground', '--cg-toolbar-bg'],
	['codeBlock', 'mutedForeground', '--cg-muted'],
	['annotations', 'markerBackground', '--cg-ann-bg'],
	['annotations', 'markerBorder', '--cg-ann-border'],
	['annotations', 'markerHover', '--cg-ann-hover'],
	['badge', 'background', '--cg-badge-bg'],
	['badge', 'foreground', '--cg-badge-text'],
	['lineNumbers', 'foreground', '--cg-line-num'],
];

/**
 * Flatten a `styleOverrides` object into a list of `[cssVar, value]` pairs,
 * skipping empty groups and unset fields. Internal helper; prefer
 * `styleOverridesToInlineStyle` at call sites.
 */
export function styleOverridesToCssVars(
	overrides: CodeGlossStyleOverrides | undefined,
): Array<[string, string]> {
	if (!overrides) return [];
	const pairs: Array<[string, string]> = [];
	for (const [group, field, cssVar] of CSS_VAR_MAP) {
		const groupValue = overrides[group] as
			| Record<string, string | undefined>
			| undefined;
		const value = groupValue?.[field];
		if (typeof value === 'string' && value.length > 0) {
			pairs.push([cssVar, value]);
		}
	}

	return pairs;
}

/**
 * Render a `styleOverrides` object as a semicolon-delimited CSS string
 * suitable for an inline `style=""` attribute or a React/Vue `style` prop
 * value. Returns `undefined` when there's nothing to set so consumers can
 * omit the attribute entirely.
 */
export function styleOverridesToInlineStyle(
	overrides: CodeGlossStyleOverrides | undefined,
): string | undefined {
	const pairs = styleOverridesToCssVars(overrides);
	if (pairs.length === 0) return undefined;
	return pairs.map(([name, value]) => `${name}: ${value}`).join('; ');
}
