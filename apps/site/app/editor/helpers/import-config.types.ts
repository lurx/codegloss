import type { EditorConfig } from '../hooks/use-editor-state';

export type ImportFormat = 'json' | 'mdx' | 'jsx';

export type ImportResult =
	| { ok: true; format: ImportFormat; config: EditorConfig }
	| { ok: false; error: string };
