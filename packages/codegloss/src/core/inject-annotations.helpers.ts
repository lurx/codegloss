import type { AnnotationHit } from './code-gloss.types';

/**
 * Injects annotation `<mark>` wrappers into pre-highlighted HTML.
 *
 * The hits are defined by character positions in the *plain text* of the line.
 * This function maps those positions through the HTML tag structure so that
 * annotation marks wrap the correct text without breaking existing tags.
 *
 * Example:
 *   html:  '<span class="kw">const</span> memo = {};'
 *   hit:   { start: 6, end: 10 }  (plain text "memo")
 *   result: '<span class="kw">const</span> <mark ...>memo</mark> = {};'
 */
export function injectAnnotationsIntoHtml(
	html: string,
	hits: AnnotationHit[],
): string {
	if (hits.length === 0) return html;

	// Build a map from plain-text index → html index.
	const textToHtml: number[] = [];
	let inTag = false;
	let inEntity = false;

	for (let i = 0; i < html.length; i++) {
		if (inTag) {
			if (html[i] === '>') inTag = false;
			continue;
		}

		if (html[i] === '<') {
			inTag = true;
			continue;
		}

		if (inEntity) {
			if (html[i] === ';') inEntity = false;
			continue;
		}

		if (html[i] === '&') {
			inEntity = true;
			textToHtml.push(i);
			continue;
		}

		textToHtml.push(i);
	}

	const insertions: Array<{
		htmlIndex: number;
		tag: string;
		priority: number;
	}> = [];

	for (const hit of hits) {
		if (hit.start >= textToHtml.length) continue;

		const openAt = textToHtml[hit.start];
		const lastTextIdx = Math.min(hit.end - 1, textToHtml.length - 1);
		const lastHtmlIdx = textToHtml[lastTextIdx];
		const closeAt = findEndOfChar(html, lastHtmlIdx);

		const markOpen = `<mark class="atk" data-ann-id="${hit.annotation.id}">`;
		const markClose = '</mark>';

		insertions.push(
			{ htmlIndex: closeAt, tag: markClose, priority: 1 },
			{ htmlIndex: openAt, tag: markOpen, priority: 0 },
		);
	}

	insertions.sort(
		(a, b) => b.htmlIndex - a.htmlIndex || b.priority - a.priority,
	);

	let result = html;

	for (const ins of insertions) {
		result =
			result.slice(0, ins.htmlIndex) + ins.tag + result.slice(ins.htmlIndex);
	}

	return result;
}

function findEndOfChar(html: string, idx: number): number {
	if (html[idx] === '&') {
		const semi = html.indexOf(';', idx);
		return semi === -1 ? idx + 1 : semi + 1;
	}

	return idx + 1;
}
