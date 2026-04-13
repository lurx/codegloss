export type DetectedPair = {
	lang: string;
	filename: string | undefined;
	code: string;
	annotationsJson: string | undefined;
	/** Index of the code node in parent.children */
	codeIndex: number;
	/** Number of nodes consumed (1 if no annotations block, 2 if paired) */
	nodeCount: number;
	/** Theme name injected by the remark plugin from config */
	theme?: string;
	/** Default arc style overrides injected by the remark plugin from config */
	arcs?: Record<string, unknown>;
	/** Default callout overrides injected by the remark plugin from config */
	callouts?: Record<string, unknown>;
};

export type AnnotationsData = {
	annotations?: unknown[];
	connections?: unknown[];
	/** Arc style overrides. Forwarded verbatim as an `arcs` prop. */
	arcs?: Record<string, unknown>;
	/** Callout behavior overrides. Forwarded verbatim as a `callouts` prop. */
	callouts?: Record<string, unknown>;
};

export type MdxjsEsm = {
	type: 'mdxjsEsm';
	value: string;
	data?: {
		estree?: {
			type: 'Program';
			sourceType: 'module';
			body: unknown[];
		};
	};
};

export type RemarkCodeglossOptions = {
	/**
	 * Output mode:
	 * - `'mdx'` (default) — emits an `<CodeGloss />` MDX JSX element. Requires
	 *   an MDX pipeline (e.g. @next/mdx, next-mdx-remote, Velite, Docusaurus).
	 *   The remark-rendered tree includes an auto-injected import for the
	 *   React component (unless `skipImport` is true).
	 * - `'html'` — emits a raw `<code-gloss>` HTML node with the config in a
	 *   `<script type="application/json">` child. Use with plain markdown
	 *   pipelines (remark-rehype → rehype-stringify, etc.). Consumers must
	 *   load the `codegloss` runtime separately via a `<script>` tag.
	 */
	output?: 'mdx' | 'html';
	/**
	 * (mdx only) Skip injecting `import { CodeGloss } from '@codegloss/react'`.
	 * Set to true when providing CodeGloss via MDX component mapping
	 * (e.g. Docusaurus MDXComponents swizzle).
	 */
	skipImport?: boolean;
	/**
	 * Default theme applied to all code blocks unless the block specifies its own.
	 * Accepts a bundled theme name (e.g. 'github-dark', 'dracula').
	 */
	theme?: string;
	/**
	 * Default arc style overrides applied to every emitted code block. Keys are
	 * shallow-merged with the block's own `arcs` — per-block values win.
	 */
	arcs?: Record<string, unknown>;
	/**
	 * Default callout overrides applied to every emitted code block. Keys are
	 * shallow-merged with the block's own `callouts` — per-block values win.
	 */
	callouts?: Record<string, unknown>;
};
