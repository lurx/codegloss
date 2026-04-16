import type { CodeGlossUserConfig } from '../config/config.types';
import { setDefaultHighlighter } from './default-highlighter.helpers';
import { setDefaultLabels } from './labels.helpers';

/**
 * Apply a project-level codegloss config at runtime — typically once, near
 * the root of a client app. Wires:
 *
 * - `config.highlight` into `setDefaultHighlighter`, so every
 *   `<code-gloss>` block on the page (current and future) renders with the
 *   same highlighter the build pipeline uses.
 * - `config.labels` into `setDefaultLabels`, so localized copy/copied/close
 *   strings apply uniformly.
 *
 * Pair with the same `codegloss.config.ts` your remark plugin reads —
 * single declaration of theme + highlighter + i18n, picked up by both
 * render paths.
 */
export function initCodegloss(config: CodeGlossUserConfig): void {
	if (config.highlight) setDefaultHighlighter(config.highlight);
	if (config.labels) setDefaultLabels(config.labels);
}
