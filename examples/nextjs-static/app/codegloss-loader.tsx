'use client';

// Side-effect import: registers the <code-gloss> custom element on the client.
// Without this, the static export would render <code-gloss> in the HTML but
// never load the runtime that upgrades it into an interactive widget.
import 'codegloss';

export function CodeglossLoader() {
	return null;
}
