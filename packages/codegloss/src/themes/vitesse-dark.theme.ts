import type { CodeGlossTheme } from './theme.types';

const vitesseDark = {
	name: 'vitesse-dark',
	dark: {
		keyword: '#4d9375',
		string: '#c98a7d',
		number: '#4c8dae',
		comment: '#758575',
		bg: '#121212',
		text: '#dbd7ca',
		border: '#2e2e2e',
		muted: '#6b6b6b',
		lineNum: '#444444',
		toolbarBg: '#1a1a1a',
		badgeBg: '#252525',
		badgeText: '#6b6b6b',
		annBg: 'rgba(77,147,117,0.12)',
		annBorder: '#4d9375',
		annHover: 'rgba(77,147,117,0.22)',
	},
} satisfies CodeGlossTheme;

export default vitesseDark;
