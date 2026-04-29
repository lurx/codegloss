'use client';

// Side-effect import: registers the <code-gloss> custom element on the client.
// The React wrapper has zero hooks, so without this loader the server-rendered
// HTML would contain <code-gloss> elements that never upgrade in the browser.
import 'codegloss';

export function CodeglossLoader() {
	return null;
}
