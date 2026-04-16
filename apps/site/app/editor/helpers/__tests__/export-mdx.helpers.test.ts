import { describe, expect, it } from 'vitest';
import type { EditorConfig } from '../../hooks/use-editor-state';
import { exportMdx } from '../export-mdx.helpers';

function baseConfig(overrides: Partial<EditorConfig> = {}): EditorConfig {
	return {
		code: 'console.log(1);',
		lang: 'js',
		annotations: [],
		connections: [],
		...overrides,
	};
}

describe('exportMdx', () => {
	it('emits only the codegloss fence when there is no metadata', () => {
		const out = exportMdx(baseConfig());
		expect(out).toBe('```js codegloss\nconsole.log(1);\n```');
	});

	it('appends the filename to the fence header', () => {
		const out = exportMdx(baseConfig({ filename: 'demo.js' }));
		expect(out.startsWith('```js codegloss demo.js\n')).toBe(true);
	});

	it('adds an annotations block when annotations or connections exist', () => {
		const out = exportMdx(
			baseConfig({
				annotations: [{ id: 'a1', token: 'x', line: 0, occurrence: 0 }],
				connections: [{ from: 'a1', to: 'a2', color: '#000' }],
				arcs: { opacity: 0.5 },
				callouts: { popover: true },
			}),
		);
		expect(out).toContain('```json annotations');
		const payload = JSON.parse(
			out.split('```json annotations\n')[1].split('\n```')[0],
		);
		expect(payload.annotations).toHaveLength(1);
		expect(payload.connections).toHaveLength(1);
		expect(payload.arcs).toEqual({ opacity: 0.5 });
		expect(payload.callouts).toEqual({ popover: true });
	});

	it('omits the annotations block for empty arcs/callouts', () => {
		const out = exportMdx(baseConfig({ arcs: {}, callouts: {} }));
		expect(out).not.toContain('```json annotations');
	});
});
