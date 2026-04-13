// Side effect: register the <code-gloss> custom element on import.
import { defineCodeGloss } from 'codegloss';
defineCodeGloss();

export { CodeGloss } from './code-gloss.component';
export type { CodeGlossProps } from './code-gloss.types';

export type {
	Annotation,
	Connection,
	CodeGlossConfig,
	Highlighter,
	RunResult,
} from 'codegloss';
