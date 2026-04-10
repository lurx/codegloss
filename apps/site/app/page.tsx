import Link from 'next/link';
import { HeroDemo } from '@/components/hero-demo.component';
import { CopyButton } from '@/components/copy-button.component';

const INSTALL_CMD = 'npm install codegloss';

const CONFIG_SNIPPET = `import createMdx from '@next/mdx';
import remarkCodegloss from 'codegloss/remark';

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
  { icon: '◎', title: 'Interactive Annotations', description: 'Click any highlighted token to reveal an explanation. Annotations are defined in JSON alongside your code.' },
  { icon: '⌁', title: 'Connection Arcs', description: 'Draw visual relationships between annotations. Arcs in the gutter connect related concepts with a click-to-explain popover.' },
  { icon: '❐', title: 'MDX Native', description: 'Write fenced code blocks with a sandbox tag and a JSON annotations block. The remark plugin handles the rest.' },
];

export default function HomePage() {
  return (
    <main className="page-container">
      {/* Hero */}
      <section className="hero-stacked">
        <div className="hero-text fade-in">
          <h1>
            Annotated code,{' '}
            <em>explained.</em>
          </h1>
          <p className="hero-desc">
            Interactive token-level annotations for Markdown. Highlight code, add
            tooltips, draw connection arcs between related concepts. Drop a
            remark plugin into your pipeline — done.
          </p>
          <div className="hero-install">
            <span className="hero-install-dollar">$</span>
            <code>{INSTALL_CMD}</code>
            <CopyButton text={INSTALL_CMD} />
          </div>
        </div>
        <div className="fade-in fade-in-delay-1">
          <HeroDemo />
        </div>
      </section>

      {/* Features */}
      <section className="features fade-in fade-in-delay-2">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.description}</p>
          </div>
        ))}
      </section>

      {/* Quick Start */}
      <section className="quickstart fade-in fade-in-delay-3">
        <h2>Quick start</h2>
        {[
          { num: '1', label: 'Install', code: INSTALL_CMD },
          { num: '2', label: 'Configure your MDX pipeline', code: CONFIG_SNIPPET },
          { num: '3', label: 'Write annotated code in MDX', code: MDX_SNIPPET },
        ].map(step => (
          <div key={step.num} className="step">
            <span className="step-num">{step.num}</span>
            <div className="step-content">
              <div className="step-label">{step.label}</div>
              <pre>{step.code}</pre>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="cta">
        <Link href="/docs/getting-started" className="cta-button">
          Read the docs →
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span>codegloss</span>
        <div className="footer-links">
          <a href="https://github.com/lurx/codegloss" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.npmjs.com/package/codegloss" target="_blank" rel="noopener noreferrer">npm</a>
          <span>MIT License</span>
        </div>
      </footer>
    </main>
  );
}
