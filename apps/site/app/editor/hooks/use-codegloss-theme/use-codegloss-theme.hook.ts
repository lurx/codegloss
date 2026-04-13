import { useSiteTheme } from '@/hooks';
import codeglossConfig from '@/codegloss.config';

/* v8 ignore start -- fallbacks guard a config without theme/darkTheme */
const LIGHT_THEME = String(codeglossConfig.theme ?? '');
const DARK_THEME = String(
	codeglossConfig.darkTheme ?? codeglossConfig.theme ?? '',
);
/* v8 ignore stop */

export function useCodeglossTheme(): string {
	const siteTheme = useSiteTheme();
	return siteTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
}
