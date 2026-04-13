// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportDialog } from '../import-dialog.component';

beforeEach(() => {
	// jsdom-like showModal / close polyfills — happy-dom implements them but
	// guard in case future runs drop in a stricter shim
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

describe('ImportDialog', () => {
	it('opens via showModal when `open` flips to true and clears state each time', () => {
		const onClose = vi.fn();
		const onImport = vi.fn();
		const { rerender } = render(
			<ImportDialog
				open={false}
				onCloseAction={onClose}
				onImportAction={onImport}
			/>,
		);

		rerender(
			<ImportDialog
				open={true}
				onCloseAction={onClose}
				onImportAction={onImport}
			/>,
		);
		const dialog = document.querySelector('dialog');
		expect(dialog?.hasAttribute('open')).toBe(true);
	});

	it('disables Import while the textarea is empty and enables after typing', () => {
		render(
			<ImportDialog
				open={true}
				onCloseAction={vi.fn()}
				onImportAction={vi.fn()}
			/>,
		);
		const importButton = screen.getByRole('button', { name: 'Import' });
		expect((importButton as HTMLButtonElement).disabled).toBe(true);

		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		fireEvent.change(textarea, {
			target: { value: '{"code":"x","lang":"js"}' },
		});
		expect((importButton as HTMLButtonElement).disabled).toBe(false);
	});

	it('surfaces an import error and keeps the dialog open', () => {
		const onImport = vi.fn();
		const onClose = vi.fn();
		render(
			<ImportDialog
				open={true}
				onCloseAction={onClose}
				onImportAction={onImport}
			/>,
		);
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'not valid at all' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Import' }));

		expect(onImport).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();
		expect(screen.getByText(/MDX:|JSON:|JSX:/)).toBeTruthy();
	});

	it('forwards a successful import and closes the dialog', () => {
		const onImport = vi.fn();
		const onClose = vi.fn();
		render(
			<ImportDialog
				open={true}
				onCloseAction={onClose}
				onImportAction={onImport}
			/>,
		);
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: JSON.stringify({ code: 'x', lang: 'js' }) },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Import' }));

		expect(onImport).toHaveBeenCalledTimes(1);
		const config = onImport.mock.calls[0][0];
		expect(config.code).toBe('x');
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('resets the textarea and cleared error state when reopened', () => {
		const { rerender } = render(
			<ImportDialog
				open={true}
				onCloseAction={vi.fn()}
				onImportAction={vi.fn()}
			/>,
		);
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'garbage' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Import' }));
		expect(screen.getByText(/MDX:|JSON:|JSX:/)).toBeTruthy();

		rerender(
			<ImportDialog
				open={false}
				onCloseAction={vi.fn()}
				onImportAction={vi.fn()}
			/>,
		);
		rerender(
			<ImportDialog
				open={true}
				onCloseAction={vi.fn()}
				onImportAction={vi.fn()}
			/>,
		);
		const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
		expect(textarea.value).toBe('');
	});

	it('closes the native dialog when open flips back to false', () => {
		const { rerender } = render(
			<ImportDialog
				open={true}
				onCloseAction={vi.fn()}
				onImportAction={vi.fn()}
			/>,
		);
		const dialog = document.querySelector('dialog') as HTMLDialogElement;
		expect(dialog.hasAttribute('open')).toBe(true);

		rerender(
			<ImportDialog
				open={false}
				onCloseAction={vi.fn()}
				onImportAction={vi.fn()}
			/>,
		);
		expect(dialog.hasAttribute('open')).toBe(false);
	});

	it('fires onCloseAction from Cancel', () => {
		const onClose = vi.fn();
		render(
			<ImportDialog
				open={true}
				onCloseAction={onClose}
				onImportAction={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onClose).toHaveBeenCalled();
	});
});
