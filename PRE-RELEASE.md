# Pre-release checklist

Target: **`0.1.0`** — first public release on npm.

Stable releases ship from `main` via Changesets. Per-PR preview builds are
opt-in, published under a scoped dist-tag by a manual GitHub Action dispatch,
and never touch `main`. Check items off as they land.

## Required

Publish misbehaves without these.

- [x] `"publishConfig": { "access": "public" }` on every `@codegloss/*` scoped
      package (`react`, `vue`, `svelte`, `shiki`). Scoped packages default to
      private on npm; publish would fail without this. The unscoped
      `codegloss` package is public by default.
- [x] `"repository"`, `"homepage"`, `"bugs"` on every `package.json`.
- [x] Per-package `README.md`. npm auto-includes README files; the root
      README doesn't ship inside per-package tarballs.
- [x] `workspace:*` protocol rewrite verified — `pnpm publish` substitutes
      each wrapper's `"codegloss": "workspace:*"` to the exact pinned
      version in the published tarball. Confirmed via
      `pnpm -r pack --dry-run`.

## Strongly recommended

- [x] Prepublish safety: each tarball ships `dist/` (or `src/` for svelte) +
      `LICENSE` + `README.md` + `package.json` and nothing else. Verified
      via `pnpm -r pack --dry-run`.
- [x] All five packages at `0.1.0` in `package.json`.
- [x] `keywords` for discoverability — core set (`codegloss`,
      `code-annotation`, `annotated-code`, `syntax-highlighting`) on every
      package, plus per-package labels (`react`, `vue`, `vue3`, `svelte`,
      `shiki`, `rehype`, `web-components`, `custom-element`, `remark`,
      `mdx`, `code-blocks`).
- [ ] **Trusted Publisher** registered on npmjs.com for each of the five
      packages, pointing at this repo and `publish.yml` — **user action
      required**. Short-lived OIDC credentials replace the long-lived
      `NPM_TOKEN` secret; nothing to store in GitHub, nothing to rotate.
      Walk-through with exact field values lives in `PUBLISHERS.md`.
- [x] `.github/workflows/publish.yml` written. One file, two triggers:
      push-to-main runs the Changesets release flow (Version Packages PR →
      publish to `latest`); manual dispatch runs the PR snapshot flow
      (publishes every package under a branch-derived dist-tag). npm's
      trusted publisher config only allows one workflow per package, so
      both flows share a single file.
- [x] Changesets installed (`@changesets/cli` as workspace devDep) and
      configured with the five-package `fixed` group in
      `.changeset/config.json`.

## Nice-to-have

- [x] Per-package `CHANGELOG.md` — seeded with a `0.1.0` entry for each of
      the five packages. Changesets will prepend future entries on top.
- [x] npm badges on the root README — version, monthly downloads, and
      license (core package) sit above the existing CI/quality badges.
- [x] `engines.node` bumped from `>=18` to `>=20` on every package. Node 18
      hit EOL in April 2025 and `shiki@3+` (peer dep of `@codegloss/shiki`)
      already requires Node 20+.
- [x] Docs site install snippets match the real package names — audited
      every `<InstallTabs packages="...">` occurrence under
      `apps/site/content/docs`; all line up with the five published packages.

## Release workflow

### First release

Two things conspire to force the first release off-CI: Changesets bumps
from the current `package.json` version (so a Changesets-driven release
would ship `0.1.1` rather than `0.1.0`), and npm Trusted Publishing can
only attach to a package name that already exists. Cut the first release
from your laptop — the one-time 2FA prompt claims each name — then wire
Trusted Publishers on npmjs.com and hand everything subsequent to the CI
workflows.

```bash
pnpm login                           # browser OAuth + 2FA
pnpm -w run build:packages
pnpm -r publish --access public      # publishes codegloss + @codegloss/*
git tag v0.1.0
git push --tags
```

`pnpm publish` rewrites each wrapper's `"codegloss": "workspace:*"` to the
exact pinned version in the published tarball.

Once every package name exists on npm, register the repo as a Trusted
Publisher for each one before opening the next PR — the CI workflows
assume OIDC auth and won't succeed otherwise.

### Per-PR snapshots (manual dispatch)

Reviewers install a PR's changes straight from npm under a scoped dist-tag,
without the PR ever merging. Snapshots are opt-in per PR via the Actions UI.
The snapshot job lives inside `.github/workflows/publish.yml` alongside the
release job; the `workflow_dispatch` trigger selects the snapshot branch.

**Dispatch:** Actions tab → _Publish_ → _Run workflow_ → leave _Use workflow
from_ on `main` and paste the PR branch name into the `ref` input. The
workflow definition is always read from `main`, so every open PR is
dispatchable regardless of when it branched off.

The resulting tarball publishes at e.g.
`codegloss@0.1.0-<branch-slug>-20260418124500` under dist-tag
`<branch-slug>`. Reviewers:

```bash
npm i codegloss@<branch-slug> @codegloss/react@<branch-slug>
```

Snapshot versions sit on npm's version list forever — `npm deprecate` them
after the PR merges (or run a periodic sweep), since npm can't hard-delete
a published version.

### Main → stable (Changesets)

**One-time setup:**

1. `pnpm add -Dw @changesets/cli && pnpm changeset init`.
2. Edit `.changeset/config.json` — add a `fixed` group covering all five
   packages. This forces any bump to drag all five along together, so
   wrappers never peer-depend on an unpublished version of core.
   ```json
   "fixed": [[
     "codegloss",
     "@codegloss/react",
     "@codegloss/vue",
     "@codegloss/svelte",
     "@codegloss/shiki"
   ]]
   ```
3. Install the `changesets/action` GitHub Action on `main`. No `NPM_TOKEN`
   secret needed — `publish.yml` authenticates via npm Trusted Publishing
   (OIDC), which is why it sets `permissions: id-token: write`.
4. Register this repo as a Trusted Publisher for each of the five packages
   on npmjs.com, pointing at `publish.yml`. Details in `PUBLISHERS.md`.

**Per feature, starting on `main`:**

1. `git checkout -b feat/foo`
2. Write the code.
3. `pnpm changeset` — interactive prompt: pick affected packages, pick a
   bump per package (patch / minor / major), write a one-line summary.
   Creates `.changeset/<three-word-slug>.md`.
4. Commit code + changeset file together. Push, open PR.
5. _(Optional)_ dispatch the snapshot workflow above so reviewers can test
   the PR's npm output directly.
6. Merge PR.

**Release (batches one or more merged PRs):**

7. The Changesets Action watches `main`, sees unconsumed `.changeset/*.md`
   files, and opens a standing **Version Packages** PR — version bumps
   across the five `package.json`s, updated `CHANGELOG.md` entries,
   consumed changesets deleted. No code in it.
8. Merge it. The Action runs `pnpm changeset publish`, pushes tarballs to
   npm under the default `latest` tag, and pushes git tags like
   `codegloss@0.2.0`.

**What persists in `.changeset/`:** `config.json` and `README.md`. Only the
per-feature `*.md` entries are consumed and deleted by `changeset version`.

**Fully local fallback** (no GitHub Action): between steps 6 and 8, run
`pnpm changeset version && git commit -am "Version Packages" && git push`,
merge, then `pnpm -r publish` from `main`.
