import type { PackageManager } from '@/hooks';

export const COMMAND_PREFIXES = {
	npm: 'npm install',
	yarn: 'yarn add',
	pnpm: 'pnpm add',
} as const satisfies Record<PackageManager, string>;
