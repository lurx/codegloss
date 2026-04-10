import Link from 'next/link';
import { HeroDemo } from '@/components/hero-demo.component';
import { CopyButton } from '@/components/copy-button.component';

const INSTALL_CMD = 'npm install codegloss remark-codegloss';

const CONFIG_SNIPPET = `import createMdx from '@next/mdx';
import remarkCodegloss from 'remark-codegloss';

const withMdx = createMdx({
  options: {
    remarkPlugins: [remarkCodegloss],
  },
});`;

const MDX_SNIPPET = `\`\`\`js sandbox fibonacci.js
function fibonacci(n) {
  const memo = {};
  // ...
}
\`\`\`

\`\`\`json annotations
{
  "annotations": [{
    "id": "a1",
    "token": "memo",
    "line": 1,
    "occurrence": 0,
    "title": "Cache",
    "text": "Stores computed values."
  }]
}
\`\`\``;

const FEATURES = [
  { title: 'Interactive Annotations', description: 'Click any highlighted token to reveal an explanation. Annotations are defined in JSON alongside your code.' },
  { title: 'Connection Arcs', description: 'Draw visual relationships between annotations. Dashed arcs in the gutter connect related concepts.' },
  { title: 'MDX Native', description: 'Write fenced code blocks with a sandbox tag and a JSON annotations block. The remark plugin handles the rest.' },
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: '60rem', margin: '0 auto', padding: '0 1.5rem' }}>
      {/* Hero */}
      <section style={{ padding: '5rem 0 3rem' }}>
        <div style={{ maxWidth: '36rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Annotated code, <em style={{ color: 'var(--accent-light)' }}>explained.</em>
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--site-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Interactive token-level annotations for MDX. Highlight code, add tooltips, draw connection arcs between related concepts. Drop a remark plugin into your pipeline — done.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--site-surface)', border: '1px solid var(--site-border)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--site-muted)', userSelect: 'none' }}>$</span>
            <code>{INSTALL_CMD}</code>
            <CopyButton text={INSTALL_CMD} />
          </div>
        </div>
        <div style={{ maxWidth: '680px' }}>
          <HeroDemo />
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '2rem 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ border: '1px solid var(--site-border)', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{f.title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--site-muted)', lineHeight: 1.5, margin: 0 }}>{f.description}</p>
          </div>
        ))}
      </section>

      {/* Quick Start */}
      <section style={{ padding: '2rem 0' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Quick start</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '36rem' }}>
          {[
            { num: '1', label: 'Install', code: 'npm install codegloss remark-codegloss' },
            { num: '2', label: 'Configure your MDX pipeline', code: CONFIG_SNIPPET },
            { num: '3', label: 'Write annotated code in MDX', code: MDX_SNIPPET },
          ].map((step) => (
            <div key={step.num}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'rgba(83,74,183,0.15)', color: 'var(--accent-light)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step.num}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fff' }}>{step.label}</span>
              </div>
              <pre style={{ background: 'var(--site-surface)', border: '1px solid var(--site-border)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8125rem', lineHeight: 1.6, color: '#d1d5db', overflowX: 'auto', margin: 0 }}>
                {step.code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '3rem 0 4rem', textAlign: 'center' }}>
        <Link href="/docs/getting-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', borderRadius: '8px', background: 'var(--accent)', color: '#fff', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>
          Read the docs →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--site-border)', padding: '2rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--site-muted)' }}>
        <span>codegloss</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="https://github.com/anthropics/codegloss" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--site-muted)' }}>GitHub</a>
          <a href="https://www.npmjs.com/package/codegloss" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--site-muted)' }}>npm</a>
          <span>MIT License</span>
        </div>
      </footer>
    </main>
  );
}
