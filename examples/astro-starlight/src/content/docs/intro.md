---
title: codegloss in Astro + Starlight
description: Annotated code blocks via the framework-agnostic Web Component
---

This page is rendered by Starlight (Astro 5). The fenced codegloss block below is
rewritten into a raw `<code-gloss>` HTML node by `remark-codegloss` (configured
with `output: 'html'`). The codegloss runtime is loaded via a `<script type="module">`
in the head, so the WC upgrades on the client without any framework wrapper.

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
