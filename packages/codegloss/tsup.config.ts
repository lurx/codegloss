import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		'react/index': 'src/react/index.ts',
		'vue/index': 'src/vue/index.ts',
		'themes/index': 'src/themes/index.ts',
		'config/index': 'src/config/index.ts',
		'config/node': 'src/config/load-config.ts',
		'remark/index': 'src/remark/index.ts',
	},
	format: ['esm', 'cjs'],
	dts: true,
	clean: true,
	external: ['react', 'react/jsx-runtime', 'vue', 'unified'],
});
