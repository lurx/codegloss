'use client';

import { useState, useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';
import { CodeGloss } from 'codegloss/react';
import { ThemeShowcase } from './theme-showcase.component';
import { MdxTabs } from './mdx-tabs.component';
import { UsageTabs } from './usage-tabs.component';
import { CodeBlock } from './code-block.component';
import { useSiteTheme } from '@/hooks/use-site-theme.hook';
import codeglossConfig from '@/codegloss.config';

import type { CodeGlossProps } from 'codegloss/react';
import type { MdxContentProps } from './mdx-content.types';

function CodeGlossWithTabs(props: CodeGlossProps) {
  const [tab, setTab] = useState<'sandbox' | 'source'>('sandbox');
  const siteTheme = useSiteTheme();
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
        <CodeGloss
          {...props}
          theme={
            siteTheme === 'dark'
              ? String(codeglossConfig.darkTheme ?? codeglossConfig.theme ?? '')
              : String(codeglossConfig.theme ?? '')
          }
        />
      ) : (
        <pre style={{ background: 'var(--site-surface)', border: '1px solid var(--site-border)', borderRadius: '0 8px 8px 8px', padding: '1rem', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.7, color: 'var(--site-pre-fg)' }}>
          <code>{source}</code>
        </pre>
      )}
    </div>
  );
}

const MDX_COMPONENTS = {
  CodeGloss: CodeGlossWithTabs,
  ThemeShowcase,
  MdxTabs,
  UsageTabs,
  pre: CodeBlock,
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
