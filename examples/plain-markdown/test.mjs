import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = await readFile(resolve(here, 'dist', 'index.html'), 'utf8');

const checks = [
	{
		label: 'output contains <code-gloss>',
		pass: html.includes('<code-gloss>'),
	},
	{
		label: 'output contains the JSON config script',
		pass: html.includes('<script type="application/json">'),
	},
	{
		label: 'output contains the annotation token text',
		pass: html.includes('"Recursion"'),
	},
	{
		label: 'output preserved the original markdown heading',
		pass: html.includes('<h1>Plain markdown demo</h1>'),
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
console.log('plain-markdown: all checks passed');
