import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type {
	EditorAction,
	EditorConfig,
	EditorState,
	UseEditorStateResult,
} from './use-editor-state.types';

const STORAGE_KEY = 'codegloss:editor:draft';
const MAX_HISTORY = 20;

function loadPersistedConfig(): EditorConfig | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as EditorConfig;
		if (typeof parsed.code !== 'string' || typeof parsed.lang !== 'string') {
			return null;
		}
		return {
			...parsed,
			annotations: Array.isArray(parsed.annotations) ? parsed.annotations : [],
			connections: Array.isArray(parsed.connections) ? parsed.connections : [],
		};
	} catch {
		return null;
	}
}

function writePersistedConfig(config: EditorConfig): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	} catch {
		// swallow — quota or disabled storage
	}
}

const INITIAL_CODE = `function greet(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}`;

const INITIAL_PRESENT: EditorConfig = {
	code: INITIAL_CODE,
	lang: 'js',
	filename: 'greet.js',
	runnable: true,
	annotations: [],
	connections: [],
};

const INITIAL_STATE: EditorState = {
	past: [],
	present: INITIAL_PRESENT,
	future: [],
};

function applyToPresent(
	present: EditorConfig,
	action: EditorAction,
): EditorConfig {
	switch (action.kind) {
		case 'replaceConfig':
			return action.value;
		case 'patchConfig':
			return { ...present, ...action.value };
		case 'setCode':
			return { ...present, code: action.value };
		case 'setLang':
			return { ...present, lang: action.value };
		case 'setFilename':
			return { ...present, filename: action.value };
		case 'setRunnable':
			return { ...present, runnable: action.value };
		case 'addAnnotation':
			return {
				...present,
				annotations: [...present.annotations, action.value],
			};
		case 'updateAnnotation': {
			const annotations = present.annotations.slice();
			annotations[action.index] = action.value;
			return { ...present, annotations };
		}
		case 'removeAnnotation': {
			const removed = present.annotations[action.index];
			const annotations = present.annotations.filter(
				(_, i) => i !== action.index,
			);
			const connections = removed
				? present.connections.filter(
						(c) => c.from !== removed.id && c.to !== removed.id,
					)
				: present.connections;
			return { ...present, annotations, connections };
		}
		case 'addConnection':
			return {
				...present,
				connections: [...present.connections, action.value],
			};
		case 'updateConnection': {
			const connections = present.connections.slice();
			connections[action.index] = action.value;
			return { ...present, connections };
		}
		case 'removeConnection':
			return {
				...present,
				connections: present.connections.filter((_, i) => i !== action.index),
			};
		case 'hydrate':
		case 'undo':
		case 'redo':
			return present;
	}
}

function reducer(state: EditorState, action: EditorAction): EditorState {
	if (action.kind === 'hydrate') {
		return { past: [], present: action.value, future: [] };
	}
	if (action.kind === 'undo') {
		if (state.past.length === 0) return state;
		const previous = state.past[state.past.length - 1];
		return {
			past: state.past.slice(0, -1),
			present: previous,
			future: [state.present, ...state.future],
		};
	}
	if (action.kind === 'redo') {
		if (state.future.length === 0) return state;
		const [next, ...rest] = state.future;
		return {
			past: [...state.past, state.present],
			present: next,
			future: rest,
		};
	}
	const nextPresent = applyToPresent(state.present, action);
	if (nextPresent === state.present) return state;
	const nextPast = [...state.past, state.present].slice(-MAX_HISTORY);
	return { past: nextPast, present: nextPresent, future: [] };
}

export function useEditorState(): UseEditorStateResult {
	const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
	const hydratedRef = useRef(false);

	useEffect(() => {
		const persisted = loadPersistedConfig();
		if (persisted) dispatch({ kind: 'hydrate', value: persisted });
		hydratedRef.current = true;
	}, []);

	useEffect(() => {
		if (!hydratedRef.current) return;
		writePersistedConfig(state.present);
	}, [state.present]);

	const undoAction = useCallback(() => dispatch({ kind: 'undo' }), []);
	const redoAction = useCallback(() => dispatch({ kind: 'redo' }), []);
	const replaceConfigAction = useCallback<
		UseEditorStateResult['replaceConfigAction']
	>((value) => dispatch({ kind: 'replaceConfig', value }), []);
	const patchConfigAction = useCallback<
		UseEditorStateResult['patchConfigAction']
	>((value) => dispatch({ kind: 'patchConfig', value }), []);
	const setCodeAction = useCallback(
		(value: string) => dispatch({ kind: 'setCode', value }),
		[],
	);
	const setLangAction = useCallback(
		(value: string) => dispatch({ kind: 'setLang', value }),
		[],
	);
	const setFilenameAction = useCallback(
		(value: string) => dispatch({ kind: 'setFilename', value }),
		[],
	);
	const setRunnableAction = useCallback(
		(value: boolean) => dispatch({ kind: 'setRunnable', value }),
		[],
	);
	const addAnnotationAction = useCallback<
		UseEditorStateResult['addAnnotationAction']
	>((value) => dispatch({ kind: 'addAnnotation', value }), []);
	const updateAnnotationAction = useCallback<
		UseEditorStateResult['updateAnnotationAction']
	>((index, value) => dispatch({ kind: 'updateAnnotation', index, value }), []);
	const removeAnnotationAction = useCallback(
		(index: number) => dispatch({ kind: 'removeAnnotation', index }),
		[],
	);
	const addConnectionAction = useCallback<
		UseEditorStateResult['addConnectionAction']
	>((value) => dispatch({ kind: 'addConnection', value }), []);
	const updateConnectionAction = useCallback<
		UseEditorStateResult['updateConnectionAction']
	>((index, value) => dispatch({ kind: 'updateConnection', index, value }), []);
	const removeConnectionAction = useCallback(
		(index: number) => dispatch({ kind: 'removeConnection', index }),
		[],
	);

	const canUndo = state.past.length > 0;
	const canRedo = state.future.length > 0;

	return useMemo(
		() => ({
			config: state.present,
			canUndo,
			canRedo,
			undoAction,
			redoAction,
			replaceConfigAction,
			patchConfigAction,
			setCodeAction,
			setLangAction,
			setFilenameAction,
			setRunnableAction,
			addAnnotationAction,
			updateAnnotationAction,
			removeAnnotationAction,
			addConnectionAction,
			updateConnectionAction,
			removeConnectionAction,
		}),
		[
			state.present,
			canUndo,
			canRedo,
			undoAction,
			redoAction,
			replaceConfigAction,
			patchConfigAction,
			setCodeAction,
			setLangAction,
			setFilenameAction,
			setRunnableAction,
			addAnnotationAction,
			updateAnnotationAction,
			removeAnnotationAction,
			addConnectionAction,
			updateConnectionAction,
			removeConnectionAction,
		],
	);
}
