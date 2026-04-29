import { CodeGloss } from '@codegloss/react';

export function App() {
	return (
		<main style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
			<h1>codegloss · React 18</h1>
			<p>
				The component below comes from <code>@codegloss/react</code>. There are
				zero React hooks in the wrapper — it serializes its props into a
				<code> &lt;script type=&quot;application/json&quot;&gt;</code> child of
				the underlying <code>&lt;code-gloss&gt;</code> custom element.
			</p>
			<CodeGloss
				code={
					'function fib(n) {\n  return n < 2 ? n : fib(n - 1) + fib(n - 2);\n}'
				}
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
