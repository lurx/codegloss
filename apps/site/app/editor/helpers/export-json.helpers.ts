import type { EditorConfig } from '../hooks/use-editor-state';

export function exportJson(config: EditorConfig): string {
	const payload: Record<string, unknown> = {
		code: config.code,
		lang: config.lang,
	};
	if (config.filename) payload.filename = config.filename;
	if (typeof config.runnable === 'boolean') payload.runnable = config.runnable;
	if (config.theme) payload.theme = config.theme;
	if (config.arcs && Object.keys(config.arcs).length > 0) payload.arcs = config.arcs;
	if (config.callouts && Object.keys(config.callouts).length > 0) payload.callouts = config.callouts;
	if (config.annotations.length > 0) payload.annotations = config.annotations;
	if (config.connections.length > 0) payload.connections = config.connections;
	return JSON.stringify(payload, null, 2);
}
