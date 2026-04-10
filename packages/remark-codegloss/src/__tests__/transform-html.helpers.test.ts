import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildCodeGlossHtmlNode } from '../transform-html.helpers';

import type { DetectedPair } from '../detect.helpers';

const pair = (overrides: Partial<DetectedPair> = {}): DetectedPair => ({
  lang: 'js',
  filename: undefined,
  code: 'console.log(1)',
  annotationsJson: undefined,
  codeIndex: 0,
  nodeCount: 1,
  ...overrides,
});

const extractConfig = (html: string): Record<string, unknown> => {
  const match = html.match(
    /^<code-gloss><script type="application\/json">(.*)<\/script><\/code-gloss>$/,
  );
  if (!match) throw new Error(`unexpected html: ${html}`);
  return JSON.parse(match[1].replace(/<\\\/script/gi, '</script'));
};

describe('buildCodeGlossHtmlNode', () => {
  it('emits a code-gloss node with code + lang in the script payload', () => {
    const node = buildCodeGlossHtmlNode(pair());
    expect(node.type).toBe('html');

    const config = extractConfig(node.value);
    expect(config).toEqual({ code: 'console.log(1)', lang: 'js' });
  });

  it('includes a filename when provided', () => {
    const node = buildCodeGlossHtmlNode(pair({ filename: 'fib.js' }));
    expect(extractConfig(node.value).filename).toBe('fib.js');
  });

  it('includes annotations and connections from the JSON blob', () => {
    const node = buildCodeGlossHtmlNode(
      pair({
        annotationsJson:
          '{"annotations":[{"id":"a"}],"connections":[{"from":"a","to":"b","color":"#000"}]}',
      }),
    );

    const config = extractConfig(node.value);
    expect(config.annotations).toEqual([{ id: 'a' }]);
    expect(config.connections).toEqual([{ from: 'a', to: 'b', color: '#000' }]);
  });

  it('omits annotation fields when their JSON values are not arrays', () => {
    const node = buildCodeGlossHtmlNode(
      pair({ annotationsJson: '{"annotations":"oops","connections":42}' }),
    );

    const config = extractConfig(node.value);
    expect(config.annotations).toBeUndefined();
    expect(config.connections).toBeUndefined();
  });

  it('escapes </script sequences inside the JSON payload', () => {
    const node = buildCodeGlossHtmlNode(
      pair({ code: '</script><script>alert(1)</script>' }),
    );

    expect(node.value).not.toMatch(/<\/script><script>alert/);
    expect(node.value).toContain('<\\/script');
    // The closing wrapper tag must still be present at the end:
    expect(node.value.endsWith('</script></code-gloss>')).toBe(true);

    const config = extractConfig(node.value);
    expect(config.code).toBe('</script><script>alert(1)</script>');
  });

  describe('invalid JSON', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('warns and emits the node without annotation fields', () => {
      const node = buildCodeGlossHtmlNode(
        pair({ annotationsJson: '{not json' }),
      );

      const config = extractConfig(node.value);
      expect(config.annotations).toBeUndefined();
      expect(config.connections).toBeUndefined();
      expect(config.code).toBe('console.log(1)');
      expect(warnSpy).toHaveBeenCalledOnce();
    });
  });
});
