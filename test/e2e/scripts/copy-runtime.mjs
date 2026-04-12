// Copies packages/codegloss/dist into test/e2e/fixtures/codegloss/ so the
// static fixture pages can load the local runtime via a relative `<script
// type="module" src="/codegloss/index.js">`.
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '..', '..', '..', 'packages', 'codegloss', 'dist');
const dst = resolve(here, '..', 'fixtures', 'codegloss');

await rm(dst, { recursive: true, force: true });
await mkdir(dst, { recursive: true });
await cp(src, dst, { recursive: true });

console.log(`copied codegloss runtime → ${dst}`);
