'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

type CopyCodeButtonProps = {
	getTextAction: () => string;
};

export function CopyCodeButton({ getTextAction }: CopyCodeButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		void navigator.clipboard.writeText(getTextAction());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [getTextAction]);

	return (
		<button
			type="button"
			className="code-block-copy"
			onClick={handleCopy}
			aria-label={copied ? 'Copied' : 'Copy code'}
			title={copied ? 'Copied!' : 'Copy code'}
		>
			{copied
				? <Check size={14} strokeWidth={2.5} />
				: <Copy size={14} />}
		</button>
	);
}
