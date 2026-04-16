import { defineCodeGloss } from './core/code-gloss.element';

export { CodeGlossElement, defineCodeGloss } from './core/code-gloss.element';
export { setDefaultHighlighter } from './core/default-highlighter.helpers';
export { initCodegloss } from './core/init-codegloss.helpers';

export type {
	Annotation,
	Connection,
	CodeGlossConfig,
	Highlighter,
} from './core/code-gloss.types';

export { resolveTheme, applyGlobalTheme } from './themes';
export type { CodeGlossTheme, CodeGlossThemeVariant } from './themes';

// Side effect: register the custom element on import.
defineCodeGloss();
