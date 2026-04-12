export const AUTO_THEME_VALUE = '';

export const THEME_OPTIONS = [
	{ value: AUTO_THEME_VALUE, label: 'Auto (match site theme)' },
	{ value: 'github-light', label: 'github-light' },
	{ value: 'github-dark', label: 'github-dark' },
	{ value: 'one-light', label: 'one-light' },
	{ value: 'one-dark', label: 'one-dark' },
	{ value: 'dracula', label: 'dracula' },
	{ value: 'nord-light', label: 'nord-light' },
	{ value: 'nord-dark', label: 'nord-dark' },
	{ value: 'vitesse-light', label: 'vitesse-light' },
	{ value: 'vitesse-dark', label: 'vitesse-dark' },
] as const;
