import type { Annotation, CodeGlossConfig, Connection } from 'codegloss/react';

export type EditorConfig = Required<
	Pick<CodeGlossConfig, 'code' | 'lang'>
> & {
	filename?: string;
	runnable?: boolean;
	annotations: Annotation[];
	connections: Connection[];
};

export type EditorState = {
	config: EditorConfig;
};

export type EditorAction =
	| { kind: 'replaceConfig'; value: EditorConfig }
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
	replaceConfigAction: (value: EditorConfig) => void;
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
