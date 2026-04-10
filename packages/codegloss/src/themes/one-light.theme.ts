import type { CodeGlossTheme } from './theme.types';

const oneLightTheme = {
	name: 'one-light',
	light: {
		keyword: '#a626a4',
		string: '#50a14f',
		number: '#986801',
		comment: '#a0a1a7',
		bg: '#fafafa',
		text: '#383a42',
		border: '#e0e0e0',
		muted: '#a0a1a7',
		lineNum: '#9d9d9f',
		toolbarBg: '#f0f0f0',
		badgeBg: '#e5e5e6',
		badgeText: '#a0a1a7',
		annBg: 'rgba(64,120,242,0.1)',
		annBorder: '#4078f2',
		annHover: 'rgba(64,120,242,0.2)',
	},
} satisfies CodeGlossTheme;

export default oneLightTheme;
