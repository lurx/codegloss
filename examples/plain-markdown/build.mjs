import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import rehypeStringify from 'rehype-stringify';
import remarkCodegloss from 'remark-codegloss';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const here = dirname(fileURLToPath(import.meta.url));
const input = await readFile(resolve(here, 'input.md'), 'utf8');

const file = await unified()
  .use(remarkParse)
  .use(remarkCodegloss, { output: 'html' })
  // allowDangerousHtml so the raw <code-gloss> nodes survive remark→rehype.
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })
  .process(input);

const dist = resolve(here, 'dist');
await mkdir(dist, { recursive: true });
await writeFile(
  resolve(dist, 'index.html'),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>codegloss · plain markdown demo</title>
  <script type="module" src="https://cdn.jsdelivr.net/npm/codegloss/dist/index.js"></script>
</head>
<body>
${String(file)}
</body>
</html>
`,
);

console.log(`plain-markdown built → ${resolve(dist, 'index.html')}`);
