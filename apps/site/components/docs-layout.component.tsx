'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SIDEBAR = [
  { title: 'Overview', items: [
    { label: 'Getting Started', slug: 'getting-started' },
    { label: 'Remark Plugin', slug: 'plugin' },
    { label: 'Component API', slug: 'api' },
    { label: 'Examples', slug: 'examples' },
  ]},
  { title: 'Integrations', items: [
    { label: 'Next.js', slug: 'setup/nextjs' },
    { label: 'Docusaurus', slug: 'setup/docusaurus' },
    { label: 'Velite', slug: 'setup/velite' },
  ]},
] as const;

type DocsLayoutProps = {
  children: React.ReactNode;
};

export function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.5rem', gap: '4rem' }}>
      <aside style={{ width: '13rem', flexShrink: 0 }}>
        <nav style={{ position: 'sticky', top: '5rem' }}>
          {SIDEBAR.map((section) => (
            <div key={section.title} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--site-muted)', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
                {section.title}
              </p>
              {section.items.map((item) => {
                const href = `/docs/${item.slug}`;
                const active = pathname === href;

                return (
                  <Link
                    key={item.slug}
                    href={href}
                    style={{
                      display: 'block',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      color: active ? '#fff' : 'var(--site-muted)',
                      background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                      textDecoration: 'none',
                      marginBottom: '2px',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, minWidth: 0, maxWidth: '48rem' }}>
        {children}
      </main>
    </div>
  );
}
