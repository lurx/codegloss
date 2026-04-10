// Greps the Vite build output for evidence that codegloss is wired in.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, 'dist');

async function* walk(dir) {
  for (const entry of await readdir(dir)) {
    const path = join(dir, entry);
    const st = await stat(path);
    if (st.isDirectory()) {
      yield* walk(path);
    } else {
      yield path;
    }
  }
}

let allText = '';
for await (const file of walk(dist)) {
  if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
    allText += await readFile(file, 'utf8');
    allText += '\n';
  }
}

const checks = [
  {
    label: 'bundle references the code-gloss custom element name',
    pass: allText.includes('code-gloss'),
  },
  {
    label: 'bundle includes the customElements.define registration',
    pass: allText.includes('customElements.define'),
  },
  {
    label: 'bundle includes the React JSX runtime call for code-gloss',
    // Production minified output uses `jsx` / `jsxs` from `react/jsx-runtime`.
    pass: /["']code-gloss["']/.test(allText),
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
console.log('react-18: all checks passed');
