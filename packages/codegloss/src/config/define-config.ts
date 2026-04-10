import type { CodeGlossUserConfig } from './config.types';

/** Type-safe config helper (identity function for autocompletion). */
export function defineConfig(config: CodeGlossUserConfig): CodeGlossUserConfig {
	return config;
}
