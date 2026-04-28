# @codegloss/shiki

Shiki integration for [`codegloss`](https://npmjs.com/package/codegloss). Two
pieces in one package:

- `createShikiHighlighter` — an adapter that turns a Shiki highlighter into
  the `highlight` function `<code-gloss>` expects.
- `rehypeCodeglossPre` — a rehype plugin that rewrites every `<pre><code>`
  block (typically emitted by `@shikijs/rehype`) into a `<code-gloss>` element
  so non-annotated code blocks still get the same chrome and theme as
  annotated ones.

```bash
npm install @codegloss/shiki codegloss shiki
```

`codegloss` and `shiki` are peer dependencies.

## Usage

One Shiki instance shared by every render path — the remark plugin at build
time, SSR, and the runtime `initCodegloss(config)` call:

```ts
// codegloss.config.ts
import { defineConfig } from 'codegloss/config';
import { createShikiHighlighter } from '@codegloss/shiki';
import { createHighlighter } from 'shiki';

const shiki = await createHighlighter({
	themes: ['github-dark'],
	langs: ['js', 'ts', 'tsx'],
});

export default defineConfig({
	theme: 'github-dark',
	highlight: createShikiHighlighter(shiki, { theme: 'github-dark' }),
});
```

Drop `rehypeCodeglossPre` after `@shikijs/rehype` (or any rehype pipeline
that emits `<pre><code>`) if you want unannotated fences to render as
`<code-gloss>` too:

```ts
import rehypeShiki from '@shikijs/rehype';
import { rehypeCodeglossPre } from '@codegloss/shiki';

unified().use(rehypeShiki, { theme: 'github-dark' }).use(rehypeCodeglossPre);
```

## Documentation

Full highlighter guide at
<https://lurx.github.io/codegloss/docs/highlighters/>.

## License

[MIT](./LICENSE)
