import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CodeGloss } from '../code-gloss.component';
import type { CodeGlossProps } from '../code-gloss.types';

const SCRIPT_RE =
	/<code-gloss><script type="application\/json">(.*?)<\/script><\/code-gloss>/s;

function extractConfig(html: string): unknown {
	const match = SCRIPT_RE.exec(html);
	if (!match) throw new Error(`unexpected markup: ${html}`);
	// The script body is whatever React put inside dangerouslySetInnerHTML — i.e.
	// raw JSON, no HTML-entity escaping.
	return JSON.parse(match[1]);
}

describe('CodeGloss (React wrapper)', () => {
	it('renders a <code-gloss> element with a JSON script child', () => {
		const html = renderToStaticMarkup(
			<CodeGloss
				code="let x = 1"
				lang="js"
			/>,
		);
		expect(html).toMatch(SCRIPT_RE);
	});

	it('serializes minimal props into the script payload', () => {
		const html = renderToStaticMarkup(
			<CodeGloss
				code="let x = 1"
				lang="js"
			/>,
		);
		expect(extractConfig(html)).toEqual({ code: 'let x = 1', lang: 'js' });
	});

	it('serializes every prop into the script payload', () => {
		const props: CodeGlossProps = {
			code: 'console.log(1)',
			lang: 'js',
			filename: 'app.js',
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

	it('invokes a highlight function returning a string and bakes the HTML into the payload', () => {
		const html = renderToStaticMarkup(
			<CodeGloss
				code="x"
				lang="js"
				highlight={(code) => `<span>${code}</span>`}
			/>,
		);
		const payload = extractConfig(html) as Record<string, unknown>;
		expect(payload.highlightedHtml).toBe('<span>x</span>');
		expect(payload).not.toHaveProperty('highlightBackground');
		expect(payload).not.toHaveProperty('highlightColor');
	});

	it('forwards background + color from a structured highlight return', () => {
		const html = renderToStaticMarkup(
			<CodeGloss
				code="x"
				lang="js"
				highlight={() => ({
					html: '<span>x</span>',
					background: '#111',
					color: '#eee',
				})}
			/>,
		);
		const payload = extractConfig(html) as Record<string, unknown>;
		expect(payload.highlightedHtml).toBe('<span>x</span>');
		expect(payload.highlightBackground).toBe('#111');
		expect(payload.highlightColor).toBe('#eee');
	});

	it('omits chrome attributes when the structured return only carries html', () => {
		const html = renderToStaticMarkup(
			<CodeGloss
				code="x"
				lang="js"
				highlight={() => ({ html: '<span>x</span>' })}
			/>,
		);
		const payload = extractConfig(html) as Record<string, unknown>;
		expect(payload.highlightedHtml).toBe('<span>x</span>');
		expect(payload).not.toHaveProperty('highlightBackground');
		expect(payload).not.toHaveProperty('highlightColor');
	});

	it('skips the highlight call when the config already carries highlightedHtml', () => {
		const highlight = vi.fn(() => '<span>nope</span>');
		const html = renderToStaticMarkup(
			<CodeGloss
				code="x"
				lang="js"
				highlightedHtml="<span>baked</span>"
				highlight={highlight}
			/>,
		);
		const payload = extractConfig(html) as Record<string, unknown>;
		expect(highlight).not.toHaveBeenCalled();
		expect(payload.highlightedHtml).toBe('<span>baked</span>');
	});

	it('renders the theme attribute on the custom element when provided', () => {
		const html = renderToStaticMarkup(
			<CodeGloss code="let x = 1" lang="js" theme="github-dark" />,
		);
		expect(html).toContain('<code-gloss theme="github-dark">');
		// And it should not end up in the JSON config child:
		const payload = /<script[^>]*>(.*?)<\/script>/s.exec(html)?.[1] ?? '';
		expect(JSON.parse(payload)).not.toHaveProperty('theme');
	});

	it('emits the JSON payload raw (not HTML-entity-escaped)', () => {
		// DangerouslySetInnerHTML means JSON characters like " and { stay as-is
		// and aren't replaced with &quot; / &#123; — that's the whole point.
		const html = renderToStaticMarkup(
			<CodeGloss
				code="let x = 1"
				lang="js"
				filename="a.js"
			/>,
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

	it('renders styleOverrides as inline --cg-* CSS on the host element', () => {
		const html = renderToStaticMarkup(
			<CodeGloss
				code="let x = 1"
				lang="js"
				styleOverrides={{
					codeBlock: { background: 'var(--surface)', borderRadius: '4px' },
					badge: { foreground: '#999' },
				}}
			/>,
		);
		expect(html).toContain('--cg-bg:var(--surface)');
		expect(html).toContain('--cg-radius:4px');
		expect(html).toContain('--cg-badge-text:#999');
		// And styleOverrides itself must not leak into the JSON payload.
		const payload = /<script[^>]*>(.*?)<\/script>/s.exec(html)?.[1] ?? '';
		expect(JSON.parse(payload)).not.toHaveProperty('styleOverrides');
	});

	it('omits the style attribute when styleOverrides is empty or unset', () => {
		const bareHtml = renderToStaticMarkup(
			<CodeGloss code="let x = 1" lang="js" />,
		);
		expect(bareHtml).not.toContain('style=');

		const emptyHtml = renderToStaticMarkup(
			<CodeGloss code="let x = 1" lang="js" styleOverrides={{ codeBlock: {} }} />,
		);
		expect(emptyHtml).not.toContain('style=');
	});
});
