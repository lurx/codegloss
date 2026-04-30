---
'codegloss': minor
---

Add `transformAllCodeFences` option to `remarkCodegloss`. When enabled, the plugin transforms every fenced code block with a language — not just those marked with the `codegloss` keyword — into a `<CodeGloss />` instance, so plain ` ```ts ` fences inherit the plugin's `theme`, `styleOverrides`, `arcs`, `callouts`, and `highlight` defaults. The marker form (` ```ts codegloss filename `) still wins and remains the only way to pair a block with an annotations JSON block; this just removes the marker requirement for un-annotated blocks so an MDX page can mix annotated and plain fences without chrome inconsistency. Off by default.
