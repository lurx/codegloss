'use client';

import { useState } from 'react';
import { CodeGloss } from 'codegloss/react';
import type { Annotation, Connection } from 'codegloss/react';

const THEME_NAMES = [
	'github-light',
	'github-dark',
	'one-light',
	'one-dark',
	'dracula',
	'nord-light',
	'nord-dark',
	'vitesse-light',
	'vitesse-dark',
] as const;

const CODE = `async function fetchUsers(ids: string[]) {
  const cache = new Map<string, User>();

  const results = await Promise.all(
    ids.map(async id => {
      if (cache.has(id)) return cache.get(id)!;
      const user = await api.get(\`/users/\${id}\`);
      cache.set(id, user);
      return user;
    }),
  );

  return results;
}`;

const ANNOTATIONS: Annotation[] = [
	{
		id: 't1',
		token: 'cache',
		line: 1,
		occurrence: 0,
		title: 'Request cache',
		text: 'Deduplicates fetches within a single call. If the same ID appears twice in the array, only one request is made.',
	},
	{
		id: 't2',
		token: 'Promise.all',
		line: 3,
		occurrence: 0,
		title: 'Concurrent fetching',
		text: 'Fires all requests in parallel rather than sequentially. Total time ≈ slowest single request.',
	},
	{
		id: 't3',
		token: 'cache.has(id)',
		line: 4,
		occurrence: 0,
		title: 'Cache hit',
		text: 'Returns the already-fetched user without a network round-trip.',
	},
];

const CONNECTIONS: Connection[] = [
	{
		from: 't1',
		to: 't3',
		color: '#534AB7',
		title: 'Write → Read',
		text: 'The map is populated on line 7 and checked on line 5. Duplicate IDs hit the cache on the second pass.',
	},
];

export function ThemeShowcase() {
	const [activeTheme, setActiveTheme] =
		useState<(typeof THEME_NAMES)[number]>('github-dark');

	return (
		<div>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: '6px',
					marginBottom: '1rem',
				}}
			>
				{THEME_NAMES.map(name => {
					const isActive = name === activeTheme;

					return (
						<button
							key={name}
							type="button"
							onClick={() => setActiveTheme(name)}
							style={{
								padding: '4px 10px',
								borderRadius: '6px',
								border: '1px solid',
								borderColor: isActive
									? 'var(--accent-light)'
									: 'var(--site-border)',
								background: isActive
									? 'var(--site-active-bg)'
									: 'transparent',
								color: isActive
									? 'var(--accent-light)'
									: 'var(--site-muted)',
								cursor: 'pointer',
								fontSize: '0.8125rem',
								fontFamily: 'monospace',
								transition:
									'border-color 150ms ease, color 150ms ease',
							}}
						>
							{name}
						</button>
					);
				})}
			</div>
			<CodeGloss
				code={CODE}
				lang="ts"
				filename="fetch-users.ts"
				theme={activeTheme}
				annotations={ANNOTATIONS}
				connections={CONNECTIONS}
				runnable={false}
			/>
		</div>
	);
}
