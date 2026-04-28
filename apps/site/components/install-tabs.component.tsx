'use client';

import { useCallback, type MouseEvent } from 'react';
import { CopyCodeButton } from './copy-code-button.component';
import { COMMAND_PREFIXES } from './install-tabs.constants';
import type { InstallTabsProps } from './install-tabs.types';
import {
	usePackageManager,
	VALID_MANAGERS,
	type PackageManager,
} from '@/hooks';

export function InstallTabs({ packages }: Readonly<InstallTabsProps>) {
	const [manager, setManagerAction] = usePackageManager();

	const command = `${COMMAND_PREFIXES[manager]} ${packages}`;

	const handleSelect = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			setManagerAction(event.currentTarget.dataset.manager as PackageManager);
		},
		[setManagerAction],
	);

	const getText = useCallback(() => command, [command]);

	return (
		<div className="install-tabs">
			<div
				className="install-tabs-bar"
				role="tablist"
			>
				{VALID_MANAGERS.map(pm => (
					<button
						key={pm}
						type="button"
						role="tab"
						aria-selected={pm === manager}
						data-manager={pm}
						className={`install-tabs-trigger${pm === manager ? ' install-tabs-trigger-active' : ''}`}
						onClick={handleSelect}
					>
						{pm}
					</button>
				))}
			</div>
			<div className="code-block-wrapper">
				<pre className="install-tabs-command">
					<code>{command}</code>
				</pre>
				<CopyCodeButton getTextAction={getText} />
			</div>
		</div>
	);
}
