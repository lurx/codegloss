import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['app/**/__tests__/**/*.test.ts', 'app/**/__tests__/**/*.test.tsx'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			// Phase 1: pure helpers for the editor. Expand as hook + component
			// tests come online.
			include: [
				'app/editor/helpers/validate-config.helpers.ts',
				'app/editor/helpers/import-config.helpers.ts',
				'app/editor/helpers/export-json.helpers.ts',
				'app/editor/helpers/export-mdx.helpers.ts',
				'app/editor/helpers/export-jsx.helpers.ts',
				'app/editor/helpers/export-config-file.helpers.ts',
				'app/editor/components/annotations-panel/annotations-panel.helpers.ts',
				'app/editor/components/connections-panel/connections-panel.helpers.ts',
				'app/editor/components/code-picker/code-picker.helpers.ts',
				'app/editor/components/settings-dialog/settings-dialog.helpers.ts',
			],
			thresholds: {
				lines: 100,
				branches: 100,
				functions: 100,
				statements: 100,
			},
		},
	},
});
