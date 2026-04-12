import type { CSSProperties } from 'react';

export const COPY_RESET_MS = 2000;
export const COPY_ICON_SIZE = 14;
export const COPY_ICON_STROKE_WIDTH = 2.5;
export const COPY_SUCCESS_COLOR = '#5dcaa5';

export const BUTTON_STYLE = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
} as const satisfies CSSProperties;
