import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import process from 'node:process';
import type { CodeGlossUserConfig } from './config.types';

const CONFIG_FILES = [
	'codegloss.config.ts',
	'codegloss.config.mts',
	'codegloss.config.js',
	'codegloss.config.mjs',
	'.codeglossrc.json',
	'.codeglossrc',
];

/**
 * Search for a codegloss config file starting from `cwd` and walking
 * up to `stopAt` (defaults to filesystem root). Returns the parsed
 * config, or undefined if no config file is found.
 *
 * JSON files (.codeglossrc, .codeglossrc.json) are parsed directly.
 * JS/TS files must be loaded by the caller's bundler (e.g. via
 * `await import()`). This function returns the **path** for JS/TS
 * files so the caller can handle module resolution.
 */
export function loadConfig(
	cwd?: string,
): { config: CodeGlossUserConfig; filepath: string } | undefined {
	const startDir = resolve(cwd ?? process.cwd());
	let dir = startDir;

	while (true) {
		for (const filename of CONFIG_FILES) {
			const filepath = join(dir, filename);

			try {
				const content = readFileSync(filepath, 'utf8');

				if (filename.endsWith('.json') || filename === '.codeglossrc') {
					return {
						config: JSON.parse(content) as CodeGlossUserConfig,
						filepath,
					};
				}

				// For JS/TS config files, we can't import them synchronously.
				// Return the path so the caller can `await import()` it.
				// This is used by the remark plugin at build time.
				return { config: {}, filepath };
			} catch {
				// File doesn't exist or can't be read — try next
			}
		}

		const parent = resolve(dir, '..');

		if (parent === dir) break;

		dir = parent;
	}

	return undefined;
}
