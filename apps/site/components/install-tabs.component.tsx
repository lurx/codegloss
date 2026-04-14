'use client';

import { useCallback, useState, type MouseEvent } from 'react';
import { CopyCodeButton } from './copy-code-button.component';
import { COMMAND_PREFIXES, MANAGERS } from './install-tabs.constants';
import type { InstallTabsProps, PackageManager } from './install-tabs.types';

export function InstallTabs({ packages }: Readonly<InstallTabsProps>) {
	const [active, setActive] = useState<PackageManager>('npm');

	const command = `${COMMAND_PREFIXES[active]} ${packages}`;

	const handleSelect = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		setActive(event.currentTarget.dataset.manager as PackageManager);
	}, []);

	const getText = useCallback(() => command, [command]);

	return (
		<div className="install-tabs">
			<div className="install-tabs-bar" role="tablist">
				{MANAGERS.map(manager => (
					<button
						key={manager}
						type="button"
						role="tab"
						aria-selected={manager === active}
						data-manager={manager}
						className={`install-tabs-trigger${manager === active ? ' install-tabs-trigger-active' : ''}`}
						onClick={handleSelect}
					>
						{manager}
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
