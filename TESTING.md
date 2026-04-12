# Testing Strategy

codegloss uses three layers of tests that run independently in CI. Each layer has a narrow job — combined they keep the runtime, the framework wrappers, the remark plugin, and every example integration honest.

```
┌─────────────────────────────────────────────────────────────────┐
│  Unit (Vitest)                                                   │
│    pure helpers, web-component DOM behavior, wrappers, remark    │
├─────────────────────────────────────────────────────────────────┤
│  Build integration (per-example scripts)                         │
│    every example app builds + asserts on its output              │
├─────────────────────────────────────────────────────────────────┤
│  E2E (Playwright)                                                │
│    real browsers driving the built `<code-gloss>` runtime        │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Unit — `packages/codegloss`

**Runner:** Vitest 4, two projects defined in [`packages/codegloss/vitest.config.ts`](./packages/codegloss/vitest.config.ts):

| Project | Environment | Include pattern | Purpose |
| --- | --- | --- | --- |
| `node`  | `node`       | `**/__tests__/**/*.test.ts(x)` (excluding `.dom.test.*`) | Pure helpers, SSR wrappers, remark pipeline |
| `dom`   | `happy-dom`  | `**/__tests__/**/*.dom.test.ts(x)`                       | Custom-element lifecycle, arcs rendering, themes applied to a host |

The `.dom.test.ts` suffix is load-bearing — it routes tests into the `happy-dom` project. Don't rename files without updating `vitest.config.ts`.

**Coverage:** v8 provider, **100% thresholds** enforced on lines / branches / functions / statements across the files listed in `include`. A few genuinely defensive branches are marked with `/* c8 ignore next */` + a comment explaining why (e.g. `observedAttributes` guards that can't fire while the list is `['theme']`).

**Run locally:**

```bash
pnpm -w run test:unit          # all unit tests, no coverage
pnpm -w run test:coverage      # same, with coverage + threshold gate
pnpm --filter codegloss test:watch
```

**CI:** [`.github/workflows/unit.yml`](./.github/workflows/unit.yml) runs `test:coverage` on every PR and uploads `lcov.info` to Codecov. A `pretest*` hook in `packages/codegloss/package.json` runs the inline-css generator first, since the generated styles file is gitignored.

## 2. Build integration — `examples/*`

Each example is a **real consumer** of the published `codegloss` workspace package — React 18, React 19, Next.js (app + static), Vue/Vitepress, Svelte/SvelteKit, Astro/Starlight, Docusaurus, Velite, plain markdown, and vanilla HTML. Every example has its own `test` script that:

1. Builds the app (Vite, webpack, rollup, astro, whatever the framework uses).
2. Runs a small `test.mjs` or similar that asserts the built output contains what it should (a `<code-gloss>` tag, the JSON config script, the runtime bundle, etc.).

**Why this layer exists:** TypeScript compilation doesn't catch all module-resolution problems. An example that imports from `codegloss/react` will surface broken `exports` maps, wrong `types` entries, or a missing subpath the moment its bundler runs.

**Run locally:**

```bash
pnpm -w run build:packages                       # build codegloss first
pnpm -w run test:examples                        # build and assert every example
pnpm --filter @codegloss-examples/react-19 test  # one example at a time
```

**CI:** [`.github/workflows/integration.yml`](./.github/workflows/integration.yml) matrices over every example directory and runs that example's `test` script in isolation. One broken example doesn't mask the others.

## 3. End-to-end — `test/e2e`

**Runner:** Playwright, matrixed over chromium / firefox / webkit. Config in [`test/e2e/playwright.config.ts`](./test/e2e/playwright.config.ts).

**How it works:** the suite serves a static `test/e2e/fixtures/` directory on port 4173. Before each run, [`scripts/copy-runtime.mjs`](./test/e2e/scripts/copy-runtime.mjs) copies `packages/codegloss/dist/` into `fixtures/codegloss/` so the fixture pages can load the locally built runtime via `<script type="module" src="/codegloss/index.js">`. This means the E2E layer tests exactly the artifact published to consumers, not a dev build.

**Spec files** exercise every user-visible surface:

- `smoke.spec.ts` — the element mounts and renders.
- `annotation-callout.spec.ts` — click a token, callout appears with the right content.
- `connection-popover.spec.ts` — arc click opens a popover with title + body.
- `copy-button.spec.ts` — clipboard, icon swap, aria-label cycle.
- `run-button.spec.ts` — inline JS evaluation, `▶ Run` ↔ `↻ Run again`.
- `keyboard-navigation.spec.ts` — Escape closes callouts, tab order is sensible.
- `theming.spec.ts` — setting the `theme` attribute swaps the adopted stylesheet.
- `with-mark-down.spec.ts` — remark-emitted `<code-gloss>` hydrates correctly.
- `accessibility.spec.ts` — axe-core scan of the rendered element.

**Run locally:**

```bash
pnpm --filter @codegloss/e2e install-browsers    # one-time Playwright browser install
pnpm -w run test:e2e                             # build + run all browsers
pnpm --filter @codegloss/e2e test --project=chromium  # one browser
pnpm --filter @codegloss/e2e test:headed         # watch it run
pnpm --filter @codegloss/e2e test:ui             # Playwright UI mode
```

**CI:** [`.github/workflows/e2e.yml`](./.github/workflows/e2e.yml) runs each browser in a separate job, uploads traces on failure as an artifact (`playwright-traces-<browser>`) with a 7-day retention.

## When to add tests where

| Change | Layer |
| --- | --- |
| New pure helper (tokenize, escape, etc.) | Unit — `node` project |
| New custom-element DOM behavior | Unit — `dom` project, `.dom.test.ts` |
| New subpath export (`codegloss/foo`) | Build integration — add or extend an example that imports it |
| New visible user interaction | E2E — add a spec |
| Framework-specific wrapper change (React/Vue/Svelte) | Unit for the wrapper + build integration for the matching example |
| Remark plugin option | Unit (`remark/index.test.ts`) + at least one example that uses it |

A feature usually earns tests in at least two layers: unit for the logic, integration or E2E for the shape consumers actually see.

## Coverage discipline

The 100% threshold is deliberate. When adding code that can't realistically be covered (defensive DOM guards, spec-required callbacks for attributes that aren't observed, etc.), add `/* c8 ignore next */` **with a comment explaining why the branch is unreachable** — don't lower the threshold. Raise the bar over time as layers fill in; never lower it casually.
