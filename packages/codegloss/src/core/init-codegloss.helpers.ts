import type { CodeGlossUserConfig } from '../config/config.types';
import { setDefaultHighlighter } from './default-highlighter.helpers';

/**
 * Apply a project-level codegloss config at runtime — typically once, near
 * the root of a client app. Currently wires `config.highlight` into
 * `setDefaultHighlighter` so every `<code-gloss>` block on the page (current
 * and future) renders with the same highlighter the build pipeline uses.
 *
 * Pair with the same `codegloss.config.ts` your remark plugin reads — single
 * declaration of theme + highlighter, picked up by both render paths.
 */
export function initCodegloss(config: CodeGlossUserConfig): void {
	if (config.highlight) setDefaultHighlighter(config.highlight);
}
