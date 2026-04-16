import type { EditorConfig } from '../hooks/use-editor-state';

function formatString(value: string): string {
	return JSON.stringify(value);
}

function formatExpression(value: unknown): string {
	return `{${JSON.stringify(value, null, 2)}}`;
}

export function exportJsx(config: EditorConfig): string {
	const attrs: string[] = [];
	attrs.push(`code={${JSON.stringify(config.code)}}`);
	attrs.push(`lang=${formatString(config.lang)}`);
	if (config.filename) attrs.push(`filename=${formatString(config.filename)}`);
	if (config.theme) attrs.push(`theme=${formatString(config.theme)}`);
	if (config.arcs && Object.keys(config.arcs).length > 0) {
		attrs.push(`arcs=${formatExpression(config.arcs)}`);
	}
	if (config.callouts && Object.keys(config.callouts).length > 0) {
		attrs.push(`callouts=${formatExpression(config.callouts)}`);
	}
	if (config.annotations.length > 0) {
		attrs.push(`annotations=${formatExpression(config.annotations)}`);
	}
	if (config.connections.length > 0) {
		attrs.push(`connections=${formatExpression(config.connections)}`);
	}
	return `<CodeGloss\n  ${attrs.join('\n  ')}\n/>`;
}
