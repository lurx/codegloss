'use client';

import codeglossConfig from '@/codegloss.config';
import { useSiteTheme } from '@/hooks';
import type { Annotation, Connection } from 'codegloss/react';
import { CodeGloss } from 'codegloss/react';

const CODE = `function fibonacci(n) {
  const memo = {};

  function fib(k) {
    if (k <= 1) return k;
    if (memo[k]) return memo[k];
    memo[k] = fib(k - 1) + fib(k - 2);
    return memo[k];
  }

  return fib(n);
}`;

const ANNOTATIONS = [
	{
		id: 'a1',
		token: 'memo',
		line: 1,
		occurrence: 0,
		title: 'Memoization table',
		text: 'Stores already-computed values to avoid repeated recursion.',
	},
	{
		id: 'a2',
		token: 'memo[k]',
		line: 5,
		occurrence: 0,
		title: 'Cache lookup',
		text: 'Returns immediately when this subproblem was solved before.',
	},
	{
		id: 'a3',
		token: 'memo[k]',
		line: 6,
		occurrence: 0,
		title: 'Cache write',
		text: 'Store the result so future calls short-circuit at the lookup.',
	},
	{
		id: 'a4',
		token: 'fib(k - 1)',
		line: 6,
		occurrence: 0,
		title: 'Recursive descent',
		text: 'Splits the problem into overlapping subproblems.',
	},
] satisfies Annotation[];

const CONNECTIONS = [
	{ from: 'a1', to: 'a2', color: '#6c5ce7' },
	{ from: 'a3', to: 'a2', color: '#00b894' },
	{
		from: 'a2',
		to: 'a4',
		color: '#f5a524',
		side: 'right',
		title: 'Cache miss',
		text: 'On a miss, the lookup falls through to the recursive descent which actually computes the value.',
	},
] satisfies Connection[];

const ARC_STYLE = {
	arrowhead: true
 };

const LIGHT_THEME = String(codeglossConfig.theme ?? '');
const DARK_THEME = String(
	codeglossConfig.darkTheme ?? codeglossConfig.theme ?? '',
);

const LINES = CODE.split('\n');

export function HeroDemo() {
	const siteTheme = useSiteTheme();

	return (
		<div className="hero-compare">
			<div className="hero-compare-panel">
				<div className="hero-compare-label">Before</div>
				<div className="hero-plain">
					<div className="hero-plain-toolbar">
						<span className="hero-plain-dots">
							<span className="hero-plain-dot" data-color="red" />
							<span className="hero-plain-dot" data-color="yellow" />
							<span className="hero-plain-dot" data-color="green" />
						</span>
						<span className="hero-plain-filename">fibonacci.js</span>
					</div>
					<pre className="hero-plain-code">
						{LINES.map((line, i) => (
							<div key={i} className="hero-plain-line">
								<span className="hero-plain-num">{i + 1}</span>
								<span>{line}</span>
							</div>
						))}
					</pre>
				</div>
			</div>
			<div className="hero-compare-panel">
				<div className="hero-compare-label">After</div>
				<CodeGloss
					code={CODE}
					lang="js"
					filename="fibonacci.js"
					theme={siteTheme === 'dark' ? DARK_THEME : LIGHT_THEME}
					annotations={ANNOTATIONS}
					connections={CONNECTIONS}
					arcs={ARC_STYLE}
					runnable={false}
				/>
			</div>
		</div>
	);
}
