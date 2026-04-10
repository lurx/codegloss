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
    color: '#6c5ce7',
    title: 'Write → Read',
    text: 'The map is populated on line 7 and checked on line 5. Duplicate IDs hit the cache on the second pass.',
  },
];

export function ThemeShowcase() {
  const [activeTheme, setActiveTheme] =
    useState<(typeof THEME_NAMES)[number]>('github-dark');

  return (
    <div>
      <div className="theme-pills">
        {THEME_NAMES.map(name => (
          <button
            key={name}
            type="button"
            onClick={() => setActiveTheme(name)}
            className={`theme-pill${name === activeTheme ? ' theme-pill-active' : ''}`}
          >
            {name}
          </button>
        ))}
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
