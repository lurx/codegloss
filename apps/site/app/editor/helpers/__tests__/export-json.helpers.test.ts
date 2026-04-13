import { describe, expect, it } from 'vitest';
import type { EditorConfig } from '../../hooks/use-editor-state';
import { exportJson } from '../export-json.helpers';

function baseConfig(overrides: Partial<EditorConfig> = {}): EditorConfig {
	return {
		code: 'x',
		lang: 'js',
		annotations: [],
		connections: [],
		...overrides,
	};
}

describe('exportJson', () => {
	it('emits the minimal payload with only code and lang', () => {
		const out = JSON.parse(exportJson(baseConfig()));
		expect(out).toEqual({ code: 'x', lang: 'js' });
	});

	it('includes every optional field when set', () => {
		const out = JSON.parse(
			exportJson(
				baseConfig({
					filename: 'a.js',
					runnable: true,
					theme: 'dark',
					arcs: { opacity: 0.5 },
					callouts: { popover: true },
					annotations: [{ id: 'a1', token: 'x', line: 0, occurrence: 0 }],
					connections: [{ from: 'a1', to: 'a2', color: '#000' }],
				}),
			),
		);
		expect(out).toMatchObject({
			filename: 'a.js',
			runnable: true,
			theme: 'dark',
			arcs: { opacity: 0.5 },
			callouts: { popover: true },
		});
		expect(out.annotations).toHaveLength(1);
		expect(out.connections).toHaveLength(1);
	});

	it('omits runnable=false is preserved but empty arcs/callouts objects are dropped', () => {
		const out = JSON.parse(
			exportJson(baseConfig({ runnable: false, arcs: {}, callouts: {} })),
		);
		expect(out).toEqual({ code: 'x', lang: 'js', runnable: false });
	});
});
