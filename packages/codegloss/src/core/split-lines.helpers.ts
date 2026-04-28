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

export function splitHighlightedLines(html: string): string[] {
	const lines: string[] = [];
	// Stack entries are tuples of [rawTag, tagName] so we can reissue the tag
	// verbatim at the start of the next line and emit a matching close tag.
	const openStack: Array<[raw: string, name: string]> = [];
	let buffer = '';
	let i = 0;

	while (i < html.length) {
		const ch = html[i];

		if (ch === '<') {
			const tagEnd = html.indexOf('>', i);
			if (tagEnd === -1) {
				buffer += html.slice(i);
				break;
			}

			const tag = html.slice(i, tagEnd + 1);
			const nameMatch = OPEN_TAG_NAME_PATTERN.exec(tag);

			if (tag.startsWith('</')) {
				openStack.pop();
			} else if (nameMatch && !tag.endsWith('/>')) {
				openStack.push([tag, nameMatch[1]]);
			}

			buffer += tag;
			i = tagEnd + 1;
			continue;
		}

		if (ch === '\n') {
			for (let j = openStack.length - 1; j >= 0; j--) {
				buffer += `</${openStack[j][1]}>`;
			}

			lines.push(buffer);
			buffer = openStack.map(([raw]) => raw).join('');
			i++;
			continue;
		}

		if (ch === '&') {
			const semi = html.indexOf(';', i);
			if (semi !== -1 && semi - i <= 8) {
				buffer += html.slice(i, semi + 1);
				i = semi + 1;
				continue;
			}
		}

		buffer += ch;
		i++;
	}

	lines.push(buffer);
	return lines;
}
