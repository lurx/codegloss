'use client';

import { CodeGloss } from '@codegloss/react';
import { useCallback, useState, type MouseEvent } from 'react';
import {
  ANNOTATIONS,
  CODE,
  CONNECTIONS,
  THEME_NAMES,
} from './theme-showcase.data';
import type { ThemeName } from './theme-showcase.types';

export function ThemeShowcase() {
  const [activeTheme, setActiveTheme] = useState<ThemeName>('github-dark');

  const handleSelect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const name = event.currentTarget.dataset.theme as ThemeName;
      setActiveTheme(name);
    },
    [],
  );

  return (
    <div>
      <div className="theme-pills">
        {THEME_NAMES.map(name => (
          <button
            key={name}
            type="button"
            data-theme={name}
            onClick={handleSelect}
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
