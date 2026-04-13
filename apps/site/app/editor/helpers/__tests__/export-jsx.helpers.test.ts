import { describe, expect, it } from 'vitest';
import type { EditorConfig } from '../../hooks/use-editor-state';
import { exportJsx } from '../export-jsx.helpers';

function baseConfig(overrides: Partial<EditorConfig> = {}): EditorConfig {
	return {
		code: 'x',
		lang: 'js',
		annotations: [],
		connections: [],
		...overrides,
	};
}

describe('exportJsx', () => {
	it('emits a minimal CodeGloss element', () => {
		const out = exportJsx(baseConfig());
		expect(out).toContain('<CodeGloss');
		expect(out).toContain('code={"x"}');
		expect(out).toContain('lang="js"');
		expect(out).toContain('/>');
	});

	it('serialises optional attributes including runnable shorthand', () => {
		const out = exportJsx(
			baseConfig({
				filename: 'f.js',
				runnable: true,
				theme: 'dark',
				arcs: { opacity: 0.5 },
				callouts: { popover: true },
				annotations: [{ id: 'a1', token: 'x', line: 0, occurrence: 0 }],
				connections: [{ from: 'a1', to: 'a2', color: '#000' }],
			}),
		);
		expect(out).toContain('filename="f.js"');
		expect(out).toMatch(/\brunnable\b(?!=)/);
		expect(out).toContain('theme="dark"');
		expect(out).toContain('arcs={');
		expect(out).toContain('callouts={');
		expect(out).toContain('annotations={');
		expect(out).toContain('connections={');
	});

	it('emits runnable={false} when disabled explicitly', () => {
		const out = exportJsx(baseConfig({ runnable: false }));
		expect(out).toContain('runnable={false}');
	});
});
