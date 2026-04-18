# codegloss · VitePress

VitePress (Vite + Vue) hosting the codegloss Web Component via the
`@codegloss/vue` wrapper. The wrapper is registered globally in
`docs/.vitepress/theme/index.ts`, and `isCustomElement` is set in the Vite
config so the underlying `<code-gloss>` HTML element doesn't trigger a Vue
"unknown element" warning.

<CodeGloss
  code="function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}"
  lang="js"
  filename="fib.js"
  :annotations="[{
    id: 'a1',
    token: 'fib',
    line: 0,
    occurrence: 0,
    title: 'Recursion',
    text: 'Calls itself with smaller inputs.'
  }]"
/>
