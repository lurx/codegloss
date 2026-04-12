export type CodePaneProps = {
	code: string;
	lang: string;
	filename: string;
	runnable: boolean;
	onCodeChangeAction: (value: string) => void;
	onLangChangeAction: (value: string) => void;
	onFilenameChangeAction: (value: string) => void;
	onRunnableChangeAction: (value: boolean) => void;
};
