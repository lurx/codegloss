---
'codegloss': minor
'@codegloss/react': minor
'@codegloss/vue': minor
'@codegloss/svelte': minor
'@codegloss/shiki': minor
---

Add `styleOverrides` to `defineConfig`, the remark plugin, and every framework wrapper. Chrome-level tokens (outer background/foreground/border/border-radius/max-inline-size, toolbar background, muted text, annotation marker colors, language badge, line numbers) are now declarable once in `codegloss.config.ts` — values forward as inline CSS custom properties on each `<code-gloss>` host, so `var(--my-site-bg)` references resolve against the host page's own design tokens. Per-block overrides via the same `styleOverrides` prop on the wrappers.
