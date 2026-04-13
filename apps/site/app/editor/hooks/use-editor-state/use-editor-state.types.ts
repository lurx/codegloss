import type { Annotation, CodeGlossConfig, Connection } from '@codegloss/react';

export type ArcsStyle = NonNullable<CodeGlossConfig['arcs']>;
export type CalloutsStyle = NonNullable<CodeGlossConfig['callouts']>;

export type EditorConfig = Required<
	Pick<CodeGlossConfig, 'code' | 'lang'>
> & {
	filename?: string;
	runnable?: boolean;
	theme?: string;
	arcs?: ArcsStyle;
	callouts?: CalloutsStyle;
	annotations: Annotation[];
	connections: Connection[];
};

export type EditorState = {
	past: EditorConfig[];
	present: EditorConfig;
	future: EditorConfig[];
};

export type EditorAction =
	| { kind: 'hydrate'; value: EditorConfig }
	| { kind: 'undo' }
	| { kind: 'redo' }
	| { kind: 'replaceConfig'; value: EditorConfig }
	| { kind: 'patchConfig'; value: Partial<EditorConfig> }
	| { kind: 'setCode'; value: string }
	| { kind: 'setLang'; value: string }
	| { kind: 'setFilename'; value: string }
	| { kind: 'setRunnable'; value: boolean }
	| { kind: 'addAnnotation'; value: Annotation }
	| { kind: 'updateAnnotation'; index: number; value: Annotation }
	| { kind: 'removeAnnotation'; index: number }
	| { kind: 'addConnection'; value: Connection }
	| { kind: 'updateConnection'; index: number; value: Connection }
	| { kind: 'removeConnection'; index: number };

export type UseEditorStateResult = {
	config: EditorConfig;
	canUndo: boolean;
	canRedo: boolean;
	undoAction: () => void;
	redoAction: () => void;
	replaceConfigAction: (value: EditorConfig) => void;
	patchConfigAction: (value: Partial<EditorConfig>) => void;
	setCodeAction: (value: string) => void;
	setLangAction: (value: string) => void;
	setFilenameAction: (value: string) => void;
	setRunnableAction: (value: boolean) => void;
	addAnnotationAction: (value: Annotation) => void;
	updateAnnotationAction: (index: number, value: Annotation) => void;
	removeAnnotationAction: (index: number) => void;
	addConnectionAction: (value: Connection) => void;
	updateConnectionAction: (index: number, value: Connection) => void;
	removeConnectionAction: (index: number) => void;
};
