import { describe, it, expect } from 'vitest';
import { buildThemeCss } from '../theme-css.helpers';
import type { CodeGlossThemeVariant } from '../theme.types';

const light: CodeGlossThemeVariant = {
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
};

const dark: CodeGlossThemeVariant = {
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
};

describe('buildThemeCss', () => {
	it('returns empty string when both variants are undefined', () => {
		expect(buildThemeCss(undefined, undefined)).toBe('');
	});

	it('generates CSS for a light-only theme', () => {
		const css = buildThemeCss(light, undefined);
		expect(css).toContain('--cg-bg: #ffffff');
		expect(css).toContain('.cg-keyword { color: #cf222e; }');
		expect(css).not.toContain('@media');
	});

	it('generates CSS for a dark-only theme', () => {
		const css = buildThemeCss(undefined, dark);
		expect(css).toContain('--cg-bg: #0d1117');
		expect(css).toContain('.cg-keyword { color: #ff7b72; }');
		expect(css).not.toContain('@media');
	});

	it('wraps dark variant in a media query when both are provided', () => {
		const css = buildThemeCss(light, dark);
		expect(css).toContain('--cg-bg: #ffffff');
		expect(css).toContain('@media (prefers-color-scheme: dark)');
		expect(css).toContain('--cg-bg: #0d1117');
	});

	it('sets all chrome CSS variables', () => {
		const css = buildThemeCss(light, undefined);
		const expectedVars = [
			'--cg-bg',
			'--cg-text',
			'--cg-border',
			'--cg-muted',
			'--cg-line-num',
			'--cg-toolbar-bg',
			'--cg-badge-bg',
			'--cg-badge-text',
			'--cg-ann-bg',
			'--cg-ann-border',
			'--cg-ann-hover',
		];

		for (const v of expectedVars) {
			expect(css).toContain(v);
		}
	});

	it('sets all four token classes', () => {
		const css = buildThemeCss(light, undefined);
		expect(css).toContain('.cg-keyword');
		expect(css).toContain('.cg-string');
		expect(css).toContain('.cg-number');
		expect(css).toContain('.cg-comment');
	});
});
