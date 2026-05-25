# codegloss

## 1.0.0

### Minor Changes

- 4b857b2: Add `styleOverrides` to `defineConfig`, the remark plugin, and every framework wrapper. Chrome-level tokens (outer background/foreground/border/border-radius/max-inline-size, toolbar background, muted text, annotation marker colors, language badge, line numbers) are now declarable once in `codegloss.config.ts` — values forward as inline CSS custom properties on each `<code-gloss>` host, so `var(--my-site-bg)` references resolve against the host page's own design tokens. Per-block overrides via the same `styleOverrides` prop on the wrappers.
- 693a4a8: Add `transformAllCodeFences` option to `remarkCodegloss`. When enabled, the plugin transforms every fenced code block with a language — not just those marked with the `codegloss` keyword — into a `<CodeGloss />` instance, so plain ` ```ts ` fences inherit the plugin's `theme`, `styleOverrides`, `arcs`, `callouts`, and `highlight` defaults. The marker form (` ```ts codegloss filename `) still wins and remains the only way to pair a block with an annotations JSON block; this just removes the marker requirement for un-annotated blocks so an MDX page can mix annotated and plain fences without chrome inconsistency. Off by default.

## 0.1.0

- Initial public release.
