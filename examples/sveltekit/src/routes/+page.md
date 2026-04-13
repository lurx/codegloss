<script>
  import CodeGloss from '@codegloss/svelte';

  const fibAnnotations = [
    {
      id: 'a1',
      token: 'fib',
      line: 0,
      occurrence: 0,
      title: 'Recursion',
      text: 'Calls itself with smaller inputs.',
    },
  ];
</script>

# codegloss · SvelteKit + mdsvex

This example demonstrates two ways to embed `<code-gloss>` in a SvelteKit
markdown page.

## 1 — Manual `<CodeGloss />` invocation (via the typed Svelte wrapper)

This path imports the wrapper from `@codegloss/svelte` and invokes it directly.
It gives you full prop typing in `svelte-check`.

<CodeGloss
  code={`function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}`}
  lang="js"
  filename="fib.js"
  annotations={fibAnnotations}
/>

## 2 — Fenced sandbox (via `remark-codegloss` in HTML mode)

This path uses `remark-codegloss` registered in `mdsvex` with `output: 'html'`,
so the fenced block below is rewritten into a raw `<code-gloss>` HTML node that
mdsvex passes through verbatim.

```js sandbox greet.js
const greet = (name) => `hello, ${name}`;
greet('world');
```
