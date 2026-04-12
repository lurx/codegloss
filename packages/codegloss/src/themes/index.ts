import githubLight from './github-light.theme';
import githubDark from './github-dark.theme';
import oneLight from './one-light.theme';
import oneDark from './one-dark.theme';
import dracula from './dracula.theme';
import nordLight from './nord-light.theme';
import nordDark from './nord-dark.theme';
import vitesseLight from './vitesse-light.theme';
import vitesseDark from './vitesse-dark.theme';
import type { CodeGlossTheme } from './theme.types';

export type { CodeGlossTheme, CodeGlossThemeVariant } from './theme.types';
export { buildThemeCss } from './theme-css.helpers';

const themeRegistry = new Map<string, CodeGlossTheme>([
	['github-light', githubLight],
	['github-dark', githubDark],
	['one-light', oneLight],
	['one-dark', oneDark],
	['dracula', dracula],
	['nord-light', nordLight],
	['nord-dark', nordDark],
	['vitesse-light', vitesseLight],
	['vitesse-dark', vitesseDark],
]);

/** Resolve a theme by name. Returns undefined if not found. */
export function resolveTheme(name: string): CodeGlossTheme | undefined {
	return themeRegistry.get(name);
}

/** Set a global default theme for all `<code-gloss>` instances on the page. */
export function applyGlobalTheme(name: string): void {
	for (const element of document.querySelectorAll('code-gloss')) {
		if (!element.hasAttribute('theme')) {
			element.setAttribute('theme', name);
		}
	}
}

export { default as githubLight } from './github-light.theme';
export { default as githubDark } from './github-dark.theme';
export { default as oneLight } from './one-light.theme';
export { default as oneDark } from './one-dark.theme';
export { default as dracula } from './dracula.theme';
export { default as nordLight } from './nord-light.theme';
export { default as nordDark } from './nord-dark.theme';
export { default as vitesseLight } from './vitesse-light.theme';
export { default as vitesseDark } from './vitesse-dark.theme';
