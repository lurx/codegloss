/**
 * Localizable strings rendered by `<code-gloss>`. Override any subset via
 * `setDefaultLabels()` (or `initCodegloss({ labels })`); unspecified keys
 * keep their English defaults.
 */
export type CodeGlossLabels = {
	/** Copy button `aria-label` and `title` in its idle state. */
	copy?: string;
	/** Copy button `aria-label` after a successful copy. */
	copied?: string;
	/** Copy button `title` after a successful copy. */
	copiedTitle?: string;
	/** Annotation callout close-button `aria-label`. */
	closeAnnotation?: string;
	/** Visible text shown in the fallback DOM when the JSON config is missing or invalid. */
	invalidConfig?: string;
};
