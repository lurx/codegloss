// Asserts the built static page actually contains a <code-gloss> element AND
// that the codegloss runtime that lives next to it registers the custom element.
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, 'dist');

const html = await readFile(resolve(dist, 'index.html'), 'utf8');
// Read the entry plus any shared chunks it imports — the runtime splits
// its element registration into a sibling chunk.
const runtimeFiles = (await readdir(dist)).filter(
  (entry) => entry === 'codegloss.js' || (entry.startsWith('chunk-') && entry.endsWith('.js')),
);
let runtime = '';
for (const file of runtimeFiles) {
  runtime += await readFile(resolve(dist, file), 'utf8');
  runtime += '\n';
}

const checks = [
  {
    label: 'static HTML contains <code-gloss>',
    pass: html.includes('<code-gloss>'),
  },
  {
    label: 'static HTML contains the JSON config script',
    pass: html.includes('<script type="application/json">'),
  },
  {
    label: 'runtime registers the custom element',
    pass: runtime.includes('customElements.define'),
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
console.log('vanilla-html: all checks passed');
