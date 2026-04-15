import type { CSSProperties } from 'react';

export {
	BLOCK_WRAPPER_STYLE,
	BLOCK_LABEL_STYLE,
} from './copyable-block.constants';

export const TAB_CONTENT_STYLE = {
	color: 'var(--site-fg)',
	lineHeight: 1.72,
	fontSize: '0.9375rem',
	marginBottom: '1rem',
} as const satisfies CSSProperties;
