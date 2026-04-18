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
- [ ] `NPM_TOKEN` repo secret configured — **user action required**
      (GitHub repo Settings → Secrets and variables → Actions). Powers both
      the PR snapshot dispatch and the Changesets Action.
- [x] `.github/workflows/pr-snapshot.yml` written (per-PR preview
      publishes — see below). Ready to dispatch once merged to `main`.
- [x] `.github/workflows/release.yml` written using `changesets/action`
      (the Version Packages PR flow — see below). Activates on merge to
      `main`.
- [x] Changesets installed (`@changesets/cli` as workspace devDep) and
      configured with the five-package `fixed` group in
      `.changeset/config.json`.

## Nice-to-have

- [ ] Per-package `CHANGELOG.md` — Changesets generates these automatically
      from the first consumed changeset onward.
- [ ] npm badges on the root README once packages are live (download count,
      version).
- [x] `engines.node` bumped from `>=18` to `>=20` on every package. Node 18
      hit EOL in April 2025 and `shiki@3+` (peer dep of `@codegloss/shiki`)
      already requires Node 20+.
- [x] Docs site install snippets match the real package names — audited
      every `<InstallTabs packages="...">` occurrence under
      `apps/site/content/docs`; all line up with the five published packages.

## Release workflow

### First release

Changesets bumps from the current `package.json` version on every release.
With all five packages already at `0.1.0`, a Changesets-driven release
would ship `0.1.1` (or higher), not `0.1.0`. Cut the first release
manually, then hand subsequent releases to Changesets:

```bash
pnpm -w run build:packages
pnpm -r publish --access public
git tag v0.1.0
git push --tags
```

`pnpm publish` rewrites each wrapper's `"codegloss": "workspace:*"` to the
exact pinned version in the published tarball.

### Per-PR snapshots (manual dispatch)

Reviewers install a PR's changes straight from npm under a scoped dist-tag,
without the PR ever merging. Snapshots are opt-in per PR via the Actions UI.

`.github/workflows/pr-snapshot.yml`:

```yaml
name: Publish PR snapshot

on:
  workflow_dispatch:
    inputs:
      ref:
        description: Branch or any ref to publish from
        required: true
        type: string

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.ref }}
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - run: pnpm -w run build:packages
      - name: Derive snapshot tag
        id: tag
        run: |
          t=$(echo "${{ inputs.ref }}" | tr '/' '-' | tr '[:upper:]' '[:lower:]')
          echo "tag=$t" >> "$GITHUB_OUTPUT"
      - run: pnpm changeset version --snapshot ${{ steps.tag.outputs.tag }}
      - run: pnpm -r publish --no-git-tag-version --tag ${{ steps.tag.outputs.tag }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Dispatch:** Actions tab → *Publish PR snapshot* → *Run workflow* → leave
*Use workflow from* on `main` and paste the PR branch name into the `ref`
input. The workflow definition is always read from `main`, so every open PR
is dispatchable regardless of when it branched off.

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
3. Install the `changesets/action` GitHub Action on `main` with the
   `NPM_TOKEN` repo secret.

**Per feature, starting on `main`:**

1. `git checkout -b feat/foo`
2. Write the code.
3. `pnpm changeset` — interactive prompt: pick affected packages, pick a
   bump per package (patch / minor / major), write a one-line summary.
   Creates `.changeset/<three-word-slug>.md`.
4. Commit code + changeset file together. Push, open PR.
5. *(Optional)* dispatch the snapshot workflow above so reviewers can test
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
