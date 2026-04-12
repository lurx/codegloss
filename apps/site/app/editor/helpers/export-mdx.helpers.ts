import type { EditorConfig } from '../hooks/use-editor-state';

export function exportMdx(config: EditorConfig): string {
	const filenameSuffix = config.filename ? ` ${config.filename}` : '';
	const firstFence = `\`\`\`${config.lang} sandbox${filenameSuffix}`;

	const annotationsPayload: Record<string, unknown> = {};
	if (config.annotations.length > 0) {
		annotationsPayload.annotations = config.annotations;
	}
	if (config.connections.length > 0) {
		annotationsPayload.connections = config.connections;
	}

	const sections = [firstFence, config.code, '```'];

	if (Object.keys(annotationsPayload).length > 0) {
		sections.push(
			'',
			'```json annotations',
			JSON.stringify(annotationsPayload, null, 2),
			'```',
		);
	}

	return sections.join('\n');
}
