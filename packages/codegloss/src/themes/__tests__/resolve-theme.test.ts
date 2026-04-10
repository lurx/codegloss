import { describe, it, expect } from 'vitest';
import { resolveTheme } from '../index';

describe('resolveTheme', () => {
	it('resolves a known theme by name', () => {
		const theme = resolveTheme('github-dark');
		expect(theme).toBeDefined();
		expect(theme!.name).toBe('github-dark');
		expect(theme!.dark).toBeDefined();
	});

	it('returns undefined for an unknown theme', () => {
		expect(resolveTheme('nonexistent-theme')).toBeUndefined();
	});

	it.each([
		'github-light',
		'github-dark',
		'one-light',
		'one-dark',
		'dracula',
		'nord-light',
		'nord-dark',
		'vitesse-light',
		'vitesse-dark',
	])('resolves bundled theme "%s"', name => {
		const theme = resolveTheme(name);
		expect(theme).toBeDefined();
		expect(theme!.name).toBe(name);
	});

	it('each theme has at least one variant', () => {
		const names = [
			'github-light',
			'github-dark',
			'one-light',
			'one-dark',
			'dracula',
			'nord-light',
			'nord-dark',
			'vitesse-light',
			'vitesse-dark',
		];

		for (const name of names) {
			const theme = resolveTheme(name);
			expect(
				theme!.light ?? theme!.dark,
				`${name} should have at least one variant`,
			).toBeDefined();
		}
	});

	it('each variant has all required color fields', () => {
		const requiredFields = [
			'keyword',
			'string',
			'number',
			'comment',
			'bg',
			'text',
			'border',
			'muted',
			'lineNum',
			'toolbarBg',
			'badgeBg',
			'badgeText',
			'annBg',
			'annBorder',
			'annHover',
		] as const;

		const theme = resolveTheme('github-light');
		const variant = theme!.light!;

		for (const field of requiredFields) {
			expect(variant[field], `missing field: ${field}`).toBeDefined();
			expect(typeof variant[field]).toBe('string');
		}
	});
});
