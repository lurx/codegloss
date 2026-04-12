import type { EditorConfig } from '../../hooks/use-editor-state';

export type ImportDialogProps = {
	open: boolean;
	onCloseAction: () => void;
	onImportAction: (config: EditorConfig) => void;
};
