# Documentation Review: CodeGloss

## What's Good

### 1. Excellent information architecture

The docs are well-organized into logical sections: Getting Started -> Plugin -> API -> Theming -> Examples, plus framework-specific setup guides. The sidebar ordering makes sense for progressive disclosure — users learn the basics before diving into API details.

### 2. The API reference is thorough and well-structured

`api.mdx` is the strongest page. It covers the Web Component, React wrapper, full config shape, all types with inline explanations, custom highlighting, config file resolution order, arc style options, and the programmatic config loader. Tables are clean and consistent. The `Annotation` and `Connection` type docs include field-by-field explanations that go beyond just listing types.

### 3. The remark plugin docs are production-grade

`plugin.mdx` covers detection patterns, both output modes, all three options with full type definitions, configuration examples for multiple frameworks, and an "Edge cases" section that anticipates real-world problems (malformed JSON, missing blocks, duplicate imports, script tag escaping). This is the kind of docs that save support tickets.

### 4. Framework setup guides are practical and complete

The Next.js guide covers three paths (direct React, `@next/mdx`, `next-mdx-remote`), explains `skipImport`, and even mentions static export compatibility. Docusaurus covers swizzling MDX components and dark mode CSS variable bridging. Velite explains the `useMdxComponent` pattern and the webpack plugin setup. These are copy-paste-and-go guides.

### 5. "No CSS import needed" is repeated in the right places

This is a key DX win and it's mentioned on the API page, theming page, and each setup guide. Good — users will land on different pages first, and this removes a common friction point.

### 6. The theming page is well-layered

It goes from simple (named theme attribute) -> medium (global theme via plugin or JS) -> advanced (CSS variable overrides) -> edge case (external highlighter interaction). The CSS variable table with light/dark defaults is a useful reference.

### 7. Examples page is smart

Using the tool's own remark plugin to render the examples is a great "dogfooding" approach — it proves the tool works and gives users real MDX source to study.

---

## What's Bad

### 1. The homepage undersells the product

- The hero tagline "Annotated code, explained." is fine but generic. It doesn't communicate what makes CodeGloss different from comment-based annotation tools or other code block libraries.
- The three features (Interactive Annotations, Connection Arcs, MDX Native) are described in one sentence each. There's no visual indication of what they look like — no screenshots, no GIFs, no inline demos for each feature. The `HeroDemo` component exists but it's a single demo; the individual feature cards have no visuals.
- The Quick Start section uses raw `<pre>` tags with no syntax highlighting. For a tool that's literally about making code blocks beautiful, this is ironic. The homepage code snippets look worse than what the tool produces.

### 2. The README has a placeholder CDN URL

Line 27: `https://cdn.example.com/codegloss` — this is clearly a placeholder that was never updated. A user trying the vanilla HTML quick start will get a 404. It should point to unpkg or jsdelivr (the `api.mdx` page correctly uses `https://unpkg.com/codegloss/dist/index.js`).

### 3. No "Why CodeGloss?" or positioning section anywhere

Neither the homepage, README, nor Getting Started page explains the problem CodeGloss solves or why someone would choose it over alternatives (e.g., Shiki's annotations, Expressive Code, custom rehype plugins, or just comments in code). There's no "before/after" narrative despite the CSS having `.hero-compare` styles that suggest one was planned.

### 4. Getting Started — good tabs, but missing the "result" step

The `<UsageTabs />` component is well done — it covers MDX/Remark, React, Vue, Svelte, and Vanilla HTML with syntax-highlighted code and clear setup instructions per framework. However, the page still doesn't show what the output looks like. A new user follows the steps but never sees a rendered annotated code block on this page. A "here's what you'll get" screenshot or live preview after the tabs would close the loop and build confidence.

### 5. Missing Vue and Svelte setup guides

There are dedicated guides for Next.js, Docusaurus, and Velite, but nothing for Vue (Nuxt?) or Svelte (SvelteKit). The README lists these as supported frameworks, and there are example apps in the repo for SvelteKit, but no docs page for setting them up.

### 6. Missing Astro/VitePress setup guides

Both have example apps in `examples/` but no documentation page. Astro Starlight and VitePress are major documentation tools — their users are a core audience for CodeGloss.

### 7. No search functionality

The docs site has no search. For a docs site with this many pages and configuration options, search is a baseline expectation.

### 8. The README links to a raw MDX file

Line 139: `See the [Component API docs](./apps/site/content/docs/api.mdx)` — this links to the source `.mdx` file in the repo, not to the rendered docs site URL. Users on GitHub clicking this will see raw MDX, not the rendered page.

### 9. No sidebar navigation between setup guides

The setup guides (`setup/nextjs.mdx`, `setup/docusaurus.mdx`, `setup/velite.mdx`) don't appear to be grouped under a "Setup" section in the sidebar — they have `sidebar_position` but no parent grouping. The Getting Started page links to them, but a user browsing the sidebar may not discover them.

### 10. No changelog or versioning docs

There's no CHANGELOG, no "What's new" page, no migration guide. For a library with framework wrappers and a remark plugin, breaking changes could easily trip up users upgrading.

### 11. The `examples.mdx` page lacks context for non-MDX usage

All examples are MDX-rendered code blocks. There's no example of direct React usage (`<CodeGloss code="..." />`), no vanilla HTML example, and no example of using the HTML output mode. The page title says "Examples" but it only demonstrates one usage pattern.

### 12. Inconsistent import style in docs

The plugin page and setup guides use `require()` (CJS) syntax, while the API page and theming page use ES `import`. This is confusing — pick one or explicitly note when CJS is needed (e.g., for config files that don't support ESM).

### 13. The homepage has no responsive design indicators

The CSS has no `@media` queries for the homepage layout. The 3-column feature grid and side-by-side hero layout will likely break on mobile.

### 14. No accessibility documentation

For an interactive component with popovers, keyboard navigation matters. There's no mention of keyboard support (can you Tab to annotations? Does Escape close callouts?), ARIA attributes, or screen reader behavior.

---

## Summary

The **technical reference docs** (API, Plugin, Theming) are strong — thorough, well-organized, and anticipate edge cases. The **framework setup guides** are practical and copy-paste ready.

The weaknesses are in **onboarding and marketing**: the homepage doesn't show off the product well enough, the Getting Started page is too thin, the README has a broken CDN link, and there are gaps in framework coverage (Vue, Svelte, Astro, VitePress). The docs also lack quality-of-life features (search, changelog, accessibility docs, responsive design).
