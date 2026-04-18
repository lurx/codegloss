import type { CodeGlossLabels } from './labels.types';

const DEFAULT_LABELS = {
	copy: 'Copy code',
	copied: 'Copied',
	copiedTitle: 'Copied!',
	closeAnnotation: 'Close annotation',
	invalidConfig: '[code-gloss] missing or invalid config',
} as const satisfies Required<CodeGlossLabels>;

type ResolvedLabels = Required<CodeGlossLabels>;

let activeLabels: ResolvedLabels = DEFAULT_LABELS;

/**
 * Project-wide override for the small set of strings the element renders
 * itself (copy button labels, callout close button, fallback error). Pass
 * a partial object — unspecified keys fall back to the English defaults.
 * Pass `undefined` to reset.
 *
 * Typically called once via `initCodegloss(config)`; exported separately
 * for callers that don't want to plumb a full project config through.
 */
export function setDefaultLabels(labels: CodeGlossLabels | undefined): void {
	activeLabels = labels
		? { ...DEFAULT_LABELS, ...labels }
		: DEFAULT_LABELS;
}

/** Read the currently-active labels. Mainly for the element's own use. */
export function getLabels(): ResolvedLabels {
	return activeLabels;
}
