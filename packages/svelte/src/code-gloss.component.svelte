<!--
  Stateless Svelte wrapper around the `<code-gloss>` custom element. Renders
  the WC with a `<script type="application/json">` child containing the
  serialized config — exactly the same shape the React and Vue wrappers
  produce.

  The types are inlined here (rather than imported from `../core/code-gloss.types`)
  because consumers will compile this source file directly out of
  `node_modules/codegloss/src/svelte/`, where relative imports back into the
  rest of the package source would fail to resolve through the published
  exports map.

  Targets Svelte 4 reactive syntax (`$:`) which Svelte 5 still supports in
  legacy mode, so the same wrapper works for both major versions.
-->
<script context="module" lang="ts">
  export type CodeGlossAnnotation = {
    id: string;
    token: string;
    line: number;
    occurrence: number;
    title: string;
    text: string;
  };

  export type CodeGlossConnection = {
    from: string;
    to: string;
    color: string;
    title?: string;
    text?: string;
  };

  export type CodeGlossHighlighter = (
    code: string,
    lang: string,
  ) => string | { html: string; background?: string; color?: string };

  export type CodeGlossStyleOverrides = {
    codeBlock?: {
      background?: string;
      foreground?: string;
      border?: string;
      borderRadius?: string;
      toolbarBackground?: string;
      mutedForeground?: string;
    };
    annotations?: {
      markerBackground?: string;
      markerBorder?: string;
      markerHover?: string;
    };
    badge?: {
      background?: string;
      foreground?: string;
    };
    lineNumbers?: {
      foreground?: string;
    };
  };

  export type CodeGlossProps = {
    code: string;
    lang: string;
    filename?: string;
    theme?: string;
    annotations?: CodeGlossAnnotation[];
    connections?: CodeGlossConnection[];
    /**
     * Optional highlighter invoked at render time. The wrapper calls
     * highlight(code, lang) and bakes the result into the config so the
     * runtime element renders pre-highlighted markup directly.
     */
    highlight?: CodeGlossHighlighter;
    /**
     * Chrome-level style overrides applied as inline CSS custom properties
     * on the rendered <code-gloss> host. See codegloss' `defineConfig`
     * docs for the full field list.
     */
    styleOverrides?: CodeGlossStyleOverrides;
  };
</script>

<script lang="ts">
  // CSS variable mapping for styleOverrides. Inlined because this file ships
  // as source to consumers and importing from the core codegloss package at
  // component-compile time has caused resolution issues in the past.
  const STYLE_OVERRIDE_MAP: Array<
    [keyof CodeGlossStyleOverrides, string, string]
  > = [
    ['codeBlock', 'background', '--cg-bg'],
    ['codeBlock', 'foreground', '--cg-text'],
    ['codeBlock', 'border', '--cg-border'],
    ['codeBlock', 'borderRadius', '--cg-radius'],
    ['codeBlock', 'toolbarBackground', '--cg-toolbar-bg'],
    ['codeBlock', 'mutedForeground', '--cg-muted'],
    ['annotations', 'markerBackground', '--cg-ann-bg'],
    ['annotations', 'markerBorder', '--cg-ann-border'],
    ['annotations', 'markerHover', '--cg-ann-hover'],
    ['badge', 'background', '--cg-badge-bg'],
    ['badge', 'foreground', '--cg-badge-text'],
    ['lineNumbers', 'foreground', '--cg-line-num'],
  ];

  function buildInlineStyle(
    overrides: CodeGlossStyleOverrides | undefined,
  ): string | undefined {
    if (!overrides) return undefined;
    const parts: string[] = [];
    for (const [group, field, cssVar] of STYLE_OVERRIDE_MAP) {
      const groupValue = overrides[group] as
        | Record<string, string | undefined>
        | undefined;
      const value = groupValue?.[field];
      if (typeof value === 'string' && value.length > 0) {
        parts.push(`${cssVar}: ${value}`);
      }
    }
    return parts.length > 0 ? parts.join('; ') : undefined;
  }

  export let code: string;
  export let lang: string;
  export let filename: string | undefined = undefined;
  export let theme: string | undefined = undefined;
  export let annotations: CodeGlossAnnotation[] | undefined = undefined;
  export let connections: CodeGlossConnection[] | undefined = undefined;
  export let highlight: CodeGlossHighlighter | undefined = undefined;
  export let styleOverrides: CodeGlossStyleOverrides | undefined = undefined;

  $: highlightResult = highlight ? highlight(code, lang) : undefined;
  $: highlightedHtml =
    typeof highlightResult === 'string'
      ? highlightResult
      : highlightResult?.html;
  $: highlightBackground =
    typeof highlightResult === 'object' ? highlightResult?.background : undefined;
  $: highlightColor =
    typeof highlightResult === 'object' ? highlightResult?.color : undefined;
  $: inlineStyle = buildInlineStyle(styleOverrides);
  $: payload = JSON.stringify(
    Object.fromEntries(
      Object.entries({
        code,
        lang,
        filename,
        theme,
        annotations,
        connections,
        highlightedHtml,
        highlightBackground,
        highlightColor,
      }).filter(([, v]) => v !== undefined),
    ),
  ).replace(/<\/script/gi, '<\\/script');
</script>

<code-gloss style={inlineStyle}>
  {@html `<script type="application/json">${payload}</script>`}
</code-gloss>
