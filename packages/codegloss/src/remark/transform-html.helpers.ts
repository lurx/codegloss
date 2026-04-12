import type { Html } from 'mdast';
import type { AnnotationsData, DetectedPair } from './remark.types';

/**
 * Builds a raw HTML mdast node containing a `<code-gloss>` custom element
 * with its config in a `<script type="application/json">` child.
 *
 * Use this when piping markdown through `remark-rehype` → `rehype-stringify`,
 * or any non-MDX pipeline. The consumer is responsible for loading the
 * `codegloss` runtime in their HTML page.
 */
export function buildCodeGlossHtmlNode(pair: DetectedPair): Html {
	const config: Record<string, unknown> = {
		code: pair.code,
		lang: pair.lang,
	};

	if (pair.filename) {
		config.filename = pair.filename;
	}

	const themeAttr = pair.theme ? ` theme="${pair.theme}"` : '';

	if (pair.annotationsJson) {
		try {
			const parsed = JSON.parse(pair.annotationsJson) as AnnotationsData;

			if (parsed.annotations && Array.isArray(parsed.annotations)) {
				config.annotations = parsed.annotations;
			}

			if (parsed.connections && Array.isArray(parsed.connections)) {
				config.connections = parsed.connections;
			}

			if (parsed.arcs && typeof parsed.arcs === 'object') {
				config.arcs = parsed.arcs;
			}

			if (parsed.callouts && typeof parsed.callouts === 'object') {
				config.callouts = parsed.callouts;
			}
		} catch {
			console.warn(
				'[remark-codegloss] Failed to parse annotations JSON, rendering without annotations',
			);
		}
	}

	// Escape `</script` so the JSON payload can't break out of the script tag.
	const json = JSON.stringify(config).replaceAll(
		/<\/script/gi,
		String.raw`<\/script`,
	);

	return {
		type: 'html',
		value: `<code-gloss${themeAttr}><script type="application/json">${json}</script></code-gloss>`,
	};
}
