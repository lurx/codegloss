import type { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/logo.component';
import { ThemeToggle } from '@/components/theme-toggle.component';
import { Search } from '@/components/search.component';
import { COLOR_SCHEME_STORAGE_KEY } from '@/components/theme-toggle.constants';
import type { RootLayoutProps } from './layout.types';

import './globals.css';

const COLOR_SCHEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem('${COLOR_SCHEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;else if(window.matchMedia('(prefers-color-scheme:light)').matches)document.documentElement.dataset.theme='light';}catch(e){}})();`;

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
            __html: COLOR_SCHEME_BOOT_SCRIPT,
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
              <Link href="/editor" className="nav-link">
                Editor
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
        {children}
      </body>
    </html>
  );
}
