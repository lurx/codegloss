import type { CodeGlossTheme } from './theme.types';

const nordLightTheme = {
	name: 'nord-light',
	light: {
		keyword: '#5e81ac',
		string: '#a3be8c',
		number: '#b48ead',
		comment: '#9da5b4',
		bg: '#eceff4',
		text: '#2e3440',
		border: '#d8dee9',
		muted: '#7b88a1',
		lineNum: '#9da5b4',
		toolbarBg: '#e5e9f0',
		badgeBg: '#d8dee9',
		badgeText: '#7b88a1',
		annBg: 'rgba(94,129,172,0.12)',
		annBorder: '#5e81ac',
		annHover: 'rgba(94,129,172,0.22)',
	},
} satisfies CodeGlossTheme;

export default nordLightTheme;
