import { MousePointerClick, Spline, FileCode2 } from 'lucide-react';
import type { Feature, Framework } from './page.types';

export const INSTALL_CMD = 'npm install codegloss';

export const FEATURES: Feature[] = [
	{
		icon: <MousePointerClick size={16} />,
		title: 'Interactive Annotations',
		description:
			'Click any highlighted token to reveal an explanation. Annotations are defined in JSON alongside your code — no custom syntax to learn.',
	},
	{
		icon: <Spline size={16} />,
		title: 'Connection Arcs',
		description:
			'Draw visual arcs between related annotations. Gutter lines connect concepts with click-to-explain popovers.',
	},
	{
		icon: <FileCode2 size={16} />,
		title: 'MDX Native',
		description:
			'Write fenced code blocks with a `codegloss` tag. The remark plugin detects them and emits CodeGloss components at build time.',
	},
];

export const FRAMEWORKS = [
	{ label: 'Markdown', href: '/docs/usage/markdown' },
	{ label: 'React', href: '/docs/setup/react' },
	{ label: 'Vue', href: '/docs/setup/vue' },
	{ label: 'Svelte', href: '/docs/setup/svelte' },
	{ label: 'Next.js', href: '/docs/setup/nextjs' },
	{ label: 'Astro', href: '/docs/setup/astro' },
	{ label: 'VitePress', href: '/docs/setup/vitepress' },
	{ label: 'Docusaurus', href: '/docs/setup/docusaurus' },
	{ label: 'Vanilla HTML', href: '/docs/api' },
] satisfies Framework[];
