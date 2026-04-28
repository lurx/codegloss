// Asserts the VitePress build emits <code-gloss> in the static HTML and
// the codegloss runtime registration in a client chunk.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, 'docs', '.vitepress', 'dist');

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
let chunkText = '';
for await (const file of walk(dist)) {
	if (file.endsWith('.html')) {
		htmlText += await readFile(file, 'utf8');
		htmlText += '\n';
	} else if (file.endsWith('.js')) {
		chunkText += await readFile(file, 'utf8');
		chunkText += '\n';
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
		label: 'a JS chunk registers the custom element',
		pass: chunkText.includes('customElements.define'),
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
console.log('vitepress: all checks passed');
