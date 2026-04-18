# Pre-release checklist

Target: **`0.1.0-beta.0`** — the first public beta on npm.

This is the punch list that stands between the current repo state and
`pnpm -r publish --tag beta`. Check items off as they land.

## Required

Publish misbehaves without these.

- [ ] `"publishConfig": { "access": "public" }` on every `@codegloss/*` scoped
      package (`react`, `vue`, `svelte`, `shiki`). Scoped packages default to
      private on npm; publish will fail without this. The unscoped `codegloss`
      package is already public by default.
- [ ] `"repository"`, `"homepage"`, `"bugs"` on every `package.json`. npm's
      package page is bare without them and the GitHub "View source" links
      break.
- [ ] Per-package `README.md`. The root `README.md` doesn't end up in the
      published tarballs, so npm shows a blank page otherwise.
- [ ] `workspace:*` protocol rewrite. pnpm substitutes these to real versions
      at publish time — but the substitution only works if the five packages
      ship together at matching versions. Bumping `codegloss` without bumping
      the wrappers leaves them pointing at an unpublished version. Verify with
      `pnpm -r pack --dry-run` and grep the resulting tarball manifests.

## Strongly recommended

- [ ] Release tooling — `changesets` or a scripted `pnpm -r publish --tag beta`
      flow so all 5 packages ship as one coordinated release. Without this,
      humans forget one.
- [ ] Prepublish safety: audit `files` in each `package.json` (or add an
      `.npmignore`) and confirm the tarballs ship `dist/` + `LICENSE` +
      `README.md` and nothing else. `pnpm -r pack --dry-run` is the quickest
      check.
- [ ] `keywords` for discoverability: `codegloss`, `code-annotation`,
      `web-components`, plus per-package labels (`react`, `vue`, `svelte`,
      `shiki`, `syntax-highlighting`, `mdx`).
- [ ] Bump versions to `0.1.0-beta.0` across all five packages.
- [ ] Publish under the `beta` dist-tag (`pnpm -r publish --tag beta`) so
      `npm install codegloss` doesn't pull the beta for people on the default
      `latest` tag.

## Nice-to-have

- [ ] Per-package `CHANGELOG.md` (root one already exists) — or rely on
      Changesets to generate them.
- [ ] npm badges on the root README once packages are live (download count,
      version).
- [ ] `engines.node` audit — currently `>=18` on every package; confirm this
      is still the intended floor.
- [ ] Double-check the docs site's install snippets match the real package
      names and versions.
