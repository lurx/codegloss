# codegloss

Interactive annotated code blocks for the web — one `<code-gloss>` Web
Component that works in vanilla HTML, MDX, and every major framework, with
clickable token annotations, connection arcs, and nine bundled themes.

```bash
npm install codegloss
```

## Usage

### Vanilla HTML

```html
<script
	type="module"
	src="https://unpkg.com/codegloss/dist/index.js"
></script>

<code-gloss>
	<script type="application/json">
		{
			"code": "function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }",
			"lang": "js",
			"filename": "fib.js",
			"annotations": [
				{
					"id": "a1",
					"token": "fib",
					"line": 0,
					"occurrence": 0,
					"title": "Recursion",
					"text": "Calls itself with smaller inputs."
				}
			]
		}
	</script>
</code-gloss>
```

### Remark / MDX

````md
```js codegloss fib.js
function fib(n) {
	return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
```

```json annotations
{
	"annotations": [
		{
			"id": "a1",
			"token": "fib",
			"line": 0,
			"occurrence": 0,
			"title": "Recursion",
			"text": "Calls itself with smaller inputs."
		}
	]
}
```
````

Wire up `codegloss/remark` in your unified pipeline — `output: 'mdx'` for MDX
toolchains, `output: 'html'` for plain markdown.

## Subpath exports

| Import                                      | What it is                                                            |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `codegloss`                                 | The `<code-gloss>` Web Component (auto-registers on import).          |
| `codegloss/remark`                          | Remark plugin that turns annotated fenced blocks into `<code-gloss>`. |
| `codegloss/themes`                          | Nine bundled light/dark themes, tree-shakeable.                       |
| `codegloss/config`                          | `defineConfig` helper for `codegloss.config.ts`.                      |
| `codegloss/highlighters/{shiki,prism,hljs}` | Adapter factories for each highlighter.                               |

## Framework wrappers

Install the one you need alongside `codegloss`:

- [`@codegloss/react`](https://npmjs.com/package/@codegloss/react)
- [`@codegloss/vue`](https://npmjs.com/package/@codegloss/vue)
- [`@codegloss/svelte`](https://npmjs.com/package/@codegloss/svelte)
- [`@codegloss/shiki`](https://npmjs.com/package/@codegloss/shiki) — Shiki
  highlighter adapter plus a rehype plugin for pipelines that already use
  `@shikijs/rehype`.

## Documentation

Full guides, live previews, and the complete component API live at
<https://lurx.github.io/codegloss/>.

## License

[MIT](./LICENSE)
