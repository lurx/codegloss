import type { Html } from 'mdast';
import type { AnnotationsData, DetectedPair } from './remark.types';

function parseAnnotationsData(json: string | undefined): AnnotationsData {
	if (!json) return {};
	try {
		return JSON.parse(json) as AnnotationsData;
	} catch {
		console.warn(
			'[remark-codegloss] Failed to parse annotations JSON, rendering without annotations',
		);
		return {};
	}
}

function mergeObject(
	base: Record<string, unknown> | undefined,
	override: unknown,
): Record<string, unknown> | undefined {
	if (override && typeof override === 'object') {
		return { ...base, ...(override as Record<string, unknown>) };
	}
	return base;
}

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

	const parsed = parseAnnotationsData(pair.annotationsJson);

	if (Array.isArray(parsed.annotations)) config.annotations = parsed.annotations;
	if (Array.isArray(parsed.connections)) config.connections = parsed.connections;

	const mergedArcs = mergeObject(pair.arcs, parsed.arcs);
	if (mergedArcs && Object.keys(mergedArcs).length > 0) {
		config.arcs = mergedArcs;
	}

	const mergedCallouts = mergeObject(pair.callouts, parsed.callouts);
	if (mergedCallouts && Object.keys(mergedCallouts).length > 0) {
		config.callouts = mergedCallouts;
	}

	if (pair.highlightedHtml) {
		config.highlightedHtml = pair.highlightedHtml;
	}

	if (pair.highlightBackground) {
		config.highlightBackground = pair.highlightBackground;
	}

	if (pair.highlightColor) {
		config.highlightColor = pair.highlightColor;
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
