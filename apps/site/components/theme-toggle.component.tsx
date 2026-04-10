'use client';

import { useEffect, useState } from 'react';

type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'codegloss-color-scheme';

const ICON_SUN =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

const ICON_MOON =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function getInitialScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'dark';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

export function ThemeToggle() {
  const [scheme, setScheme] = useState<ColorScheme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setScheme(getInitialScheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = scheme;
    localStorage.setItem(STORAGE_KEY, scheme);
  }, [scheme]);

  const toggle = () => {
    setScheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!mounted) return <div style={{ width: 27, height: 27 }} />;

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
      dangerouslySetInnerHTML={{
        __html: scheme === 'dark' ? ICON_SUN : ICON_MOON,
      }}
    />
  );
}
