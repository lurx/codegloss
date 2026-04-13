import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('./', import.meta.url)).replace(/\/$/, '');

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [{ find: /^@\//, replacement: `${root}/` }],
	},
	test: {
		environment: 'node',
		include: [
			'app/**/__tests__/**/*.test.ts',
			'app/**/__tests__/**/*.test.tsx',
			'app/**/__tests__/**/*.dom.test.ts',
			'app/**/__tests__/**/*.dom.test.tsx',
		],
		// Per-file environments via `// @vitest-environment happy-dom` comments
		// on the .dom test files. Node is the default for the rest.
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
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
				'app/editor/hooks/use-editor-state/use-editor-state.hook.ts',
				'app/editor/hooks/use-codegloss-theme/use-codegloss-theme.hook.ts',
				'app/editor/components/code-picker/code-picker.component.tsx',
				'app/editor/components/import-dialog/import-dialog.component.tsx',
				'app/editor/components/settings-dialog/settings-dialog.component.tsx',
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
