'use client';

import { useState, useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';
import { CodeGloss } from 'codegloss/react';

import type { CodeGlossProps } from 'codegloss/react';

function CodeGlossWithTabs(props: CodeGlossProps) {
  const [tab, setTab] = useState<'sandbox' | 'source'>('sandbox');
  const { code, lang, filename, annotations, connections } = props;

  const fence = `\`\`\`${lang} sandbox${filename ? ` ${filename}` : ''}\n${code}\n\`\`\``;
  const hasAnnotations = annotations && annotations.length > 0;
  const jsonPayload = hasAnnotations
    ? JSON.stringify(
        {
          annotations,
          ...(connections && connections.length > 0 ? { connections } : {}),
        },
        null,
        2,
      )
    : null;
  const source = jsonPayload
    ? `${fence}\n\n\`\`\`json annotations\n${jsonPayload}\n\`\`\``
    : fence;

  return (
    <div>
      <div className="tabs">
        <button type="button" className="tab-btn" data-active={tab === 'sandbox'} onClick={() => setTab('sandbox')}>
          Sandbox
        </button>
        <button type="button" className="tab-btn" data-active={tab === 'source'} onClick={() => setTab('source')}>
          Source (MD+JSON)
        </button>
      </div>
      {tab === 'sandbox' ? (
        <CodeGloss {...props} />
      ) : (
        <pre style={{ background: 'var(--site-surface)', border: '1px solid var(--site-border)', borderRadius: '0 8px 8px 8px', padding: '1rem', overflowX: 'auto', fontSize: '0.8125rem', lineHeight: 1.6, color: '#d1d5db' }}>
          <code>{source}</code>
        </pre>
      )}
    </div>
  );
}

const MDX_COMPONENTS = {
  CodeGloss: CodeGlossWithTabs,
};

type MdxContentProps = {
  code: string;
};

function useMDXComponent(code: string) {
  return useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default;
  }, [code]);
}

export function MdxContent({ code }: MdxContentProps) {
  const Component = useMDXComponent(code);

  return (
    <div className="prose">
      <Component components={MDX_COMPONENTS} />
    </div>
  );
}
