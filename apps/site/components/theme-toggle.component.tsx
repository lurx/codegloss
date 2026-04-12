'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'codegloss-color-scheme';

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
    >
      {scheme === 'dark'
        ? <Sun size={15} />
        : <Moon size={15} />}
    </button>
  );
}
