import type { CSSProperties } from 'react';

export const SOURCE_PRE_STYLE = {
	background: 'var(--site-surface)',
	border: '1px solid var(--site-border)',
	borderRadius: '0 8px 8px 8px',
	padding: '1rem',
	overflowX: 'auto',
	fontFamily: 'var(--font-mono)',
	fontSize: '0.75rem',
	lineHeight: 1.7,
	color: 'var(--site-pre-fg)',
} as const satisfies CSSProperties;
