import type { CodeGlossTheme } from './theme.types';

const oneDarkTheme = {
	name: 'one-dark',
	dark: {
		keyword: '#c678dd',
		string: '#98c379',
		number: '#d19a66',
		comment: '#5c6370',
		bg: '#282c34',
		text: '#abb2bf',
		border: '#3e4451',
		muted: '#5c6370',
		lineNum: '#4b5263',
		toolbarBg: '#21252b',
		badgeBg: '#2c313a',
		badgeText: '#5c6370',
		annBg: 'rgba(97,175,239,0.12)',
		annBorder: '#61afef',
		annHover: 'rgba(97,175,239,0.22)',
	},
} satisfies CodeGlossTheme;

export default oneDarkTheme;
