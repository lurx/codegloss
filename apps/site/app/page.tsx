import Link from 'next/link';
import { HeroDemo } from '@/components/hero-demo.component';
import { CopyButton } from '@/components/copy-button.component';
import { QuickStart } from '@/components/quick-start.component';

const INSTALL_CMD = 'npm install codegloss';

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
            Turn code blocks into{' '}
            <em>interactive explanations.</em>
          </h1>
          <p className="hero-desc">
            CodeGloss adds clickable, token-level annotations and connection
            arcs to fenced code blocks. One remark plugin, one Web Component,
            every framework — React, Vue, Svelte, Astro, or plain HTML.
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

      {/* Why CodeGloss */}
      <section className="why-section fade-in fade-in-delay-3">
        <h2>Why CodeGloss?</h2>
        <div className="why-grid">
          <div className="why-item">
            <strong>Comments explain <em>what</em>. Annotations explain <em>why</em>.</strong>
            <p>
              Code comments are static and invisible to readers skimming a tutorial.
              CodeGloss annotations are interactive — readers click what they
              don&apos;t understand and skip what they already know.
            </p>
          </div>
          <div className="why-item">
            <strong>One package, every framework.</strong>
            <p>
              A single Web Component under the hood, with thin wrappers for React,
              Vue, and Svelte. Works with any markdown pipeline via a remark plugin,
              or drop the custom element into plain HTML.
            </p>
          </div>
          <div className="why-item">
            <strong>Annotations live next to your code, not inside it.</strong>
            <p>
              Define annotations in a JSON block alongside the fenced code. Your
              source stays clean, and annotations can be updated without touching
              the code itself.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <QuickStart />

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
