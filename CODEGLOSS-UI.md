# Codegloss UI — Annotation & Arc Builder

A visual editor that lets users compose a `CodeGloss` config (code, annotations, connections, arcs, theming) without hand-writing JSON, then export the result as MDX, JSX props, or a JSON script tag.

---

## Goals

- **Eliminate hand-authored JSON** for the common case. Users paste code, click tokens to annotate, drag between annotations to connect.
- **Live preview**: the right pane is a real `<CodeGloss>` rendered from the same state the form edits — no divergence between "what you're building" and "what ships."
- **Round-trip**: paste an existing config in and continue editing it.
- **Export to all three authoring paths**: MDX fenced-block pair, React JSX, vanilla `<script type="application/json">`.

Non-goals (v1): collaborative editing, saving to a backend, multi-block documents, syntax-aware token suggestion beyond simple text search.

---

## Where it lives

New route in the docs site: `/apps/site/app/editor/page.tsx` (thin entry) → `editor-page.component.tsx`. Linked from the landing nav as "Editor" or "Try it".

Standalone route, not an embedded demo — it needs full viewport width for the split pane.

```text
apps/site/app/editor/
├── page.tsx
├── editor-page.component.tsx
├── editor-page.types.ts
├── editor-page.module.scss
├── components/
│   ├── code-pane/                  # left: code input + click-to-annotate overlay
│   ├── preview-pane/               # right: live <CodeGloss> render
│   ├── annotations-panel/          # list + form for Annotation entries
│   ├── connections-panel/          # list + form for Connection entries
│   ├── settings-panel/             # theme, arcs config, runnable, filename, lang
│   └── export-dialog/              # generates MDX / JSX / JSON
├── hooks/
│   ├── use-editor-state.hook.ts    # single source of truth: CodeGlossConfig + ui state
│   └── use-token-picker.hook.ts    # click-on-code → (line, occurrence, token)
└── helpers/
    ├── export-mdx.helpers.ts
    ├── export-jsx.helpers.ts
    ├── export-json.helpers.ts
    └── import-config.helpers.ts    # parse pasted MDX/JSON/JSX back into state
```

---

## Core UX flow

### 1. Paste code

Left pane is a textarea (or lightweight code input) for `code` + fields for `lang`, `filename`, `runnable`. Below it, a rendered-with-shiki preview of the same code with **click-to-select** tokens.

### 2. Create an annotation

- User clicks a token in the highlighted preview.
- A floating form appears prefilled with `{ line, occurrence, token }`. User fills `title` + `text`, toggles `popover` / `defaultOpen`.
- `id` field is editable — user may type their own id, otherwise it auto-generates as `a1`, `a2`, … Auto-generated ids stay stable once assigned (no renumbering on delete).
- Save → appended to `annotations[]`.

This eliminates the most error-prone parts of authoring: getting `line` / `occurrence` right.

### 3. Create a connection

Two paths:

- **Drag mode**: drag from annotation A's marker to annotation B's marker in the preview.
- **Form mode**: pick `from` / `to` from dropdowns of existing annotation ids.

Then set `color` (color picker), `side`, optional `title` / `text`, `defaultOpen`.

### 4. Tune theme & arcs

Settings panel: theme picker (reuse the existing `ThemeShowcase` options), arc dot radius / stroke width / opacity / dash / arrowhead, global `callouts.popover` default.

### 5. Export

Export dialog with three tabs (MDX / JSX / JSON). Copy button on each. MDX output matches the remark plugin's expected shape so round-tripping works.

### 6. Import (round-trip)

"Import" button opens a paste box. Helper auto-detects MDX fenced-block pair vs raw JSON vs JSX prop object and hydrates state.

---

## State model

Single `useEditorState` hook owning:

```ts
type EditorState = {
  config: CodeGlossConfig;        // the exportable payload
  selection: {                    // transient UI state, not exported
    annotationId?: string;
    draftAnnotation?: Partial<Annotation>;
    draftConnection?: Partial<Connection>;
    mode: 'idle' | 'picking-token' | 'drawing-arc';
  };
};
```

Every panel reads/writes through action callbacks (`addAnnotationAction`, `updateConnectionAction`, …) — matches the `Action`-suffix convention.

Persistence: mirror `config` to `localStorage` under `codegloss:editor:draft` so a refresh doesn't lose work. No backend.

---

## Key implementation notes

- **Token picker**: render the code through the same Shiki pipeline codegloss uses, wrap each token span with a `data-line` / `data-occurrence` attribute during render, attach a single delegated click handler. Don't reimplement highlighting — reuse what the core lib does so clicks map to the exact coordinates the runtime will compute.
- **Live preview** must re-mount or key off a stable hash of `config` so Web Component internals (arc measurements, callout positions) recompute cleanly on edits.
- **Arc drawing UX**: on drag start, capture source marker center; on drag over a valid target marker, highlight it; on drop, open the connection form prefilled.
- **Id handling**: on annotation create, seed the id field with the next available `a{N}` but leave it editable. On save, validate uniqueness; reject duplicates inline. When an id is renamed later, cascade the change into any `Connection.from` / `Connection.to` that reference it.
- **Validation**: surface inline errors for duplicate annotation ids, connections referencing missing ids, `occurrence` values that don't match any token on the given line.
- **No new deps**: color picker can be `<input type="color">`; drag uses native pointer events. Textarea is fine for v1.

---

## Phased delivery

### Phase 1 — Editable preview (MVP)

- Route scaffold, split-pane layout, paste-code textarea, live `<CodeGloss>` preview bound to local state.
- Annotations panel with a plain form (manual `line` / `occurrence` entry, editable id with auto-generated default).
- Connections panel with dropdowns.
- JSON export only.

### Phase 2 — Click-to-annotate

- Token picker on the highlighted preview. Auto-fill `line` + `occurrence`.
- Inline validation for bad references and duplicate ids.

### Phase 3 — Drag-to-connect + full export

- Drag between annotation markers to create connections.
- MDX and JSX exporters.
- Import / round-trip.

### Phase 4 — Polish

- Theme picker, arcs settings panel, `localStorage` persistence, keyboard shortcuts (delete annotation, duplicate, undo/redo via state history).

---

## Decisions & open questions

- **Route location**: inline route under `/apps/site/app/editor/` — reuses the site's Shiki/theme setup. Split into a separate app only if it grows. *(decided)*
- **Shareable URLs** (`?config=<base64>`): deferred to a later phase. *(decided)*
- **Undo/redo in v1?** A bounded history stack (20 steps) on `config` changes is cheap — tentatively Phase 4.
