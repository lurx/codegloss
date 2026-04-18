import { defineConfig } from 'tsup';

// ESM-only build for everything consumed from bundlers/browsers.
// The remark subpath keeps a CJS twin (see below) because it's commonly
// loaded from jiti-backed config files (Docusaurus, Astro, etc.) that
// still resolve via require().
export default defineConfig([
	{
		entry: {
			index: 'src/index.ts',
			'themes/index': 'src/themes/index.ts',
			'config/index': 'src/config/index.ts',
			'config/node': 'src/config/load-config.ts',
			'remark/index': 'src/remark/index.ts',
			'highlighters/index': 'src/highlighters/index.ts',
			'highlighters/shiki': 'src/highlighters/shiki.ts',
			'highlighters/prism': 'src/highlighters/prism.ts',
			'highlighters/hljs': 'src/highlighters/hljs.ts',
		},
		format: ['esm'],
		dts: true,
		clean: true,
		external: ['unified'],
	},
	{
		entry: { 'remark/index': 'src/remark/index.ts' },
		format: ['cjs'],
		dts: false,
		clean: false,
		external: ['unified'],
	},
]);
