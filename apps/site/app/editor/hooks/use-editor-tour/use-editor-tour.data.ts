import type { DriveStep } from 'driver.js';

export const TOUR_STORAGE_KEY = 'codegloss:editor:tour-seen';

export const EDITOR_TOUR_STEPS = [
	{
		element: '[data-tour="code-pane"]',
		popover: {
			title: 'Write your code',
			description:
				'Paste or edit the snippet here. Pick the language and optional filename — the preview updates live.',
		},
	},
	{
		element: '[data-tour="code-picker"]',
		popover: {
			title: 'Annotate tokens',
			description:
				'Click any highlighted token to attach a note. Each click creates an annotation linked to that exact occurrence.',
		},
	},
	{
		element: '[data-tour="annotations"]',
		popover: {
			title: 'Manage annotations',
			description:
				'Edit titles and body text, reorder, or remove annotations. Issues surface inline if something is off.',
		},
	},
	{
		element: '[data-tour="connections"]',
		popover: {
			title: 'Draw connections',
			description:
				'Link two annotations to render an arc between them. Useful for showing dependencies or flow.',
		},
	},
	{
		element: '[data-tour="preview"]',
		popover: {
			title: 'Live preview',
			description:
				'A real codegloss block renders here as you edit. This is exactly what your users will see.',
		},
	},
	{
		element: '[data-tour="export"]',
		popover: {
			title: 'Export',
			description:
				'Copy the configuration as JSON, MDX, or JSX — whichever fits your doc pipeline.',
		},
	},
	{
		element: '[data-tour="settings"]',
		popover: {
			title: 'Settings',
			description: 'Theme, line numbers, and other block-level options live here.',
		},
	},
	{
		element: '[data-tour="help"]',
		popover: {
			title: 'Replay anytime',
			description: 'Click this button to run the tour again. That’s it — happy glossing!',
		},
	},
] as const satisfies readonly DriveStep[];
