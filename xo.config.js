export default [
	{
		ignores: ['apps/**', 'examples/**', 'test/**', '**/*.svelte'],
	},
	{
		prettier: true,
		semicolon: true,
		rules: {
			// Allow UPPER_CASE constants and PascalCase for classes/types
			'@typescript-eslint/naming-convention': 'off',
			// Web component code relies on type assertions for DOM APIs
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			// JS runner intentionally uses new Function()
			'no-new-func': 'off',
			// Regex patterns don't all need the unicode flag
			'require-unicode-regexp': 'off',
			// Allow empty functions (common in tests and event handlers)
			'@typescript-eslint/no-empty-function': 'off',
			// Allow type-only namespace declarations
			'@typescript-eslint/no-namespace': 'off',
			// Allow classes used for custom element registration
			'@typescript-eslint/no-extraneous-class': 'off',
			// Allow void returns in arrow functions
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/strict-void-return': 'off',
			// Allow unassigned imports (side-effect imports for web components)
			'import-x/no-unassigned-import': 'off',
			// Import extensions handled by bundler
			'import-x/extensions': 'off',
			// Allow member ordering as-is
			'@typescript-eslint/member-ordering': 'off',
			// Allow no-promise-executor-return for concise patterns
			'no-promise-executor-return': 'off',
			// Allow == null checks
			'no-eq-null': 'off',
			eqeqeq: ['error', 'always', { null: 'ignore' }],
			// Allow index-based for loops when index is needed
			'unicorn/no-for-loop': 'off',
		},
	},
];
