import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useEditorState } from '../use-editor-state.hook';
import type { EditorConfig } from '../use-editor-state.types';

const STORAGE_KEY = 'codegloss:editor:draft';

function makeConfig(overrides: Partial<EditorConfig> = {}): EditorConfig {
	return {
		code: 'x',
		lang: 'js',
		annotations: [],
		connections: [],
		...overrides,
	};
}

beforeEach(() => {
	globalThis.localStorage.clear();
});

afterEach(() => {
	globalThis.localStorage.clear();
});

describe('useEditorState initial state', () => {
	it('starts with the greet.js sample and empty history', () => {
		const { result } = renderHook(() => useEditorState());
		expect(result.current.config.filename).toBe('greet.js');
		expect(result.current.config.lang).toBe('js');
		expect(result.current.canUndo).toBe(false);
		expect(result.current.canRedo).toBe(false);
	});

	it('rehydrates from localStorage when a valid draft exists', () => {
		globalThis.localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify(
				makeConfig({ code: 'stored', lang: 'ts', filename: 'stored.ts' }),
			),
		);
		const { result } = renderHook(() => useEditorState());
		expect(result.current.config.code).toBe('stored');
		expect(result.current.config.filename).toBe('stored.ts');
	});

	it('ignores persisted drafts missing code or lang', () => {
		globalThis.localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ code: 'x' }),
		);
		const { result } = renderHook(() => useEditorState());
		expect(result.current.config.filename).toBe('greet.js');
	});

	it('defaults missing annotations/connections arrays when rehydrating', () => {
		globalThis.localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ code: 'x', lang: 'js' }),
		);
		const { result } = renderHook(() => useEditorState());
		expect(result.current.config.annotations).toEqual([]);
		expect(result.current.config.connections).toEqual([]);
	});

	it('ignores malformed JSON in localStorage', () => {
		globalThis.localStorage.setItem(STORAGE_KEY, '{not json');
		const { result } = renderHook(() => useEditorState());
		expect(result.current.config.filename).toBe('greet.js');
	});
});

