import { CodeGloss } from '@codegloss/react';

export function App() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      <h1>codegloss · React 19</h1>
      <p>
        Same wrapper as the React 18 example. The wrapper has zero React API
        surface, so it works on every React major from 16.14 onward.
      </p>
      <CodeGloss
        code={'function fib(n) {\n  return n < 2 ? n : fib(n - 1) + fib(n - 2);\n}'}
        lang="js"
        filename="fib.js"
        annotations={[
          {
            id: 'a1',
            token: 'fib',
            line: 0,
            occurrence: 0,
            title: 'Recursion',
            text: 'Calls itself with smaller inputs.',
          },
        ]}
      />
    </main>
  );
}
