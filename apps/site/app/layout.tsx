import type { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/logo.component';
import { ThemeToggle } from '@/components/theme-toggle.component';
import { Search } from '@/components/search.component';
import type { RootLayoutProps } from './layout.types';

import './globals.css';

export const metadata: Metadata = {
  title: 'codegloss — annotated code, explained',
  description:
    'Interactive code annotations for MDX. Highlight tokens, add tooltips, draw connection arcs.',
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
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="nav-logo">
              <Logo size={32} />
              codegloss
            </Link>
            <div className="nav-links">
              <Search />
              <Link href="/docs/getting-started" className="nav-link">
                Docs
              </Link>
              <a
                href="https://github.com/lurx/codegloss"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
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
