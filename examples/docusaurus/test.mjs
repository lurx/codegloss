// Greps the Docusaurus build/ directory for evidence the codegloss runtime
// made it through MDX → React → static HTML.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const buildDir = resolve(here, 'build');

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
for await (const file of walk(buildDir)) {
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
		label: 'an HTML file in build/ contains <code-gloss>',
		pass: htmlText.includes('<code-gloss>'),
	},
	{
		label: 'an HTML file contains the JSON config script',
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
console.log('docusaurus: all checks passed');
