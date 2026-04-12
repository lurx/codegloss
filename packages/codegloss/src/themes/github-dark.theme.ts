import type { CodeGlossTheme } from './theme.types';

const githubDarkTheme = {
	name: 'github-dark',
	dark: {
		keyword: '#ff7b72',
		string: '#a5d6ff',
		number: '#79c0ff',
		comment: '#8b949e',
		bg: '#0d1117',
		text: '#e6edf3',
		border: '#30363d',
		muted: '#8b949e',
		lineNum: '#6e7681',
		toolbarBg: '#161b22',
		badgeBg: '#21262d',
		badgeText: '#8b949e',
		annBg: 'rgba(56,139,253,0.15)',
		annBorder: '#388bfd',
		annHover: 'rgba(56,139,253,0.25)',
	},
} satisfies CodeGlossTheme;

export default githubDarkTheme;
