import { defineCodeGloss } from './core/code-gloss.element';

export { CodeGlossElement, defineCodeGloss } from './core/code-gloss.element';

export type {
	Annotation,
	Connection,
	CodeGlossConfig,
	Highlighter,
	RunResult,
} from './core/code-gloss.types';

// Side effect: register the custom element on import.
defineCodeGloss();
