'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import type { ColorScheme } from './theme-toggle.types';
import {
  COLOR_SCHEME_STORAGE_KEY,
  THEME_ICON_SIZE,
  THEME_TOGGLE_PLACEHOLDER_SIZE,
} from './theme-toggle.constants';
import { getInitialScheme } from './theme-toggle.helpers';

export function ThemeToggle() {
  const [scheme, setScheme] = useState<ColorScheme>('dark');
  const [mounted, setMounted] = useState(false);

  const toggle = useCallback(() => {
    setScheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    setScheme(getInitialScheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = scheme;
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  }, [scheme]);

  const renderIcon = () => {
    if (scheme === 'dark') return <Sun size={THEME_ICON_SIZE} />;
    return <Moon size={THEME_ICON_SIZE} />;
  };

  const nextSchemeLabel = scheme === 'dark' ? 'light' : 'dark';

  if (!mounted) {
    return (
      <div
        style={{
          width: THEME_TOGGLE_PLACEHOLDER_SIZE,
          height: THEME_TOGGLE_PLACEHOLDER_SIZE,
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={`Switch to ${nextSchemeLabel} mode`}
      title={`Switch to ${nextSchemeLabel} mode`}
    >
      {renderIcon()}
    </button>
  );
}
