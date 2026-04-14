import type { PackageManager } from './use-package-manager.types';

export const STORAGE_KEY = 'codegloss:install-tabs:manager';
export const STORAGE_EVENT = 'codegloss:install-tabs:change';
export const DEFAULT_MANAGER: PackageManager = 'npm';
export const VALID_MANAGERS = ['npm', 'yarn', 'pnpm'] as const satisfies readonly PackageManager[];
