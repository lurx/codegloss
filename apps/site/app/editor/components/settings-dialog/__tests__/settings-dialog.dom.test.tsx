// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditorConfig } from '../../../hooks/use-editor-state';
import { SettingsDialog } from '../settings-dialog.component';

function baseConfig(overrides: Partial<EditorConfig> = {}): EditorConfig {
	return {
		code: 'x',
		lang: 'js',
		annotations: [],
		connections: [],
		...overrides,
	};
}

beforeEach(() => {
	if (!HTMLDialogElement.prototype.showModal) {
		HTMLDialogElement.prototype.showModal = function showModal() {
			this.setAttribute('open', '');
		};
	}
	if (!HTMLDialogElement.prototype.close) {
		HTMLDialogElement.prototype.close = function close() {
			this.removeAttribute('open');
		};
	}
});

afterEach(() => cleanup());

describe('SettingsDialog patches', () => {
	it('forwards a non-auto theme value directly', () => {
		const onPatch = vi.fn();
		render(
			<SettingsDialog
				open={true}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);
		const theme = screen.getByLabelText('Theme') as HTMLSelectElement;
		const concrete = Array.from(theme.options)
			.map((o) => o.value)
			.find((v) => v !== '');
		if (!concrete) throw new Error('no concrete theme option in fixture');
		fireEvent.change(theme, { target: { value: concrete } });
		expect(onPatch).toHaveBeenCalledWith({ theme: concrete });
	});

	it('emits theme patches, coercing the "auto" sentinel to undefined', () => {
		const onPatch = vi.fn();
		render(
			<SettingsDialog
				open={true}
				config={baseConfig({ theme: 'dark' })}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);
		const themeSelect = screen.getByLabelText('Theme') as HTMLSelectElement;
		fireEvent.change(themeSelect, { target: { value: '' } });
		expect(onPatch).toHaveBeenCalledWith({ theme: undefined });
	});

	it('emits arcs patches for numeric fields and the strokeDasharray input', () => {
		const onPatch = vi.fn();
		render(
			<SettingsDialog
				open={true}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);

		const dot = document.querySelector<HTMLInputElement>(
			'input[type="number"][step="0.5"]',
		)!;
		fireEvent.change(dot, { target: { value: '3' } });
		expect(onPatch).toHaveBeenLastCalledWith({ arcs: { dotRadius: 3 } });

		const dash = screen.getByPlaceholderText('e.g. 4 2') as HTMLInputElement;
		fireEvent.change(dash, { target: { value: '4 2' } });
		expect(onPatch).toHaveBeenLastCalledWith({
			arcs: { strokeDasharray: '4 2' },
		});
	});

	it('clearing strokeDasharray drops the key and collapses empty arcs to undefined', () => {
		const onPatch = vi.fn();
		render(
			<SettingsDialog
				open={true}
				config={baseConfig({ arcs: { strokeDasharray: '4 2' } })}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);
		const dash = screen.getByPlaceholderText('e.g. 4 2') as HTMLInputElement;
		fireEvent.change(dash, { target: { value: '' } });
		expect(onPatch).toHaveBeenLastCalledWith({ arcs: undefined });
	});

	it('toggles the arcs arrowhead checkbox into the patch payload', () => {
		const onPatch = vi.fn();
		render(
			<SettingsDialog
				open={true}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);
		const arrowhead = screen.getByLabelText(/arrowhead/) as HTMLInputElement;
		fireEvent.click(arrowhead);
		expect(onPatch).toHaveBeenLastCalledWith({ arcs: { arrowhead: true } });
	});

	it('unchecks arrowhead by sending undefined in the patch', () => {
		const onPatch = vi.fn();
		render(
			<SettingsDialog
				open={true}
				config={baseConfig({ arcs: { arrowhead: true } })}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);
		const arrowhead = screen.getByLabelText(/arrowhead/) as HTMLInputElement;
		fireEvent.click(arrowhead);
		expect(onPatch).toHaveBeenLastCalledWith({ arcs: undefined });
	});

	it('dispatches arcs patches for every numeric field', () => {
		const onPatch = vi.fn();
		render(
			<SettingsDialog
				open={true}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);
		const numbers = Array.from(
			document.querySelectorAll<HTMLInputElement>('input[type="number"]'),
		);
		// dotRadius, dotOpacity, strokeWidth, opacity
		expect(numbers).toHaveLength(4);
		fireEvent.change(numbers[1], { target: { value: '0.4' } });
		fireEvent.change(numbers[2], { target: { value: '1.5' } });
		fireEvent.change(numbers[3], { target: { value: '0.8' } });
		expect(onPatch.mock.calls.map((c) => c[0].arcs)).toEqual([
			{ dotOpacity: 0.4 },
			{ strokeWidth: 1.5 },
			{ opacity: 0.8 },
		]);
	});

	it('toggles callouts.popover and collapses to undefined when unchecked', () => {
		const onPatch = vi.fn();
		const { rerender } = render(
			<SettingsDialog
				open={true}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);
		fireEvent.click(screen.getByLabelText(/popover by default/));
		expect(onPatch).toHaveBeenLastCalledWith({
			callouts: { popover: true },
		});

		rerender(
			<SettingsDialog
				open={true}
				config={baseConfig({ callouts: { popover: true } })}
				onCloseAction={vi.fn()}
				onPatchAction={onPatch}
			/>,
		);
		fireEvent.click(screen.getByLabelText(/popover by default/));
		expect(onPatch).toHaveBeenLastCalledWith({ callouts: undefined });
	});

	it('renders without opening the dialog when open starts false', () => {
		render(
			<SettingsDialog
				open={false}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={vi.fn()}
			/>,
		);
		const dialog = document.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.hasAttribute('open')).toBe(false);
	});

	it('closes the native dialog when open flips back to false', () => {
		const { rerender } = render(
			<SettingsDialog
				open={true}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={vi.fn()}
			/>,
		);
		const dialog = document.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.hasAttribute('open')).toBe(true);

		rerender(
			<SettingsDialog
				open={false}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={vi.fn()}
			/>,
		);
		expect(dialog.hasAttribute('open')).toBe(false);
	});

	it('copies the config file and resets the Copied label after the timeout', async () => {
		vi.useFakeTimers();
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText },
		});

		render(
			<SettingsDialog
				open={true}
				config={baseConfig({ theme: 'dark' })}
				onCloseAction={vi.fn()}
				onPatchAction={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: /Copy/ }));
		await vi.waitFor(() =>
			expect(screen.getByRole('button', { name: /Copied/ })).toBeTruthy(),
		);
		expect(writeText).toHaveBeenCalledWith(
			expect.stringContaining('theme: "dark"'),
		);

		vi.advanceTimersByTime(1500);
		await vi.waitFor(() =>
			expect(screen.getByRole('button', { name: /Copy$/ })).toBeTruthy(),
		);
		vi.useRealTimers();
	});

	it('clears the Copied state if the clipboard rejects', async () => {
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
		});

		render(
			<SettingsDialog
				open={true}
				config={baseConfig()}
				onCloseAction={vi.fn()}
				onPatchAction={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: /Copy/ }));
		// after the rejected promise settles the button stays as "Copy"
		await new Promise((r) => setTimeout(r, 0));
		expect(screen.getByRole('button', { name: /Copy/ })).toBeTruthy();
	});

	it('Done triggers onCloseAction', () => {
		const onClose = vi.fn();
		render(
			<SettingsDialog
				open={true}
				config={baseConfig()}
				onCloseAction={onClose}
				onPatchAction={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Done' }));
		expect(onClose).toHaveBeenCalled();
	});
});
