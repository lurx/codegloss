import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { CodeGloss } from '../code-gloss.component';
import type { CodeGlossProps } from '../code-gloss.types';

const SCRIPT_RE =
	/<code-gloss><script type="application\/json">(.*?)<\/script><\/code-gloss>/s;

async function render(props: CodeGlossProps): Promise<string> {
	const app = createSSRApp({ render: () => h(CodeGloss, props) });
	return renderToString(app);
}

function extractConfig(html: string): unknown {
	const match = SCRIPT_RE.exec(html);
	if (!match) throw new Error(`unexpected markup: ${html}`);
	return JSON.parse(match[1]);
}

describe('CodeGloss (Vue wrapper)', () => {
	it('renders a <code-gloss> with a JSON script child', async () => {
		const html = await render({ code: 'let x = 1', lang: 'js' });
		expect(html).toMatch(SCRIPT_RE);
	});

	it('serializes minimal props into the script payload', async () => {
		const html = await render({ code: 'let x = 1', lang: 'js' });
		expect(extractConfig(html)).toEqual({ code: 'let x = 1', lang: 'js' });
	});

	it('serializes every prop into the script payload', async () => {
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
		const html = await render(props);
		expect(extractConfig(html)).toEqual(props);
	});

	it('invokes a highlight function returning a string and bakes the HTML into the payload', async () => {
		const html = await render({
			code: 'x',
			lang: 'js',
			highlight: (code) => `<span>${code}</span>`,
		});
		const payload = extractConfig(html) as Record<string, unknown>;
		expect(payload.highlightedHtml).toBe('<span>x</span>');
		expect(payload).not.toHaveProperty('highlightBackground');
		expect(payload).not.toHaveProperty('highlightColor');
	});

	it('forwards background + color from a structured highlight return', async () => {
		const html = await render({
			code: 'x',
			lang: 'js',
			highlight: () => ({
				html: '<span>x</span>',
				background: '#111',
				color: '#eee',
			}),
		});
		const payload = extractConfig(html) as Record<string, unknown>;
		expect(payload.highlightedHtml).toBe('<span>x</span>');
		expect(payload.highlightBackground).toBe('#111');
		expect(payload.highlightColor).toBe('#eee');
	});

	it('renders the theme attribute on the host element when provided', async () => {
		const html = await render({ code: 'x', lang: 'js', theme: 'github-dark' });
		expect(html).toContain('theme="github-dark"');
	});

	it('omits undefined props from the serialized payload', async () => {
		const html = await render({ code: 'x', lang: 'js' });
		const config = extractConfig(html) as Record<string, unknown>;
		expect(config).not.toHaveProperty('filename');
		expect(config).not.toHaveProperty('annotations');
		expect(config).not.toHaveProperty('connections');
	});

	it('renders styleOverrides as inline --cg-* CSS on the host element', async () => {
		const html = await render({
			code: 'x',
			lang: 'js',
			styleOverrides: {
				codeBlock: { background: 'var(--surface)', borderRadius: '4px' },
				lineNumbers: { foreground: '#aaa' },
			},
		});
		expect(html).toContain('--cg-bg:var(--surface)');
		expect(html).toContain('--cg-radius:4px');
		expect(html).toContain('--cg-line-num:#aaa');
		// styleOverrides itself must not leak into the JSON payload.
		const payload = /<script[^>]*>(.*?)<\/script>/s.exec(html)?.[1] ?? '';
		expect(JSON.parse(payload)).not.toHaveProperty('styleOverrides');
	});

	it('omits the style attribute when styleOverrides is empty or unset', async () => {
		const bareHtml = await render({ code: 'x', lang: 'js' });
		expect(bareHtml).not.toContain('style=');

		const emptyHtml = await render({
			code: 'x',
			lang: 'js',
			styleOverrides: { codeBlock: {} },
		});
		expect(emptyHtml).not.toContain('style=');
	});
});
