// Verifies the Velite-compiled MDX produced a CodeGloss reference and the
// codegloss runtime made it into the Next build.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry === 'cache') continue;
    const path = join(dir, entry);
    const st = await stat(path);
    if (st.isDirectory()) {
      yield* walk(path);
    } else {
      yield path;
    }
  }
}

const veliteOut = resolve(here, '.velite');
const nextOut = resolve(here, '.next');

let veliteText = '';
for await (const file of walk(veliteOut)) {
  if (file.endsWith('.json') || file.endsWith('.js')) {
    veliteText += await readFile(file, 'utf8');
    veliteText += '\n';
  }
}

let htmlText = '';
let chunkText = '';
for await (const file of walk(nextOut)) {
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
    label: 'velite output references the CodeGloss component name',
    pass: veliteText.includes('CodeGloss'),
  },
  {
    label: 'velite output captured the annotation title',
    pass: veliteText.includes('Recursion'),
  },
  {
    label: 'next HTML build contains <code-gloss>',
    pass: htmlText.includes('<code-gloss>'),
  },
  {
    label: 'next JS chunk registers the custom element',
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
console.log('velite: all checks passed');
