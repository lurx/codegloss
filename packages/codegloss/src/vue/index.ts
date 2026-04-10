// Side effect: ensure the custom element is registered.
import '../index';

export { CodeGloss } from './code-gloss.component';
export type { CodeGlossProps } from './code-gloss.component';

export type {
	Annotation,
	Connection,
	CodeGlossConfig,
	Highlighter,
	RunResult,
} from '../core/code-gloss.types';
