# codegloss

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=lurx_codegloss&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=lurx_codegloss)
[![Unit tests](https://github.com/lurx/codegloss/actions/workflows/unit.yml/badge.svg)](https://github.com/lurx/codegloss/actions/workflows/unit.yml)
[![Integration tests](https://github.com/lurx/codegloss/actions/workflows/integration.yml/badge.svg)](https://github.com/lurx/codegloss/actions/workflows/integration.yml)
[![codecov](https://codecov.io/gh/lurx/codegloss/branch/main/graph/badge.svg)](https://codecov.io/gh/lurx/codegloss)
[![XO code style](https://shields.io/badge/code_style-5ed9c7?logo=xo&labelColor=gray&logoSize=auto)](https://github.com/xojs/xo)

Interactive annotated code blocks for the web. Drop a `<code-gloss>` element on any page — vanilla HTML, React, Vue, Svelte, Next.js, Astro, VitePress, Docusaurus, or plain markdown — and get clickable token annotations, connection arcs, copy buttons, and an in-place JS runner.

**Highlights**

- **Annotations** — click any highlighted token for context. Render inline by default or as a floating popover via `annotation.popover: true` / `callouts.popover: true` on the block.
- **Connection arcs** — visual arcs between related annotations. Render in the fixed left gutter (default) or on the right with `connection.side: 'right'`, anchored at each line's text end. Turn on marker-end arrowheads with `arcs.arrowhead: true`.
- **Pre-opened callouts** — set `defaultOpen: true` on an annotation or connection to surface it on first render (walkthrough style). At most one of each per block; last-wins cascade if multiple are marked.
- **Framework-agnostic** — one Web Component, thin wrappers for React, Vue, and Svelte, and a remark plugin that covers MDX and plain markdown pipelines.
- **Themeable** — 9 bundled light/dark themes plus full CSS variable overrides; auto-swaps via `prefers-color-scheme`.

## Entry points

| Import | What it is |
|---|---|
| `codegloss` | The `<code-gloss>` Web Component (auto-registers on import). |
| `codegloss/react` | Thin React wrapper. |
| `codegloss/vue` | Thin Vue 3 wrapper. |
| `codegloss/svelte` | Thin Svelte wrapper. |
| `codegloss/remark` | Remark plugin — turns annotated fenced code blocks into `<code-gloss>` elements. Supports MDX and plain-HTML output. |
| `codegloss/themes` | Bundled themes (tree-shakeable). |
| `codegloss/config` | `defineConfig` helper for `codegloss.config.ts`. |

## Quick start

### Vanilla HTML

```html
<script type="module" src="https://unpkg.com/codegloss/dist/index.js"></script>

<code-gloss>
  <script type="application/json">
    {
      "code": "function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }",
      "lang": "js",
      "filename": "fib.js",
      "annotations": [
        { "id": "a1", "token": "fib", "line": 0, "occurrence": 0,
          "title": "Recursion", "text": "Calls itself with smaller inputs." }
      ]
    }
  </script>
</code-gloss>
```

### React

```tsx
import { CodeGloss } from 'codegloss/react';

export function Example() {
  return (
    <CodeGloss
      code="function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }"
      lang="js"
      filename="fib.js"
      annotations={[
        { id: 'a1', token: 'fib', line: 0, occurrence: 0,
          title: 'Recursion', text: 'Calls itself with smaller inputs.' },
      ]}
    />
  );
}
```

### Vue

```vue
<script setup lang="ts">
import { CodeGloss } from 'codegloss/vue';
</script>

<template>
  <CodeGloss
    code="function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }"
    lang="js"
    filename="fib.js"
  />
</template>
```

### Svelte

```svelte
<script>
  import CodeGloss from 'codegloss/svelte';
</script>

<CodeGloss
  code={`function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }`}
  lang="js"
  filename="fib.js"
/>
```

### Theming

Apply a named theme to any code block:

```html
<code-gloss theme="github-dark">
```

```tsx
<CodeGloss code="..." lang="js" theme="dracula" />
```

**Bundled themes:** `github-light`, `github-dark`, `one-light`, `one-dark`, `dracula`, `nord-light`, `nord-dark`, `vitesse-light`, `vitesse-dark`.

Set a default theme for all blocks via the remark plugin:

```js
remarkCodegloss({ theme: 'github-dark' })
```

Or apply globally in vanilla JS:

```js
import { applyGlobalTheme } from 'codegloss';
applyGlobalTheme('github-dark');
```

Themes cover both syntax token colors and UI chrome (background, borders, annotations). CSS variable overrides still win over theme values.

### Config file

Set project-wide defaults in a `codegloss.config.ts` (or `.codeglossrc.json`, `codegloss.config.js`, etc.):

```ts
import { defineConfig } from 'codegloss/config';

export default defineConfig({
  theme: 'github-dark',
  arcs: {
    strokeDasharray: 'none',  // solid arcs
    opacity: 0.7,
  },
});
```

The config file sets defaults for themes, connection arc styles, and more. See the [Component API docs](https://lurx.github.io/codegloss/docs/api/) for all options.

### Markdown / MDX

````md
```js sandbox fib.js
function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }
```

```json annotations
{
  "annotations": [
    { "id": "a1", "token": "fib", "line": 0, "occurrence": 0,
      "title": "Recursion", "text": "Calls itself with smaller inputs." }
  ],
  "connections": [
    { "from": "a1", "to": "a1", "color": "#534AB7", "side": "right" }
  ],
  "arcs":    { "arrowhead": true },
  "callouts": { "popover": true }
}
```
````

The annotations block accepts four top-level keys: `annotations`, `connections`, `arcs` (per-block arc-style overrides like `arrowhead`), and `callouts` (per-block callout behavior like `popover`). Each is forwarded verbatim as its own prop on the emitted component.

Wire up `codegloss/remark` in your unified pipeline (default `output: 'mdx'` for MDX, `output: 'html'` for plain markdown).

## Repo layout

```
packages/
  codegloss/         # everything: web component, framework wrappers, remark plugin, themes, config
apps/
  dev/               # local dev playground
  site/              # documentation site (deployed via .github/workflows/deploy.yml)
```

## Development

```bash
pnpm install
pnpm -w run dev              # run the docs site locally
pnpm -w run build            # build all packages and the site
pnpm -w run test:unit        # run unit tests for both packages
pnpm -w run test:coverage    # run unit tests with v8 coverage (enforces 100%)
pnpm -w run test:examples    # build every example app and assert on its output
pnpm -w run test:e2e         # build packages, then run Playwright e2e suite
```

> The `-w` (`--workspace-root`) flag is required by pnpm 10 when invoking a
> root-level script from a workspace that also contains nested packages with
> their own scripts. Without it, `pnpm <script>` searches the workspace
> packages first and errors out.

Coverage thresholds are enforced at 100% lines/branches/functions/statements per package via Vitest.

## Testing

See [`TESTING.md`](./TESTING.md) for the layered testing strategy (unit → build integration → E2E).
