export type CodeGlossThemeVariant = {
	/** Syntax token colors */
	keyword: string;
	string: string;
	number: string;
	comment: string;

	/** Chrome — maps to --cg-* CSS variables */
	bg: string;
	text: string;
	border: string;
	muted: string;
	lineNum: string;
	toolbarBg: string;
	badgeBg: string;
	badgeText: string;
	annBg: string;
	annBorder: string;
	annHover: string;
};

export type CodeGlossTheme = {
	name: string;
	light?: CodeGlossThemeVariant;
	dark?: CodeGlossThemeVariant;
};
