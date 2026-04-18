export type CodePaneProps = {
	code: string;
	lang: string;
	filename: string;
	onCodeChangeAction: (value: string) => void;
	onLangChangeAction: (value: string) => void;
	onFilenameChangeAction: (value: string) => void;
};
