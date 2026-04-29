import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildCodeGlossHtmlNode } from '../transform-html.helpers';
import type { DetectedPair } from '../remark.types';

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
	const match =
		/^<code-gloss><script type="application\/json">(.*)<\/script><\/code-gloss>$/.exec(
			html,
		);
	if (!match) throw new Error(`unexpected html: ${html}`);
	return JSON.parse(match[1].replaceAll(/<\\\/script/gi, '</script'));
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

	it('emits a theme attribute when a theme is set on the pair', () => {
		const node = buildCodeGlossHtmlNode(pair({ theme: 'github-dark' }));
		expect(node.value.startsWith('<code-gloss theme="github-dark">')).toBe(
			true,
		);
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

	it('forwards an arcs object from the annotations JSON into the config payload', () => {
		const node = buildCodeGlossHtmlNode(
			pair({
				annotationsJson: '{"annotations":[],"arcs":{"arrowhead":true}}',
			}),
		);

		expect(extractConfig(node.value).arcs).toEqual({ arrowhead: true });
	});

	it('forwards a callouts object from the annotations JSON into the config payload', () => {
		const node = buildCodeGlossHtmlNode(
			pair({
				annotationsJson: '{"annotations":[],"callouts":{"popover":true}}',
			}),
		);

		expect(extractConfig(node.value).callouts).toEqual({ popover: true });
	});

	it('ignores a callouts field that is not an object', () => {
		const node = buildCodeGlossHtmlNode(
			pair({
				annotationsJson: '{"annotations":[],"callouts":"nope"}',
			}),
		);

		expect(extractConfig(node.value).callouts).toBeUndefined();
	});

	it('ignores an arcs field that is not an object', () => {
		const node = buildCodeGlossHtmlNode(
			pair({
				annotationsJson: '{"annotations":[],"arcs":"nope"}',
			}),
		);

		expect(extractConfig(node.value).arcs).toBeUndefined();
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
		expect(node.value).toContain(String.raw`<\/script`);
		// The closing wrapper tag must still be present at the end:
		expect(node.value.endsWith('</script></code-gloss>')).toBe(true);

		const config = extractConfig(node.value);
		expect(config.code).toBe('</script><script>alert(1)</script>');
	});

	describe('defaults injected from the plugin', () => {
		it('forwards pair-level arcs defaults when no per-block arcs exist', () => {
			const node = buildCodeGlossHtmlNode(
				pair({ arcs: { opacity: 0.65, arrowhead: true } }),
			);
			expect(extractConfig(node.value).arcs).toEqual({
				opacity: 0.65,
				arrowhead: true,
			});
		});

		it('shallow-merges defaults with per-block arcs — per-block wins', () => {
			const node = buildCodeGlossHtmlNode(
				pair({
					arcs: { opacity: 0.65, arrowhead: true, strokeDasharray: '1 1' },
					annotationsJson: '{"arcs":{"opacity":0.3,"strokeWidth":2}}',
				}),
			);
			expect(extractConfig(node.value).arcs).toEqual({
				opacity: 0.3,
				arrowhead: true,
				strokeDasharray: '1 1',
				strokeWidth: 2,
			});
		});

		it('drops a non-object per-block arcs override but keeps defaults', () => {
			const node = buildCodeGlossHtmlNode(
				pair({
					arcs: { opacity: 0.4 },
					annotationsJson: '{"arcs":42}',
				}),
			);
			expect(extractConfig(node.value).arcs).toEqual({ opacity: 0.4 });
		});

		it('forwards pair-level callouts defaults when no per-block callouts exist', () => {
			const node = buildCodeGlossHtmlNode(
				pair({ callouts: { popover: true } }),
			);
			expect(extractConfig(node.value).callouts).toEqual({ popover: true });
		});
	});

	describe('invalid JSON', () => {
		let warnSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
				// Noop
			});
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
