import { useSiteTheme } from '@/hooks';
import codeglossConfig from '@/codegloss.config';

const LIGHT_THEME = String(codeglossConfig.theme ?? '');
const DARK_THEME = String(
	codeglossConfig.darkTheme ?? codeglossConfig.theme ?? '',
);

export function useCodeglossTheme(): string {
	const siteTheme = useSiteTheme();
	return siteTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
}
