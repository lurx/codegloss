import type { EditorConfig } from '../../hooks/use-editor-state';

export type SettingsPanelProps = {
	config: EditorConfig;
	onPatchAction: (value: Partial<EditorConfig>) => void;
};
