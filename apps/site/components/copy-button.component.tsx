'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CopyButtonProps } from './copy-button.types';
import {
	BUTTON_STYLE,
	COPY_ICON_SIZE,
	COPY_ICON_STROKE_WIDTH,
	COPY_RESET_MS,
	COPY_SUCCESS_COLOR,
} from './copy-button.constants';

export function CopyButton({ text }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		void navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), COPY_RESET_MS);
	}, [text]);

	const renderIcon = () => {
		if (copied) {
			return (
				<Check
					size={COPY_ICON_SIZE}
					strokeWidth={COPY_ICON_STROKE_WIDTH}
				/>
			);
		}
		return <Copy size={COPY_ICON_SIZE} />;
	};

	const style = {
		...BUTTON_STYLE,
		color: copied ? COPY_SUCCESS_COLOR : 'var(--site-muted)',
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			style={style}
			aria-label="Copy to clipboard"
		>
			{renderIcon()}
		</button>
	);
}
