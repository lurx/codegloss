import type { CSSProperties } from 'react';

export const BLOCK_WRAPPER_STYLE = {
	marginBottom: '0.75rem',
} as const satisfies CSSProperties;

export const BLOCK_LABEL_STYLE = {
	fontSize: '0.6875rem',
	fontWeight: 600,
	textTransform: 'uppercase',
	letterSpacing: '0.06em',
	color: 'var(--site-muted)',
	marginBottom: '0.375rem',
} as const satisfies CSSProperties;

export const TAB_CONTENT_STYLE = {
	color: 'var(--site-fg)',
	lineHeight: 1.72,
	fontSize: '0.9375rem',
	marginBottom: '1rem',
} as const satisfies CSSProperties;
