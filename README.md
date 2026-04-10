# codegloss

[![Unit tests](https://github.com/lurx/codegloss/actions/workflows/unit.yml/badge.svg)](https://github.com/lurx/codegloss/actions/workflows/unit.yml)
[![Integration tests](https://github.com/lurx/codegloss/actions/workflows/integration.yml/badge.svg)](https://github.com/lurx/codegloss/actions/workflows/integration.yml)
[![codecov](https://codecov.io/gh/lurx/codegloss/branch/main/graph/badge.svg)](https://codecov.io/gh/lurx/codegloss)

Interactive annotated code blocks for the web. Drop a `<code-gloss>` element on any page — vanilla HTML, React, Vue, Svelte, Next.js, Astro, VitePress, Docusaurus, or plain markdown — and get clickable token annotations, connection arcs, copy buttons, and an in-place JS runner.

## Packages

| Package | What it is |
|---|---|
| [`codegloss`](./packages/codegloss) | The `<code-gloss>` Web Component plus thin, zero-state wrappers for **React** (`codegloss/react`), **Vue** (`codegloss/vue`), and **Svelte** (`codegloss/svelte`). Each wrapper just JSON-stringifies its props into the WC's config script. |
| [`remark-codegloss`](./packages/remark-codegloss) | A remark plugin that turns annotated code fences into `<code-gloss>` elements. Supports both MDX (`output: 'mdx'`) and plain-HTML (`output: 'html'`) output. |

## Quick start

### Vanilla HTML

```html
<script type="module" src="https://cdn.example.com/codegloss"></script>

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
  ]
}
```
````

Wire up `remark-codegloss` in your unified pipeline (default `output: 'mdx'` for MDX, `output: 'html'` for plain markdown).

## Repo layout

```
packages/
  codegloss/         # web component + React wrapper
  remark-codegloss/  # remark plugin
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
