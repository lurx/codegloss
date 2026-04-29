// Asserts the Astro static build contains <code-gloss> + the runtime asset.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, 'dist');

async function* walk(dir) {
	let entries;
	try {
		entries = await readdir(dir);
	} catch {
		return;
	}
	for (const entry of entries) {
		const path = join(dir, entry);
		const st = await stat(path);
		if (st.isDirectory()) {
			yield* walk(path);
		} else {
			yield path;
		}
	}
}

let htmlText = '';
let runtimeText = '';
for await (const file of walk(dist)) {
	if (file.endsWith('.html')) {
		htmlText += await readFile(file, 'utf8');
		htmlText += '\n';
	} else if (file.endsWith('codegloss.js') || /\/chunk-[^/]+\.js$/.test(file)) {
		// codegloss ships split chunks — the registration lives in a sibling.
		runtimeText += await readFile(file, 'utf8');
		runtimeText += '\n';
	}
}

const checks = [
	{
		label: 'static HTML contains <code-gloss>',
		pass: htmlText.includes('<code-gloss>'),
	},
	{
		label: 'static HTML references the JSON config script',
		pass: htmlText.includes('application/json'),
	},
	{
		label: 'codegloss.js was copied into the static output',
		pass: runtimeText.length > 0,
	},
	{
		label: 'codegloss runtime registers the custom element',
		pass: runtimeText.includes('customElements.define'),
	},
];

let failed = false;
for (const { label, pass } of checks) {
	console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}`);
	if (!pass) failed = true;
}

if (failed) {
	process.exit(1);
}
console.log('astro-starlight: all checks passed');
