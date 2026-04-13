// Trivial "build": copy index.html into dist/ and re-export the codegloss
// runtime so the static page can load it via a relative `<script type="module">`.
// Real consumers would use a CDN URL or their own bundler.
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// 1. Copy the static HTML page.
await copyFile(resolve(here, 'index.html'), resolve(dist, 'index.html'));

// 2. Copy the codegloss ESM bundle so the relative import resolves.
const codeglossEntry = fileURLToPath(import.meta.resolve('codegloss'));
await copyFile(codeglossEntry, resolve(dist, 'codegloss.js'));

// 3. Copy the chunked sibling files (codegloss splits its CSS chunk).
const { readdir } = await import('node:fs/promises');
const distSrc = dirname(codeglossEntry);
for (const entry of await readdir(distSrc)) {
  if (entry.startsWith('chunk-') && entry.endsWith('.js')) {
    await copyFile(resolve(distSrc, entry), resolve(dist, entry));
  }
}

await writeFile(
  resolve(dist, 'BUILD_INFO.txt'),
  `built at ${new Date().toISOString()}\n`,
);

console.log(`vanilla-html built → ${dist}`);
