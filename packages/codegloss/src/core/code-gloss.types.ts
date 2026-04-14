export type Annotation = {
	/** Unique within this block, e.g. "a1" */
	id: string;
	/** Exact substring to highlight, e.g. "memo[k]" */
	token: string;
	/** 0-indexed line number */
	line: number;
	/** 0-indexed: which match on that line (for repeated tokens) */
	occurrence: number;
	/** Tooltip heading */
	title: string;
	/** Tooltip body */
	text: string;
	/**
	 * When `true`, the callout renders as a floating popover anchored to
	 * the click position instead of the default inline expanding callout.
	 * Per-annotation value wins over the block-level `callouts.popover`
	 * default. Default: false.
	 */
	popover?: boolean;
	/**
	 * When `true`, this annotation's callout opens automatically on first
	 * render. Only one annotation per block can be pre-opened — if more
	 * than one sets `defaultOpen: true`, the **last** one in the
	 * `annotations` array wins (CSS-cascade style). Default: false.
	 */
	defaultOpen?: boolean;
};

export type Connection = {
	/** Annotation id */
	from: string;
	/** Annotation id */
	to: string;
	/** Hex color for the arc + dots */
	color: string;
	/** Tooltip heading shown when the arc is clicked */
	title?: string;
	/** Tooltip body shown when the arc is clicked. Without it, the arc isn't clickable. */
	text?: string;
	/**
	 * Which side of the code block the arc renders on.
	 * - `'left'` (default) — fixed-width gutter, mirrored between lines.
	 * - `'right'` — dynamic-width gutter, arc anchors at each line's end.
	 */
	side?: 'left' | 'right';
	/**
	 * When `true`, this connection's popover opens automatically on first
	 * render. Only one connection per block can be pre-opened — if more
	 * than one sets `defaultOpen: true`, the **last** one in the
	 * `connections` array wins (CSS-cascade style). Default: false.
	 *
	 * Independent of `annotation.defaultOpen`: one of each can be open
	 * after mount.
	 */
	defaultOpen?: boolean;
};

/**
 * Custom syntax highlighter. Receives the full code and language and
 * returns a single HTML string (no outer `<pre>` / `<code>` wrappers).
 * codegloss splits the HTML into lines internally — so Shiki, Prism,
 * hljs, or any highlighter that emits span-wrapped tokens just works.
 *
 * Ready-made adapters live under `codegloss/highlighters/*`.
 */
export type Highlighter = (code: string, lang: string) => string;

/**
 * Serializable configuration for `<code-gloss>`. This is what gets
 * passed via the JSON `<script>` child or via the React wrapper props.
 *
 * Note: `highlight` is intentionally excluded — it's a function and
 * cannot be serialized. Set it via the `.highlight` property on the
 * element directly (or use the React wrapper which handles it via ref).
 */
export type CodeGlossConfig = {
	/** Raw source string (preserve indentation) */
	code: string;
	/** Language identifier: "js", "ts", "py", etc. */
	lang: string;
	/** Shown in toolbar, e.g. "fibonacci.js" */
	filename?: string;
	annotations?: Annotation[];
	connections?: Connection[];
	/** Show Run button (default: true when lang === "js") */
	runnable?: boolean;
	/** Named theme or inline theme object for syntax + chrome colors */
	theme?: string;
	/** Style overrides for connection arcs */
	arcs?: {
		dotRadius?: number;
		dotOpacity?: number;
		strokeWidth?: number;
		strokeDasharray?: string;
		opacity?: number;
		/**
		 * Draw an arrowhead at the `to` endpoint. The `from` endpoint always
		 * renders as a plain dot. Default: false.
		 */
		arrowhead?: boolean;
	};
	/** Block-level callout behavior for annotations. */
	callouts?: {
		/**
		 * When `true`, every annotation in this block opens as a floating
		 * popover at the click position instead of the default inline
		 * expanding callout. Individual annotations can still override via
		 * `annotation.popover`. Default: false.
		 */
		popover?: boolean;
	};
};

export type RunResult = {
	lines: string[];
	error?: string;
};

export type AnnotationHit = {
	start: number;
	end: number;
	annotation: Annotation;
};

export type ConnectionTooltipState = {
	connection: Connection;
	top: number;
	left: number;
};
