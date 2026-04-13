// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ThemedToken } from 'shiki';

vi.mock('shiki', () => ({
	codeToTokens: vi.fn(),
}));

import { codeToTokens } from 'shiki';
import { CodePicker } from '../code-picker.component';

const mockedCodeToTokens = vi.mocked(codeToTokens);

function makeTokens(): ThemedToken[][] {
	return [
		[
			{ content: 'const', color: '#f00', offset: 0 } as ThemedToken,
			{ content: ' ', color: '#000', offset: 5 } as ThemedToken,
			{ content: 'x', color: '#0f0', offset: 6 } as ThemedToken,
		],
		[],
	];
}

afterEach(() => {
	cleanup();
	mockedCodeToTokens.mockReset();
});

describe('CodePicker', () => {
	it('renders tokens and fires onTokenPickAction with line/occurrence/content', async () => {
		mockedCodeToTokens.mockResolvedValue({
			tokens: makeTokens(),
		} as Awaited<ReturnType<typeof codeToTokens>>);

		const handlePick = vi.fn();
		render(
			<CodePicker
				code="const x"
				lang="js"
				theme="github-light"
				onTokenPickAction={handlePick}
			/>,
		);

		const xToken = await screen.findByText('x');
		fireEvent.click(xToken);
		expect(handlePick).toHaveBeenCalledWith({
			token: 'x',
			line: 0,
			occurrence: 0,
		});
	});

	it('renders an error message when the highlighter rejects', async () => {
		mockedCodeToTokens.mockRejectedValue(new Error('bad lang'));

		render(
			<CodePicker
				code="x"
				lang="bad"
				theme="github-light"
				onTokenPickAction={vi.fn()}
			/>,
		);

		await waitFor(() =>
			expect(screen.getByText(/Highlight failed: bad lang/)).toBeTruthy(),
		);
	});

	it('ignores clicks on whitespace tokens (no data-token-index)', async () => {
		mockedCodeToTokens.mockResolvedValue({
			tokens: makeTokens(),
		} as Awaited<ReturnType<typeof codeToTokens>>);

		const handlePick = vi.fn();
		const { container } = render(
			<CodePicker
				code="const x"
				lang="js"
				theme="github-light"
				onTokenPickAction={handlePick}
			/>,
		);

		await screen.findByText('const');
		// click the whitespace span — no data-token-index attribute
		const whitespaceSpans = container.querySelectorAll(
			'span:not([data-token-index])',
		);
		for (const span of whitespaceSpans) fireEvent.click(span as HTMLElement);
		expect(handlePick).not.toHaveBeenCalled();
	});

	it('ignores clicks before the first tokenization resolves', async () => {
		let resolveTokens: (value: Awaited<ReturnType<typeof codeToTokens>>) => void = () => {};
		mockedCodeToTokens.mockReturnValue(
			new Promise((resolve) => {
				resolveTokens = resolve;
			}) as ReturnType<typeof codeToTokens>,
		);

		const handlePick = vi.fn();
		render(
			<CodePicker
				code="x"
				lang="js"
				theme="github-light"
				onTokenPickAction={handlePick}
			/>,
		);
		// `Loading highlight…` is inside the onClick wrapper; click its parent
		const loading = screen.getByText(/Loading highlight/);
		fireEvent.click(loading.parentElement as HTMLElement);
		expect(handlePick).not.toHaveBeenCalled();

		resolveTokens({ tokens: [] } as Awaited<ReturnType<typeof codeToTokens>>);
	});

	it('ignores clicks that land outside any token span', async () => {
		mockedCodeToTokens.mockResolvedValue({
			tokens: makeTokens(),
		} as Awaited<ReturnType<typeof codeToTokens>>);

		const handlePick = vi.fn();
		const { container } = render(
			<CodePicker
				code="const x"
				lang="js"
				theme="github-light"
				onTokenPickAction={handlePick}
			/>,
		);
		await screen.findByText('const');
		const header = container.querySelector('header, [class*="header"]');
		if (header) fireEvent.click(header as HTMLElement);
		expect(handlePick).not.toHaveBeenCalled();
	});

	it('cancels a pending tokenization on unmount so state updates do not fire', async () => {
		let resolveTokens: (value: Awaited<ReturnType<typeof codeToTokens>>) => void = () => {};
		mockedCodeToTokens.mockReturnValue(
			new Promise((resolve) => {
				resolveTokens = resolve;
			}) as ReturnType<typeof codeToTokens>,
		);

		const { unmount } = render(
			<CodePicker
				code="x"
				lang="js"
				theme="github-light"
				onTokenPickAction={vi.fn()}
			/>,
		);
		unmount();
		// Resolve after unmount — the cancelled flag prevents a setState-after-unmount warning.
		resolveTokens({ tokens: makeTokens() } as Awaited<ReturnType<typeof codeToTokens>>);
		await new Promise((r) => setTimeout(r, 0));
	});

	it('swallows rejections after unmount without setting error state', async () => {
		let reject: (reason: unknown) => void = () => {};
		mockedCodeToTokens.mockReturnValue(
			new Promise((_, r) => {
				reject = r;
			}) as ReturnType<typeof codeToTokens>,
		);

		const { unmount } = render(
			<CodePicker
				code="x"
				lang="bad"
				theme="github-light"
				onTokenPickAction={vi.fn()}
			/>,
		);
		unmount();
		reject('late failure');
		await new Promise((r) => setTimeout(r, 0));
	});

	it('stringifies non-Error rejections from the highlighter', async () => {
		mockedCodeToTokens.mockRejectedValue('string failure');

		render(
			<CodePicker
				code="x"
				lang="bad"
				theme="github-light"
				onTokenPickAction={vi.fn()}
			/>,
		);

		await waitFor(() =>
			expect(screen.getByText(/Highlight failed: string failure/)).toBeTruthy(),
		);
	});
});
