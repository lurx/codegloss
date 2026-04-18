import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: 'node',
					environment: 'node',
					include: [
						'src/**/__tests__/**/*.test.ts',
						'src/**/__tests__/**/*.test.tsx',
					],
					exclude: ['src/**/__tests__/**/*.dom.test.*'],
				},
			},
			{
				test: {
					name: 'dom',
					environment: 'happy-dom',
					include: [
						'src/**/__tests__/**/*.dom.test.ts',
						'src/**/__tests__/**/*.dom.test.tsx',
					],
				},
			},
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			// Phase 1: only the pure helpers are under test. Expand this list as
			// additional test layers (WC element, arcs, React wrapper) come online.
			include: [
				'src/core/escape-html.util.ts',
				'src/core/tokenize.helpers.ts',
				'src/core/inject-annotations.helpers.ts',
				'src/core/runners.helpers.ts',
				'src/core/render/arcs.helpers.ts',
				'src/core/measure-line-end.helpers.ts',
				'src/core/code-gloss.element.ts',
				'src/core/default-highlighter.helpers.ts',
				'src/core/split-lines.helpers.ts',
				'src/highlighters/shiki.ts',
				'src/highlighters/prism.ts',
				'src/highlighters/hljs.ts',
				'src/highlighters/parse-pre-style.helpers.ts',
				'src/themes/theme-css.helpers.ts',
				'src/themes/index.ts',
				'src/remark/index.ts',
				'src/remark/detect.helpers.ts',
				'src/remark/inject-import.helpers.ts',
				'src/remark/transform-html.helpers.ts',
				'src/remark/transform-mdx.helpers.ts',
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
