# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

- **Breaking:** package ships as ESM only. The `./remark` subpath keeps a CJS twin for older remark/content pipelines (Docusaurus with jiti-loaded `.ts` configs, etc.); every other entry is ESM-only. Consumers on bundlers (Vite, Next, webpack 5, Rollup, esbuild) are unaffected. Minimum Node for tooling bumped to 18.
- Unpacked package size roughly halved (179 KB → 93 KB).

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
