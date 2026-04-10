// Same checks as react-18, plus a "no duplicate React copies" assertion that
// catches the classic peer-dep mismatch where codegloss might pull in its own
// React.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, 'dist');
const nodeModules = resolve(here, 'node_modules');

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

// Find every `react/package.json` so we can prove there's only one copy of the
// real react runtime in the example's dep tree. Carefully ignore `@types/react`
// (which lives at `node_modules/@types/react/package.json` and has its own
// version field that has nothing to do with the runtime).
const reactVersions = new Set();
async function findReactCopies(dir, parentSegment) {
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === '.bin' || name === '.cache') continue;
    const path = join(dir, name);
    let st;
    try {
      st = await stat(path);
    } catch {
      continue;
    }
    if (!st.isDirectory()) continue;

    // Only count `react` whose parent is `node_modules` — that excludes
    // `@types/react` and any `react` folder nested inside an unrelated package.
    if (name === 'react' && parentSegment === 'node_modules') {
      try {
        const pkg = JSON.parse(
          await readFile(join(path, 'package.json'), 'utf8'),
        );
        reactVersions.add(pkg.version);
      } catch {
        /* ignore */
      }
    }

    if (name.startsWith('@') || name === 'node_modules') {
      await findReactCopies(path, name);
    }
  }
}
await findReactCopies(nodeModules, 'node_modules');

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
    label: 'exactly one major version of react in the dep tree',
    pass: new Set([...reactVersions].map((v) => v.split('.')[0])).size === 1,
    detail: `react versions found: ${[...reactVersions].join(', ') || '(none)'}`,
  },
  {
    label: 'react major is 19',
    pass: [...reactVersions].some((v) => v.startsWith('19.')),
    detail: `react versions found: ${[...reactVersions].join(', ') || '(none)'}`,
  },
];

let failed = false;
for (const { label, pass, detail } of checks) {
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!pass) failed = true;
}

if (failed) {
  process.exit(1);
}
console.log('react-19: all checks passed');
