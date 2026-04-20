# @codegloss/react

## 1.0.0

### Minor Changes

- 4b857b2: Add `styleOverrides` to `defineConfig`, the remark plugin, and every framework wrapper. Chrome-level tokens (outer background/foreground/border/border-radius, toolbar background, muted text, annotation marker colors, language badge, line numbers) are now declarable once in `codegloss.config.ts` — values forward as inline CSS custom properties on each `<code-gloss>` host, so `var(--my-site-bg)` references resolve against the host page's own design tokens. Per-block overrides via the same `styleOverrides` prop on the wrappers.

### Patch Changes

- Updated dependencies [4b857b2]
  - codegloss@1.0.0

## 0.1.0

- Initial public release.
