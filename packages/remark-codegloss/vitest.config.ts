import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/__tests__/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: [
				'src/detect.helpers.ts',
				'src/transform-mdx.helpers.ts',
				'src/transform-html.helpers.ts',
				'src/inject-import.helpers.ts',
				'src/index.ts',
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
