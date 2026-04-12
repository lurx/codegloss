import type { CodeGlossProps } from 'codegloss/react';
import type { SiteTheme } from '@/hooks';
import codeglossConfig from '@/codegloss.config';

export function buildSourceFence(props: CodeGlossProps): string {
  const { code, lang, filename, annotations, connections } = props;
  const header = filename ? `${lang} sandbox ${filename}` : `${lang} sandbox`;
  const fence = `\`\`\`${header}\n${code}\n\`\`\``;

  const hasAnnotations = annotations && annotations.length > 0;
  if (!hasAnnotations) return fence;

  const hasConnections = connections && connections.length > 0;
  const payload = hasConnections
    ? { annotations, connections }
    : { annotations };
  const json = JSON.stringify(payload, null, 2);

  return `${fence}\n\n\`\`\`json annotations\n${json}\n\`\`\``;
}

export function resolveCodeglossTheme(siteTheme: SiteTheme): string {
  const dark = codeglossConfig.darkTheme ?? codeglossConfig.theme ?? '';
  const light = codeglossConfig.theme ?? '';
  return String(siteTheme === 'dark' ? dark : light);
}
