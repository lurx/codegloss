---
'@codegloss/shiki': patch
---

Fix `rehypeCodeglossPre` silently skipping `<pre>` blocks nested inside
sub-root hast nodes (as produced by `rehype-raw`). The walker now recurses
into `root`-typed children as well as elements, so Velite, Astro, and
VitePress pipelines that allow raw HTML in markdown transform every fenced
block out of the box. Resolves [#12](https://github.com/lurx/codegloss/issues/12).
