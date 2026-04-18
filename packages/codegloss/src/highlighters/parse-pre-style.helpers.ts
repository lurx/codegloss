/**
 * Pulls `background-color` and `color` out of an inline `style="..."`
 * attribute on the highlighter's outermost element (the `<pre>` Shiki
 * emits, for example). Used by adapters to forward the highlighter's
 * own theme colors to codegloss's chrome.
 */
export function parsePreChrome(html: string): {
	background?: string;
	color?: string;
} {
	const styleMatch = /<pre\b[^>]*\sstyle="([^"]*)"/i.exec(html);
	if (!styleMatch) return {};

	const declarations = styleMatch[1]!.split(';');
	let background: string | undefined;
	let color: string | undefined;

	for (const declaration of declarations) {
		const colonIdx = declaration.indexOf(':');
		if (colonIdx === -1) continue;
		const property = declaration.slice(0, colonIdx).trim().toLowerCase();
		const value = declaration.slice(colonIdx + 1).trim();
		if (property === 'background-color' || property === 'background') {
			background = value;
		} else if (property === 'color') {
			color = value;
		}
	}

	return { background, color };
}
