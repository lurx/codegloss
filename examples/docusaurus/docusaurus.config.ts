import remarkCodegloss from 'codegloss/remark';

import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
	title: 'codegloss · Docusaurus example',
	tagline: 'Annotated code blocks in Docusaurus 3',
	favicon: 'img/favicon.ico',
	url: 'https://example.com',
	baseUrl: '/',
	organizationName: 'lurx',
	projectName: 'codegloss',
	onBrokenLinks: 'warn',
	onBrokenMarkdownLinks: 'warn',

	presets: [
		[
			'classic',
			{
				docs: {
					path: 'docs',
					routeBasePath: 'docs',
					sidebarPath: './sidebars.ts',
					// skipImport: true — we provide CodeGloss via the MDX components
					// mapping in src/theme/MDXComponents.tsx, so the auto-injected
					// `import { CodeGloss }` would be redundant.
					remarkPlugins: [[remarkCodegloss, { skipImport: true }]],
				},
				blog: false,
				theme: {},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		navbar: {
			title: 'codegloss',
			items: [{ to: '/docs/intro', label: 'Docs', position: 'left' }],
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
