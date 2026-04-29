/**
 * Splits a blob of highlighted HTML into one string per source line,
 * preserving any `<span>` (or other) tags that wrap text across newlines
 * by closing them at the end of each line and reopening them on the next.
 *
 * Shiki, Prism, hljs, etc. all emit nested `<span>` markup around tokens.
 * When a token spans multiple lines (template strings, block comments),
 * naively splitting on `\n` breaks the tag nesting. This walker keeps a
 * stack of open tags and reissues them per-line.
 *
 * Void tags (`<br/>`, `<img/>`) and comment/CDATA blocks are passed through
 * without touching the open-tag stack.
 */
const OPEN_TAG_NAME_PATTERN = /^<([a-zA-Z][\w-]*)/;
// Stack entries are tuples of [rawTag, tagName] so we can reissue the tag
// verbatim at the start of the next line and emit a matching close tag.
type OpenStack = Array<[raw: string, name: string]>;

// Longest entity reference we recognize (e.g. `&nbsp;`, `&#x2014;`).
const MAX_ENTITY_LENGTH = 8;

function consumeTag(
	html: string,
	i: number,
	openStack: OpenStack,
): { tag: string; nextI: number } {
	const tagEnd = html.indexOf('>', i);
	if (tagEnd === -1) {
		return { tag: html.slice(i), nextI: html.length };
	}

	const tag = html.slice(i, tagEnd + 1);
	const nameMatch = OPEN_TAG_NAME_PATTERN.exec(tag);

	if (tag.startsWith('</')) {
		openStack.pop();
	} else if (nameMatch && !tag.endsWith('/>')) {
		openStack.push([tag, nameMatch[1]]);
	}

	return { tag, nextI: tagEnd + 1 };
}

function flushLine(
	buffer: string,
	openStack: OpenStack,
	lines: string[],
): string {
	let closed = buffer;
	for (let j = openStack.length - 1; j >= 0; j--) {
		closed += `</${openStack[j][1]}>`;
	}

	lines.push(closed);
	return openStack.map(([raw]) => raw).join('');
}

function tryConsumeEntity(
	html: string,
	i: number,
): { text: string; nextI: number } | undefined {
	const semi = html.indexOf(';', i);
	if (semi !== -1 && semi - i <= MAX_ENTITY_LENGTH) {
		return { text: html.slice(i, semi + 1), nextI: semi + 1 };
	}

	return undefined;
}

export function splitHighlightedLines(html: string): string[] {
	const lines: string[] = [];
	const openStack: OpenStack = [];
	let buffer = '';
	let i = 0;

	while (i < html.length) {
		const ch = html[i];

		if (ch === '<') {
			const { tag, nextI } = consumeTag(html, i, openStack);
			buffer += tag;
			i = nextI;
			continue;
		}

		if (ch === '\n') {
			buffer = flushLine(buffer, openStack, lines);
			i++;
			continue;
		}

		if (ch === '&') {
			const entity = tryConsumeEntity(html, i);
			if (entity) {
				buffer += entity.text;
				i = entity.nextI;
				continue;
			}
		}

		buffer += ch;
		i++;
	}

	lines.push(buffer);
	return lines;
}
