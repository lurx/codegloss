'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DocsLayoutProps, SidebarSection } from './docs-layout.types';

const SIDEBAR = [
  { title: 'Overview', items: [
    { label: 'Getting Started', slug: 'getting-started' },
    { label: 'Remark Plugin', slug: 'plugin' },
    { label: 'Component API', slug: 'api' },
    { label: 'Styles & Theming', slug: 'theming' },
    { label: 'Syntax Highlighters', slug: 'highlighters' },
    { label: 'Examples', slug: 'examples' },
  ]},
  { title: 'Integrations', items: [
    { label: 'React', slug: 'setup/react' },
    { label: 'Next.js', slug: 'setup/nextjs' },
    { label: 'Docusaurus', slug: 'setup/docusaurus' },
    { label: 'Velite', slug: 'setup/velite' },
    { label: 'Vue / Nuxt', slug: 'setup/vue' },
    { label: 'VitePress', slug: 'setup/vitepress' },
    { label: 'Svelte / SvelteKit', slug: 'setup/svelte' },
    { label: 'Astro / Starlight', slug: 'setup/astro' },
  ]},
] as const satisfies readonly SidebarSection[];

export function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="docs-container">
      <aside className="docs-sidebar">
        <nav>
          {SIDEBAR.map(section => (
            <div key={section.title} className="docs-section">
              <p className="docs-section-title">{section.title}</p>
              {section.items.map(item => {
                const href = `/docs/${item.slug}`;
                const active = pathname === href;

                return (
                  <Link
                    key={item.slug}
                    href={href}
                    className={`docs-link${active ? ' docs-link-active' : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main className="docs-main">
        {children}
      </main>
    </div>
  );
}
