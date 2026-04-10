import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/logo.component';
import { ThemeToggle } from '@/components/theme-toggle.component';

import './globals.css';

export const metadata: Metadata = {
  title: 'codegloss — annotated code, explained',
  description:
    'Interactive code annotations for MDX. Highlight tokens, add tooltips, draw connection arcs.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('codegloss-color-scheme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;else if(window.matchMedia('(prefers-color-scheme:light)').matches)document.documentElement.dataset.theme='light';}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            height: '3.5rem',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--site-border)',
            background: 'var(--site-nav-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              margin: '0 auto',
              width: '100%',
              maxWidth: '72rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link
              href="/"
              style={{
                color: 'var(--site-heading)',
                fontSize: '1.125rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Logo size={26} />
              codegloss
            </Link>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <Link href="/docs/getting-started" style={{ color: 'var(--site-muted)' }}>
                Docs
              </Link>
              <a
                href="https://github.com/anthropics/codegloss"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--site-muted)' }}
              >
                GitHub
              </a>
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <div style={{ paddingTop: '3.5rem' }}>{children}</div>
      </body>
    </html>
  );
}
