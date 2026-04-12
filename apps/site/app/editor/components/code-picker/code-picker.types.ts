export type CodePickerProps = {
	code: string;
	lang: string;
	theme: string;
	onTokenPickAction: (payload: TokenPick) => void;
};

export type TokenPick = {
	token: string;
	line: number;
	occurrence: number;
};
