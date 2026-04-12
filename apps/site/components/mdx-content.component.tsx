'use client';

import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import * as runtime from 'react/jsx-runtime';
import { CodeGloss } from 'codegloss/react';
import type { CodeGlossProps } from 'codegloss/react';
import { ThemeShowcase } from './theme-showcase.component';
import { MdxTabs } from './mdx-tabs.component';
import { UsageTabs } from './usage-tabs.component';
import { CodeBlock } from './code-block.component';
import { DocLink } from './doc-link.component';
import { useSiteTheme } from '@/hooks';
import type {
  CodeGlossTab,
  CompiledMdxFactory,
  MdxContentProps,
} from './mdx-content.types';
import { SOURCE_PRE_STYLE } from './mdx-content.constants';
import {
  buildSourceFence,
  resolveCodeglossTheme,
} from './mdx-content.helpers';

const MDX_COMPONENTS = {
  CodeGloss: CodeGlossWithTabs,
  ThemeShowcase,
  MdxTabs,
  UsageTabs,
  pre: CodeBlock,
  a: DocLink,
};

function CodeGlossWithTabs(props: CodeGlossProps) {
  const [tab, setTab] = useState<CodeGlossTab>('sandbox');
  const siteTheme = useSiteTheme();

  const source = useMemo(() => buildSourceFence(props), [props]);
  const theme = useMemo(() => resolveCodeglossTheme(siteTheme), [siteTheme]);

  const handleSelectTab = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setTab(event.currentTarget.dataset.tab as CodeGlossTab);
    },
    [],
  );

  const renderContent = () => {
    if (tab === 'sandbox') {
      return <CodeGloss {...props} theme={theme} />;
    }
    return (
      <pre style={SOURCE_PRE_STYLE}>
        <code>{source}</code>
      </pre>
    );
  };

  return (
    <div>
      <div className="tabs">
        <button
          type="button"
          className="tab-btn"
          data-tab="sandbox"
          data-active={tab === 'sandbox'}
          onClick={handleSelectTab}
        >
          Sandbox
        </button>
        <button
          type="button"
          className="tab-btn"
          data-tab="source"
          data-active={tab === 'source'}
          onClick={handleSelectTab}
        >
          Source (MD+JSON)
        </button>
      </div>
      {renderContent()}
    </div>
  );
}

function useMDXComponent(code: string) {
  return useMemo(() => {
    const factory = new Function(code) as CompiledMdxFactory;
    return factory({ ...runtime }).default;
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
