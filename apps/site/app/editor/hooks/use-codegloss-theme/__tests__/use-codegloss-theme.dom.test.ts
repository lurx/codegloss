// @vitest-environment happy-dom
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks', () => ({
	useSiteTheme: vi.fn(),
}));

vi.mock('@/codegloss.config', () => ({
	default: { theme: 'github-light', darkTheme: 'github-dark' },
}));

import { useSiteTheme } from '@/hooks';
import { useCodeglossTheme } from '../use-codegloss-theme.hook';

const mockedUseSiteTheme = vi.mocked(useSiteTheme);

beforeEach(() => {
	mockedUseSiteTheme.mockReset();
});

describe('useCodeglossTheme', () => {
	it('returns the dark theme when the site theme is dark', () => {
		mockedUseSiteTheme.mockReturnValue('dark');
		const { result } = renderHook(() => useCodeglossTheme());
		expect(result.current).toBe('github-dark');
	});

	it('returns the light theme otherwise', () => {
		mockedUseSiteTheme.mockReturnValue('light');
		const { result } = renderHook(() => useCodeglossTheme());
		expect(result.current).toBe('github-light');
	});
});
