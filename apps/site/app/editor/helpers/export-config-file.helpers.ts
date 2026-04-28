import type { EditorConfig } from '../hooks/use-editor-state';

function formatObject(value: object): string {
	return JSON.stringify(value, null, 2)
		.split('\n')
		.map((line, i) => (i === 0 ? line : `\t${line}`))
		.join('\n');
}

export function exportConfigFile(config: EditorConfig): string {
	const entries: string[] = [];
	if (config.theme) entries.push(`\ttheme: ${JSON.stringify(config.theme)},`);
	if (config.arcs && Object.keys(config.arcs).length > 0) {
		entries.push(`\tarcs: ${formatObject(config.arcs)},`);
	}
	if (config.callouts && Object.keys(config.callouts).length > 0) {
		entries.push(`\tcallouts: ${formatObject(config.callouts)},`);
	}

	const body =
		entries.length === 0 ? '\t// use codegloss defaults' : entries.join('\n');

	return [
		`import { defineConfig } from 'codegloss/config';`,
		'',
		'export default defineConfig({',
		body,
		'});',
	].join('\n');
}
