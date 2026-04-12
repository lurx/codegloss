import type { CodeGlossTheme } from './theme.types';

const nordDarkTheme = {
	name: 'nord-dark',
	dark: {
		keyword: '#81a1c1',
		string: '#a3be8c',
		number: '#b48ead',
		comment: '#616e88',
		bg: '#2e3440',
		text: '#d8dee9',
		border: '#3b4252',
		muted: '#616e88',
		lineNum: '#4c566a',
		toolbarBg: '#292e39',
		badgeBg: '#3b4252',
		badgeText: '#616e88',
		annBg: 'rgba(136,192,208,0.12)',
		annBorder: '#88c0d0',
		annHover: 'rgba(136,192,208,0.22)',
	},
} satisfies CodeGlossTheme;

export default nordDarkTheme;
