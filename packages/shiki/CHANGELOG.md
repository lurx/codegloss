# @codegloss/shiki

## 1.0.0

### Minor Changes

- 4b857b2: Add `styleOverrides` to `defineConfig`, the remark plugin, and every framework wrapper. Chrome-level tokens (outer background/foreground/border/border-radius/max-inline-size, toolbar background, muted text, annotation marker colors, language badge, line numbers) are now declarable once in `codegloss.config.ts` — values forward as inline CSS custom properties on each `<code-gloss>` host, so `var(--my-site-bg)` references resolve against the host page's own design tokens. Per-block overrides via the same `styleOverrides` prop on the wrappers.

### Patch Changes

- 693a4a8: Fix `rehypeCodeglossPre` silently skipping `<pre>` blocks nested inside
  sub-root hast nodes (as produced by `rehype-raw`). The walker now recurses
  into `root`-typed children as well as elements, so Velite, Astro, and
  VitePress pipelines that allow raw HTML in markdown transform every fenced
  block out of the box. Resolves [#12](https://github.com/lurx/codegloss/issues/12).
- Updated dependencies [4b857b2]
- Updated dependencies [693a4a8]
  - codegloss@1.0.0

## 0.1.0

- Initial public release.
