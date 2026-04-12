import type { CodeGlossConfig } from './code-gloss.types';

/**
 * Reads a `<script type="application/json">` child of the given host and
 * parses it as a CodeGlossConfig. Returns `undefined` when the script is
 * missing, empty, or contains invalid JSON.
 */
export function readConfigFromHost(host: Element): CodeGlossConfig | undefined {
	const scriptElement = host.querySelector('script[type="application/json"]');

	if (!scriptElement?.textContent) return undefined;

	try {
		return JSON.parse(scriptElement.textContent) as CodeGlossConfig;
	} catch {
		console.error('[code-gloss] failed to parse JSON config');
		return undefined;
	}
}
