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
};

/**
 * Custom syntax highlighter. Receives the full code and language,
 * returns an array of HTML strings — one per line. Annotation marks
 * are injected into the highlighted HTML automatically.
 *
 * Works with Shiki, Prism, or any highlighter that outputs HTML.
 */
export type Highlighter = (code: string, lang: string) => string[];

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
