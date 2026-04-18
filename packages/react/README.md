# @codegloss/react

React wrapper for the [`codegloss`](https://npmjs.com/package/codegloss)
`<code-gloss>` Web Component.

```bash
npm install @codegloss/react codegloss
```

`codegloss` is a peer dependency.

## Usage

```tsx
import { CodeGloss } from '@codegloss/react';

export function Example() {
  return (
    <CodeGloss
      code="function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }"
      lang="js"
      filename="fib.js"
      annotations={[
        { id: 'a1', token: 'fib', line: 0, occurrence: 0,
          title: 'Recursion', text: 'Calls itself with smaller inputs.' },
      ]}
    />
  );
}
```

The component forwards the full `<code-gloss>` prop surface — annotations,
connection arcs, per-block `theme`, `callouts`, `arcs`, and a `highlight`
function for pre-tokenized output.

## Documentation

Full component API and live previews at
<https://lurx.github.io/codegloss/>.

## License

[MIT](./LICENSE)
