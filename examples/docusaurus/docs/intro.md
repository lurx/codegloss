---
sidebar_position: 1
---

# codegloss in Docusaurus

The fenced codegloss block below is rewritten into a `<CodeGloss />` component by
`remark-codegloss`. The component itself is provided via the swizzled
`MDXComponents` theme override in `src/theme/MDXComponents.tsx`.

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
