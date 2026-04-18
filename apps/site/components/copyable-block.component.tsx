'use client';

import { useCallback, useRef } from 'react';
import { CopyCodeButton } from './copy-code-button.component';
import type { CopyableBlockProps } from './copyable-block.types';
import {
	BLOCK_LABEL_STYLE,
	BLOCK_WRAPPER_STYLE,
} from './copyable-block.constants';

export function CopyableBlock({ html, label }: Readonly<CopyableBlockProps>) {
	const codeRef = useRef<HTMLDivElement>(null);

	const getText = useCallback(() => codeRef.current?.textContent ?? '', []);

	const renderLabel = () => {
		if (!label) return null;
		return <div style={BLOCK_LABEL_STYLE}>{label}</div>;
	};

	return (
		<div style={BLOCK_WRAPPER_STYLE}>
			{renderLabel()}
			<div className="code-block-wrapper">
				<div
					ref={codeRef}
					className="usage-code-block"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
				<CopyCodeButton getTextAction={getText} />
			</div>
		</div>
	);
}
