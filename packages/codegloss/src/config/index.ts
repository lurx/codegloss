import type { CodeGlossTheme } from '../themes/theme.types';

export type CodeGlossUserConfig = {
	/** Named bundled theme, or an inline theme object. */
	theme?: string | CodeGlossTheme;
	/** Override for dark mode only (applied on top of theme). */
	darkTheme?: string | CodeGlossTheme;
};

/** Type-safe config helper (identity function for autocompletion). */
export function defineConfig(config: CodeGlossUserConfig): CodeGlossUserConfig {
	return config;
}
