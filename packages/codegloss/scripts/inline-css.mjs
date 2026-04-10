#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(__dirname, '../src/core/code-gloss.css');
const outPath = path.resolve(
	__dirname,
	'../src/core/code-gloss-styles.generated.ts',
);

const css = await readFile(cssPath, 'utf8');
const out = `// AUTO-GENERATED from code-gloss.css — do not edit by hand.
// Run \`pnpm --filter codegloss prebuild\` to regenerate.

export const codeGlossStyles = ${JSON.stringify(css)};
`;

await writeFile(outPath, out, 'utf8');
console.log(`[inline-css] wrote ${outPath} (${css.length} chars)`);
