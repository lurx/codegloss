export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export type UsePackageManagerResult = readonly [
	PackageManager,
	(next: PackageManager) => void,
];
