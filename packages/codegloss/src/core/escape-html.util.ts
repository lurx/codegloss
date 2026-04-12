const HTML_ENTITIES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

const HTML_ESCAPE_PATTERN = /[&<>"']/g;

export function escapeHtml(text: string): string {
	return text.replace(HTML_ESCAPE_PATTERN, char => HTML_ENTITIES[char]);
}
