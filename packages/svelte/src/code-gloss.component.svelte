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

  export type CodeGlossProps = {
    code: string;
    lang: string;
    filename?: string;
    runnable?: boolean;
    theme?: string;
    annotations?: CodeGlossAnnotation[];
    connections?: CodeGlossConnection[];
    /**
     * Optional highlighter invoked at render time. The wrapper calls
     * highlight(code, lang) and bakes the result into the config so the
     * runtime element renders pre-highlighted markup directly.
     */
    highlight?: CodeGlossHighlighter;
  };
</script>

<script lang="ts">
  export let code: string;
  export let lang: string;
  export let filename: string | undefined = undefined;
  export let runnable: boolean | undefined = undefined;
  export let theme: string | undefined = undefined;
  export let annotations: CodeGlossAnnotation[] | undefined = undefined;
  export let connections: CodeGlossConnection[] | undefined = undefined;
  export let highlight: CodeGlossHighlighter | undefined = undefined;

  $: highlightResult = highlight ? highlight(code, lang) : undefined;
  $: highlightedHtml =
    typeof highlightResult === 'string'
      ? highlightResult
      : highlightResult?.html;
  $: highlightBackground =
    typeof highlightResult === 'object' ? highlightResult?.background : undefined;
  $: highlightColor =
    typeof highlightResult === 'object' ? highlightResult?.color : undefined;
  $: payload = JSON.stringify(
    Object.fromEntries(
      Object.entries({
        code,
        lang,
        filename,
        runnable,
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

<code-gloss>
  {@html `<script type="application/json">${payload}</script>`}
</code-gloss>