describe('useEditorState actions', () => {
	it('setCode/setLang/setFilename/setRunnable update the config', () => {
		const { result } = renderHook(() => useEditorState());
		act(() => result.current.setCodeAction('A'));
		act(() => result.current.setLangAction('ts'));
		act(() => result.current.setFilenameAction('x.ts'));
		act(() => result.current.setRunnableAction(false));
		expect(result.current.config).toMatchObject({
			code: 'A',
			lang: 'ts',
			filename: 'x.ts',
			runnable: false,
		});
	});

	it('patchConfig merges partial fields', () => {
		const { result } = renderHook(() => useEditorState());
		act(() =>
			result.current.patchConfigAction({ theme: 'dark', filename: 'p.js' }),
		);
		expect(result.current.config.theme).toBe('dark');
		expect(result.current.config.filename).toBe('p.js');
	});

	it('replaceConfig swaps the whole config', () => {
		const { result } = renderHook(() => useEditorState());
		const next = makeConfig({ code: 'new', lang: 'ts' });
		act(() => result.current.replaceConfigAction(next));
		expect(result.current.config).toEqual(next);
	});

	it('add/update/remove annotation actions mutate the array', () => {
		const { result } = renderHook(() => useEditorState());
		act(() =>
			result.current.addAnnotationAction({
				id: 'a1',
				token: 'x',
				line: 0,
				occurrence: 0,
			}),
		);
		expect(result.current.config.annotations).toHaveLength(1);

		act(() =>
			result.current.updateAnnotationAction(0, {
				id: 'a1',
				token: 'y',
				line: 1,
				occurrence: 0,
			}),
		);
		expect(result.current.config.annotations[0].token).toBe('y');

		act(() => result.current.removeAnnotationAction(0));
		expect(result.current.config.annotations).toEqual([]);
	});

	it('removing an annotation drops connections that reference it', () => {
		const { result } = renderHook(() => useEditorState());
		act(() =>
			result.current.addAnnotationAction({
				id: 'a1',
				token: 'x',
				line: 0,
				occurrence: 0,
			}),
		);
		act(() =>
			result.current.addAnnotationAction({
				id: 'a2',
				token: 'y',
				line: 0,
				occurrence: 0,
			}),
		);
		act(() =>
			result.current.addConnectionAction({
				from: 'a1',
				to: 'a2',
				color: '#000',
			}),
		);

		act(() => result.current.removeAnnotationAction(0));
		expect(result.current.config.connections).toEqual([]);
	});

	it('removes connections whose `to` points at the removed annotation', () => {
		const { result } = renderHook(() => useEditorState());
		act(() =>
			result.current.addAnnotationAction({
				id: 'a1',
				token: 'x',
				line: 0,
				occurrence: 0,
			}),
		);
		act(() =>
			result.current.addAnnotationAction({
				id: 'a2',
				token: 'y',
				line: 0,
				occurrence: 0,
			}),
		);
		act(() =>
			result.current.addConnectionAction({
				from: 'a1',
				to: 'a2',
				color: '#000',
			}),
		);
		// remove a2 (index 1) — connection's `to` points at it
		act(() => result.current.removeAnnotationAction(1));
		expect(result.current.config.connections).toEqual([]);
	});

	it('removing at an out-of-range index keeps connections intact', () => {
		const { result } = renderHook(() => useEditorState());
		act(() =>
			result.current.addAnnotationAction({
				id: 'a1',
				token: 'x',
				line: 0,
				occurrence: 0,
			}),
		);
		act(() =>
			result.current.addConnectionAction({
				from: 'a1',
				to: 'a1',
				color: '#000',
			}),
		);

		act(() => result.current.removeAnnotationAction(99));
		expect(result.current.config.connections).toHaveLength(1);
	});

	it('add/update/remove connection actions mutate the array', () => {
		const { result } = renderHook(() => useEditorState());
		act(() =>
			result.current.addConnectionAction({
				from: 'a',
				to: 'b',
				color: '#000',
			}),
		);
		act(() =>
			result.current.updateConnectionAction(0, {
				from: 'a',
				to: 'b',
				color: '#111',
			}),
		);
		expect(result.current.config.connections[0].color).toBe('#111');

		act(() => result.current.removeConnectionAction(0));
		expect(result.current.config.connections).toEqual([]);
	});
});

describe('useEditorState history', () => {
	it('undo reverses the last action; redo re-applies it', () => {
		const { result } = renderHook(() => useEditorState());
		act(() => result.current.setLangAction('ts'));
		expect(result.current.config.lang).toBe('ts');
		expect(result.current.canUndo).toBe(true);

		act(() => result.current.undoAction());
		expect(result.current.config.lang).toBe('js');
		expect(result.current.canRedo).toBe(true);

		act(() => result.current.redoAction());
		expect(result.current.config.lang).toBe('ts');
	});

	it('undo and redo no-op when the stack is empty', () => {
		const { result } = renderHook(() => useEditorState());
		act(() => result.current.undoAction());
		act(() => result.current.redoAction());
		expect(result.current.canUndo).toBe(false);
		expect(result.current.canRedo).toBe(false);
	});

	it('caps the history at 20 entries', () => {
		const { result } = renderHook(() => useEditorState());
		for (let i = 0; i < 25; i += 1) {
			act(() => result.current.setLangAction(`l${i}`));
		}
		for (let i = 0; i < 25; i += 1) {
			act(() => result.current.undoAction());
		}
		// only 20 of the 25 steps are reversible; the earliest states were dropped
		expect(result.current.config.lang).toBe('l4');
	});
});

describe('useEditorState persistence', () => {
	it('writes every change back to localStorage', () => {
		const { result } = renderHook(() => useEditorState());
		act(() => result.current.setFilenameAction('persisted.ts'));

		const raw = globalThis.localStorage.getItem(STORAGE_KEY);
		expect(raw).not.toBeNull();
		expect(JSON.parse(raw as string).filename).toBe('persisted.ts');
	});
});
