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
		const html = await render(props);
		expect(extractConfig(html)).toEqual(props);
	});

	it('omits undefined props from the serialized payload', async () => {
		const html = await render({ code: 'x', lang: 'js' });
		const config = extractConfig(html) as Record<string, unknown>;
		expect(config).not.toHaveProperty('filename');
		expect(config).not.toHaveProperty('annotations');
		expect(config).not.toHaveProperty('connections');
		expect(config).not.toHaveProperty('runnable');
	});
});
