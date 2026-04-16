# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Added

- `highlight` field on the project-level config (`defineConfig({ highlight })`) — declare your `Highlighter` once and every render path picks it up: the remark plugin reads it at build time, hand-written blocks pass `config.highlight` to the wrapper, and `initCodegloss(config)` wires it into the runtime web component.
- `initCodegloss(config)` API on the `codegloss` entry — one-shot bootstrap for client apps. Reads the project config and registers `config.highlight` as the default for every `<code-gloss>` on the page (current and future). Pair with the same `codegloss.config.ts` your remark plugin reads.
- `labels` field on the project-level config + `setDefaultLabels(labels)` API — overrides the small set of strings the element renders itself (copy / copied / copied-title / close-annotation / invalid-config). Pass any subset; unspecified keys keep their English defaults. Wired through `initCodegloss(config)` so localization travels with the rest of your project setup. New `CodeGlossLabels` type exported alongside.
- New wrapper packages — `@codegloss/react`, `@codegloss/vue`, `@codegloss/svelte`. Each installs independently and declares `codegloss` as a peer dependency, so users only pay for the wrapper they actually use.
- `setDefaultHighlighter(fn)` API on the `codegloss` entry — register a syntax highlighter once at startup and every `<code-gloss>` on the page picks it up (mounted blocks refresh in place).
- `highlight` option on the remark plugin — pre-highlights each codegloss block at build time and bakes the resulting HTML into the emitted config. Pair it with the same Shiki instance you pass to `@shikijs/rehype` so fenced and codegloss blocks share one source of truth, with no client-side highlighter download.
- `highlight` prop on every wrapper (`@codegloss/react`, `@codegloss/vue`, `@codegloss/svelte`) — invoked at render time and baked into the config. Use the same shared adapter as the remark plugin for handwritten React/Vue/Svelte blocks (homepage hero, theme showcase, anything that doesn't go through remark).
- `highlightedHtml` (+ `highlightBackground` / `highlightColor`) fields on `CodeGlossConfig` — pre-rendered HTML and optional chrome colors applied as `--cg-bg` / `--cg-text` on the host.
- `theme` / `background` / `color` options on `createPrismHighlighter` and `createHljsHighlighter` — built-in lookup of common theme names (Prism: `tomorrow`, `okaidia`, etc.; hljs: `github-dark`, `atom-one-dark`, `dracula`, etc.) plus explicit override for custom themes. The Shiki adapter parses the chrome out of Shiki's own inline styles automatically.
- Syntax-highlighter adapter subpaths — `codegloss/highlighters/shiki`, `codegloss/highlighters/prism`, `codegloss/highlighters/hljs`. Each is ~100 B of glue; `shiki`, `prismjs`, and `highlight.js` are declared as optional peer dependencies.
- `CodeGlossElement.refresh()` — tears down listeners and rebuilds the shadow DOM. Mainly used internally by `setDefaultHighlighter`, but exposed for imperative consumers.

### Changed

- `Highlighter` signature is now `(code, lang) => string | HighlightedCode`. Return a plain string if that's all you have, or the object form to forward chrome colors along with the tokenized HTML. codegloss splits the HTML into lines internally, preserving open spans across newlines, so any tool that emits span-wrapped tokens works.
- Codegloss stays syntax-agnostic — colors come from whichever highlighter you plug in. Unused codegloss theme names no longer affect tokens; the chrome follows the highlighter's output (or your explicit override).
- Framework wrappers moved out of the main package. Imports are now `@codegloss/react`, `@codegloss/vue`, `@codegloss/svelte` (previously `codegloss/react`, etc.). The remark plugin now injects the `@codegloss/react` import.
- Main package ships as ESM only. The `./remark` subpath keeps a CJS twin for older remark/content pipelines (Docusaurus with jiti-loaded `.ts` configs, etc.); every other entry is ESM-only. Minimum Node for tooling is 18.
- Core `codegloss` package footprint dropped further (179 KB → 85 KB unpacked) now that wrappers ship separately.
- Fence keyword: codegloss blocks are now detected as ` ```{lang} codegloss {filename?} ` (previously ` ```{lang} sandbox … `). The word "sandbox" suggested an in-page execution sandbox the element doesn't actually provide. Detector function renamed to `detectCodeglossPair`.

### Removed

- `runnable` config field, the in-place JS runner (`run()` + `runners` registry), and the toolbar Run button + output strip. The `<code-gloss>` element no longer ships an evaluator; per-block execution is being redesigned and will return as a separate, opt-in surface. `RunResult` is no longer exported.

## [0.1.0] — 2026-04-12

### Added

- `<code-gloss>` Web Component with Shadow DOM, built-in syntax highlighting, and constructable stylesheets
- React, Vue, and Svelte framework wrappers (`codegloss/react`, `codegloss/vue`, `codegloss/svelte`)
- Remark plugin (`codegloss/remark`) with MDX and HTML output modes
- Token-level annotations with inline callouts
- Connection arcs between annotations with Popover API popovers
- 9 bundled themes: github-light, github-dark, one-light, one-dark, dracula, nord-light, nord-dark, vitesse-light, vitesse-dark
- Project-level config file support (`codegloss.config.ts`, `.codeglossrc.json`, etc.)
- `defineConfig` helper and `loadConfig` Node API
- `applyGlobalTheme` and `resolveTheme` runtime utilities
- CSS variable overrides for fine-grained theming
- Custom `highlight` function support (Shiki, Prism, etc.)
- In-place JS runner for `lang="js"` blocks
- Copy button with aria-label feedback
- Keyboard support (Escape to dismiss callouts)
- Documentation site with setup guides for React, Next.js, Docusaurus, Velite, Vue/Nuxt, Svelte/SvelteKit, Astro/Starlight, and VitePress
