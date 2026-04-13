import { describe, expect, it } from 'vitest';
import type { EditorConfig } from '../../hooks/use-editor-state';
import { exportConfigFile } from '../export-config-file.helpers';

function baseConfig(overrides: Partial<EditorConfig> = {}): EditorConfig {
	return {
		code: 'x',
		lang: 'js',
		annotations: [],
		connections: [],
		...overrides,
	};
}

describe('exportConfigFile', () => {
	it('emits a defaults-only file when no theme/arcs/callouts are set', () => {
		const out = exportConfigFile(baseConfig());
		expect(out).toContain("import { defineConfig } from 'codegloss/config';");
		expect(out).toContain('// use codegloss defaults');
	});

	it('serialises theme, arcs, and callouts entries', () => {
		const out = exportConfigFile(
			baseConfig({
				theme: 'dark',
				arcs: { opacity: 0.5 },
				callouts: { popover: true },
			}),
		);
		expect(out).toContain('theme: "dark",');
		expect(out).toContain('arcs: {');
		expect(out).toContain('callouts: {');
	});

	it('ignores empty arcs/callouts objects', () => {
		const out = exportConfigFile(baseConfig({ arcs: {}, callouts: {} }));
		expect(out).toContain('// use codegloss defaults');
	});
});
