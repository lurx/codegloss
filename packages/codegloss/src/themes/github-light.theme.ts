import type { CodeGlossTheme } from './theme.types';

const githubLightTheme = {
	name: 'github-light',
	light: {
		keyword: '#cf222e',
		string: '#0a3069',
		number: '#0550ae',
		comment: '#6e7781',
		bg: '#ffffff',
		text: '#1f2328',
		border: '#d1d9e0',
		muted: '#656d76',
		lineNum: '#8c959f',
		toolbarBg: '#f6f8fa',
		badgeBg: '#eef1f4',
		badgeText: '#656d76',
		annBg: 'rgba(9,105,218,0.1)',
		annBorder: '#0969da',
		annHover: 'rgba(9,105,218,0.2)',
	},
} satisfies CodeGlossTheme;

export default githubLightTheme;
