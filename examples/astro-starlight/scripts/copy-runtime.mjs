// Copies the codegloss ESM runtime + its CSS chunk into public/ so Astro
// publishes them as static assets the head <script> can load.
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '..', 'public');

await mkdir(publicDir, { recursive: true });

const runtimeEntry = fileURLToPath(import.meta.resolve('codegloss'));
await copyFile(runtimeEntry, resolve(publicDir, 'codegloss.js'));

// codegloss splits a CSS chunk that the runtime imports relative to itself.
const distSrc = dirname(runtimeEntry);
for (const entry of await readdir(distSrc)) {
  if (entry.startsWith('chunk-') && entry.endsWith('.js')) {
    await copyFile(resolve(distSrc, entry), resolve(publicDir, entry));
  }
}

console.log(`copied codegloss runtime → ${publicDir}`);
