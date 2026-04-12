import { useCallback, useEffect, useReducer, useRef } from 'react';
import type {
	EditorAction,
	EditorConfig,
	EditorState,
	UseEditorStateResult,
} from './use-editor-state.types';

const STORAGE_KEY = 'codegloss:editor:draft';

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

const INITIAL_STATE = {
	config: {
		code: INITIAL_CODE,
		lang: 'js',
		filename: 'greet.js',
		runnable: true,
		annotations: [],
		connections: [],
	},
} satisfies EditorState;

function reducer(state: EditorState, action: EditorAction): EditorState {
	const { config } = state;
	switch (action.kind) {
		case 'replaceConfig':
			return { config: action.value };
		case 'patchConfig':
			return { config: { ...config, ...action.value } };
		case 'setCode':
			return { config: { ...config, code: action.value } };
		case 'setLang':
			return { config: { ...config, lang: action.value } };
		case 'setFilename':
			return { config: { ...config, filename: action.value } };
		case 'setRunnable':
			return { config: { ...config, runnable: action.value } };
		case 'addAnnotation':
			return {
				config: {
					...config,
					annotations: [...config.annotations, action.value],
				},
			};
		case 'updateAnnotation': {
			const annotations = config.annotations.slice();
			annotations[action.index] = action.value;
			return { config: { ...config, annotations } };
		}
		case 'removeAnnotation': {
			const removed = config.annotations[action.index];
			const annotations = config.annotations.filter(
				(_, i) => i !== action.index,
			);
			const connections = removed
				? config.connections.filter(
						(c) => c.from !== removed.id && c.to !== removed.id,
					)
				: config.connections;
			return { config: { ...config, annotations, connections } };
		}
		case 'addConnection':
			return {
				config: {
					...config,
					connections: [...config.connections, action.value],
				},
			};
		case 'updateConnection': {
			const connections = config.connections.slice();
			connections[action.index] = action.value;
			return { config: { ...config, connections } };
		}
		case 'removeConnection':
			return {
				config: {
					...config,
					connections: config.connections.filter((_, i) => i !== action.index),
				},
			};
	}
}

export function useEditorState(): UseEditorStateResult {
	const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
	const hydratedRef = useRef(false);

	useEffect(() => {
		const persisted = loadPersistedConfig();
		if (persisted) dispatch({ kind: 'replaceConfig', value: persisted });
		hydratedRef.current = true;
	}, []);

	useEffect(() => {
		if (!hydratedRef.current) return;
		writePersistedConfig(state.config);
	}, [state.config]);

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

	return {
		config: state.config,
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
	};
}
