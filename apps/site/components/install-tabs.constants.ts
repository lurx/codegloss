import type { PackageManager } from './install-tabs.types';

export const MANAGERS: readonly PackageManager[] = ['npm', 'yarn', 'pnpm'];

export const COMMAND_PREFIXES = {
	npm: 'npm install',
	yarn: 'yarn add',
	pnpm: 'pnpm add',
} as const satisfies Record<PackageManager, string>;
