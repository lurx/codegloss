import type { CodeGlossTheme } from './theme.types';

const draculaTheme = {
	name: 'dracula',
	dark: {
		keyword: '#ff79c6',
		string: '#f1fa8c',
		number: '#bd93f9',
		comment: '#6272a4',
		bg: '#282a36',
		text: '#f8f8f2',
		border: '#44475a',
		muted: '#6272a4',
		lineNum: '#6272a4',
		toolbarBg: '#21222c',
		badgeBg: '#44475a',
		badgeText: '#6272a4',
		annBg: 'rgba(139,233,253,0.12)',
		annBorder: '#8be9fd',
		annHover: 'rgba(139,233,253,0.22)',
	},
} satisfies CodeGlossTheme;

export default draculaTheme;
