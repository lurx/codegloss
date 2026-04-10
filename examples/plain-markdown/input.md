# Plain markdown demo

This file is rendered to HTML by `unified()` + `remark-codegloss({ output: 'html' })`.
The output is a regular static HTML file you could drop into any blog.

```js sandbox fib.js
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
