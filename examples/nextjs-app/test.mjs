// Greps the .next build output for evidence that the MDX → CodeGloss → custom
// element pipeline survived the production build.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// Only walk client-side artifacts. We want to catch the case where the
// codegloss runtime is tree-shaken out of the client bundle and only survives
// in server-side chunks (which never reach the browser).
const clientChunks = resolve(here, '.next', 'static', 'chunks');
const serverHtml = resolve(here, '.next', 'server', 'app');

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

let chunkText = '';
for await (const file of walk(clientChunks)) {
	if (file.endsWith('.js')) {
		chunkText += await readFile(file, 'utf8');
		chunkText += '\n';
	}
}

let htmlText = '';
for await (const file of walk(serverHtml)) {
	if (file.endsWith('.html')) {
		htmlText += await readFile(file, 'utf8');
		htmlText += '\n';
	}
}

const checks = [
	{
		label: 'a server-rendered HTML file contains <code-gloss>',
		pass: htmlText.includes('<code-gloss>'),
	},
	{
		label: 'an HTML file contains the JSON config script',
		pass: htmlText.includes('application/json'),
	},
	{
		label: 'a JS chunk references the customElements registration',
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
console.log('nextjs-app: all checks passed');
