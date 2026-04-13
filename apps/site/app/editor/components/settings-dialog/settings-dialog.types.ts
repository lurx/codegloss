import type { EditorConfig } from '../../hooks/use-editor-state';

export type SettingsDialogProps = {
	open: boolean;
	config: EditorConfig;
	onCloseAction: () => void;
	onPatchAction: (value: Partial<EditorConfig>) => void;
};
