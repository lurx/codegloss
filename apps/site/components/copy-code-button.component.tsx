'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CopyCodeButtonProps } from './copy-code-button.types';
import {
	COPY_ICON_SIZE,
	COPY_ICON_STROKE_WIDTH,
	COPY_RESET_MS,
} from './copy-button.constants';

export function CopyCodeButton({ getTextAction }: CopyCodeButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		void navigator.clipboard.writeText(getTextAction());
		setCopied(true);
		setTimeout(() => setCopied(false), COPY_RESET_MS);
	}, [getTextAction]);

	const renderIcon = () => {
		if (copied) {
			return <Check size={COPY_ICON_SIZE} strokeWidth={COPY_ICON_STROKE_WIDTH} />;
		}
		return <Copy size={COPY_ICON_SIZE} />;
	};

	return (
		<button
			type="button"
			className="code-block-copy"
			onClick={handleCopy}
			aria-label={copied ? 'Copied' : 'Copy code'}
			title={copied ? 'Copied!' : 'Copy code'}
		>
			{renderIcon()}
		</button>
	);
}
