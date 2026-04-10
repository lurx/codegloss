// Greps the static export `out/` for evidence the codegloss runtime survived.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// Walk the static export `out/` directory. Everything here is what actually
// reaches the browser at runtime — there is no server fallback for a static
// export, so this is the strictest possible "did the runtime survive?" check.
const out = resolve(here, 'out');

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
for await (const file of walk(out)) {
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
    label: 'static HTML output contains <code-gloss>',
    pass: htmlText.includes('<code-gloss>'),
  },
  {
    label: 'static HTML contains the JSON config script',
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
console.log('nextjs-static: all checks passed');
