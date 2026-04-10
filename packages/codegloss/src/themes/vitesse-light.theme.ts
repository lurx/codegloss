import type { CodeGlossTheme } from './theme.types';

const vitesseLight = {
	name: 'vitesse-light',
	light: {
		keyword: '#1e754f',
		string: '#b56959',
		number: '#2f798a',
		comment: '#a0ada0',
		bg: '#ffffff',
		text: '#393a34',
		border: '#e8e8e8',
		muted: '#999999',
		lineNum: '#a0a0a0',
		toolbarBg: '#f5f5f5',
		badgeBg: '#ebebeb',
		badgeText: '#999999',
		annBg: 'rgba(30,117,79,0.1)',
		annBorder: '#1e754f',
		annHover: 'rgba(30,117,79,0.2)',
	},
} satisfies CodeGlossTheme;

export default vitesseLight;
