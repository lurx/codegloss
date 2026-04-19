import { describe, expect, it } from 'vitest';
import {
	styleOverridesToCssVars,
	styleOverridesToInlineStyle,
} from '../style-overrides.helpers';

describe('styleOverridesToCssVars', () => {
	it('returns an empty array when overrides is undefined', () => {
		expect(styleOverridesToCssVars(undefined)).toEqual([]);
	});

	it('returns an empty array when every group is empty', () => {
		expect(styleOverridesToCssVars({})).toEqual([]);
		expect(styleOverridesToCssVars({ codeBlock: {} })).toEqual([]);
	});

	it('maps codeBlock fields to their --cg-* custom properties', () => {
		expect(
			styleOverridesToCssVars({
				codeBlock: {
					background: 'var(--my-bg)',
					foreground: '#111',
					border: '1px solid #333',
					borderRadius: '4px',
					toolbarBackground: 'var(--my-toolbar)',
					mutedForeground: '#666',
				},
			}),
		).toEqual([
			['--cg-bg', 'var(--my-bg)'],
			['--cg-text', '#111'],
			['--cg-border', '1px solid #333'],
			['--cg-radius', '4px'],
			['--cg-toolbar-bg', 'var(--my-toolbar)'],
			['--cg-muted', '#666'],
		]);
	});

	it('maps annotation marker fields', () => {
		expect(
			styleOverridesToCssVars({
				annotations: {
					markerBackground: 'rgba(0, 0, 255, 0.1)',
					markerBorder: 'blue',
					markerHover: 'rgba(0, 0, 255, 0.2)',
				},
			}),
		).toEqual([
			['--cg-ann-bg', 'rgba(0, 0, 255, 0.1)'],
			['--cg-ann-border', 'blue'],
			['--cg-ann-hover', 'rgba(0, 0, 255, 0.2)'],
		]);
	});

	it('maps badge and lineNumbers fields', () => {
		expect(
			styleOverridesToCssVars({
				badge: { background: 'silver', foreground: 'black' },
				lineNumbers: { foreground: 'gray' },
			}),
		).toEqual([
			['--cg-badge-bg', 'silver'],
			['--cg-badge-text', 'black'],
			['--cg-line-num', 'gray'],
		]);
	});

	it('skips unset fields inside a partially-populated group', () => {
		expect(
			styleOverridesToCssVars({
				codeBlock: { background: '#fff' },
			}),
		).toEqual([['--cg-bg', '#fff']]);
	});

	it('skips empty-string values and non-string values', () => {
		expect(
			styleOverridesToCssVars({
				codeBlock: {
					background: '',
					// @ts-expect-error — covers the typeof check at runtime
					foreground: 0,
				},
			}),
		).toEqual([]);
	});
});

describe('styleOverridesToInlineStyle', () => {
	it('returns undefined when there are no overrides', () => {
		expect(styleOverridesToInlineStyle(undefined)).toBeUndefined();
		expect(styleOverridesToInlineStyle({})).toBeUndefined();
	});

	it('joins CSS var assignments with "; "', () => {
		expect(
			styleOverridesToInlineStyle({
				codeBlock: { background: 'var(--bg)', foreground: '#111' },
			}),
		).toBe('--cg-bg: var(--bg); --cg-text: #111');
	});
});
