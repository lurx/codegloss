import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CodeGloss } from '../code-gloss.component';

import type { CodeGlossProps } from '../code-gloss.component';

const SCRIPT_RE =
  /<code-gloss><script type="application\/json">(.*?)<\/script><\/code-gloss>/s;

function extractConfig(html: string): unknown {
  const match = html.match(SCRIPT_RE);
  if (!match) throw new Error(`unexpected markup: ${html}`);
  // The script body is whatever React put inside dangerouslySetInnerHTML — i.e.
  // raw JSON, no HTML-entity escaping.
  return JSON.parse(match[1]);
}

describe('CodeGloss (React wrapper)', () => {
  it('renders a <code-gloss> element with a JSON script child', () => {
    const html = renderToStaticMarkup(
      <CodeGloss code="let x = 1" lang="js" />,
    );
    expect(html).toMatch(SCRIPT_RE);
  });

  it('serializes minimal props into the script payload', () => {
    const html = renderToStaticMarkup(
      <CodeGloss code="let x = 1" lang="js" />,
    );
    expect(extractConfig(html)).toEqual({ code: 'let x = 1', lang: 'js' });
  });

  it('serializes every prop into the script payload', () => {
    const props: CodeGlossProps = {
      code: 'console.log(1)',
      lang: 'js',
      filename: 'app.js',
      runnable: true,
      annotations: [
        {
          id: 'a1',
          token: 'console',
          line: 0,
          occurrence: 0,
          title: 'Console',
          text: 'Logs to stdout',
        },
      ],
      connections: [
        { from: 'a1', to: 'a1', color: '#0af', title: 'Self', text: 'loop' },
      ],
    };

    const html = renderToStaticMarkup(<CodeGloss {...props} />);
    expect(extractConfig(html)).toEqual(props);
  });

  it('emits the JSON payload raw (not HTML-entity-escaped)', () => {
    // dangerouslySetInnerHTML means JSON characters like " and { stay as-is
    // and aren't replaced with &quot; / &#123; — that's the whole point.
    const html = renderToStaticMarkup(
      <CodeGloss code="let x = 1" lang="js" filename="a.js" />,
    );
    expect(html).toContain('"code":"let x = 1"');
    expect(html).not.toContain('&quot;');
  });

  it('is a plain function component, not a class', () => {
    expect(typeof CodeGloss).toBe('function');
    expect(CodeGloss.prototype?.isReactComponent).toBeUndefined();
  });

  it('uses no React hooks (zero React API surface beyond JSX)', () => {
    // Smoke check: the wrapper exists purely to JSON-stringify props and emit
    // a custom element. If a hook ever sneaks in, this catches it.
    const src = CodeGloss.toString();
    expect(src).not.toMatch(/\buse[A-Z]\w*\s*\(/);
  });
});
