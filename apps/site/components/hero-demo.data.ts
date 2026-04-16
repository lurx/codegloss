import type { Annotation, Connection } from '@codegloss/react';

export const HERO_CODE = `function fibonacci(n) {
  const memo = {};

  function fib(k) {
    if (k <= 1) return k;
    if (memo[k]) return memo[k];
    memo[k] = fib(k - 1) + fib(k - 2);
    return memo[k];
  }

  return fib(n);
}`;

export const HERO_ANNOTATIONS = [
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

export const HERO_CONNECTIONS = [
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

export const HERO_ARC_STYLE = {
	arrowhead: true,
};
