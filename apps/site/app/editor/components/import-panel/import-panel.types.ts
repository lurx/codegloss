import type { EditorConfig } from '../../hooks/use-editor-state';

export type ImportPanelProps = {
	onImportAction: (config: EditorConfig) => void;
};
