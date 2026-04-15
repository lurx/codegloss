# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Added

- New wrapper packages — `@codegloss/react`, `@codegloss/vue`, `@codegloss/svelte`. Each installs independently and declares `codegloss` as a peer dependency, so users only pay for the wrapper they actually use.
- `setDefaultHighlighter(fn)` API on the `codegloss` entry — register a syntax highlighter once at startup and every `<code-gloss>` on the page picks it up (mounted blocks refresh in place).
- Syntax-highlighter adapter subpaths — `codegloss/highlighters/shiki`, `codegloss/highlighters/prism`, `codegloss/highlighters/hljs`. Each is ~100 B of glue; `shiki`, `prismjs`, and `highlight.js` are declared as optional peer dependencies.
- `CodeGlossElement.refresh()` — tears down listeners and rebuilds the shadow DOM. Mainly used internally by `setDefaultHighlighter`, but exposed for imperative consumers.

### Changed

- `Highlighter` signature is now `(code, lang) => string` (a single HTML blob). codegloss splits it into lines internally, preserving open spans across newlines, so any tool that emits span-wrapped tokens works.
- Framework wrappers moved out of the main package. Imports are now `@codegloss/react`, `@codegloss/vue`, `@codegloss/svelte` (previously `codegloss/react`, etc.). The remark plugin now injects the `@codegloss/react` import.
- Main package ships as ESM only. The `./remark` subpath keeps a CJS twin for older remark/content pipelines (Docusaurus with jiti-loaded `.ts` configs, etc.); every other entry is ESM-only. Minimum Node for tooling is 18.
- Core `codegloss` package footprint dropped further (179 KB → 85 KB unpacked) now that wrappers ship separately.

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
