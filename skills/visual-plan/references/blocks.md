# Block catalog — the authoritative local vocabulary

This is the complete set of components the renderer understands. Author plans
from this catalog; do not invent tags. Every block below maps to a component in
`renderer/src/components/`. A complete worked plan using all of them lives in
`plans/example/`.

## Authoring rules

- Plans are **MDX**: Markdown plus these capitalized JSX components. Frontmatter
  at the top (`title`, `status`, optional `owner`, `summary`) is YAML.
- **Code is whitespace-sensitive.** Pass multiline code as a JSX string
  attribute using a template literal with no `${…}` interpolation:
  `code={`const x =\n  y`}`. Object props (`items`, `entities`, `questions`,
  `spec`, `data`, `annotations`) are JSX expressions: `entities={[…]}`.
- Native Markdown works everywhere: headings, **bold**, `inline code`, lists,
  GFM tables, blockquotes, `---`, and fenced code blocks (auto-highlighted).
- Prose inside a component's children must be separated by blank lines to render
  as Markdown.

---

## Document blocks

### `Callout`
A boxed aside. `tone`: `note` | `info` | `decision` | `warn` | `ok`. Optional `title`.

```mdx
<Callout tone="decision" title="Committed approach">
Runner is a plain orchestrator, not a framework.
</Callout>
```

### `Columns` / `Column`
Side-by-side comparison; stacks on narrow screens. Each `Column` takes a `label`.

```mdx
<Columns>
  <Column label="Current">Ports exist in isolation.</Column>
  <Column label="Target">One runner sequences them.</Column>
</Columns>
```

### `Tabs` / `Tab`
Tabbed content. `Tabs` `orientation`: `horizontal` (default) | `vertical`. Each
`Tab` takes a `label`. Only the active tab is mounted.

```mdx
<Tabs>
  <Tab label="OpenAPI"><OpenApiSpec spec={{ … }} /></Tab>
  <Tab label="Payload"><JsonExplorer data={{ … }} /></Tab>
</Tabs>
```

### `Checklist`
`items`: array of `{ id, label, done? }`.

```mdx
<Checklist items={[{ id: 'a', label: 'Add upsert', done: true }, { id: 'b', label: 'Wire runner' }]} />
```

### `Code`
Framed, syntax-highlighted block. Props: `code` (string), `lang?`, `title?`.
(Plain triple-backtick fences also render highlighted — use those for quick
snippets, `Code` when you want a title.)

```mdx
<Code lang="kotlin" title="module wiring" code={`single { EnrichmentRunner(get(), get(), get()) }`} />
```

### `Diff`
Unified-diff rendering. `code` lines prefixed `+` (added), `-` (removed), or
space (context). Props: `code`, `lang?`, `title?`.

```mdx
<Diff lang="kotlin" title="ProfileRepository.kt" code={` interface ProfileRepository {
-    fun save(p: AccountProfile)
+    fun upsert(p: AccountProfile): AccountProfile
 }`} />
```

### `AnnotatedCode`
Code with margin notes anchored to line ranges. Props: `code`, `lang?`, `file?`,
`annotations`: array of `{ lines: "12" | "12-18", label?, note }`. Keep a few
high-signal notes — highlight what changes and why, not every line.

```mdx
<AnnotatedCode file="EnrichmentRunner.kt" lang="kotlin"
  code={`class EnrichmentRunner(…) {\n  suspend fun run(id: String) = …\n}`}
  annotations={[{ lines: '1-3', label: 'Injected ports', note: 'Reuses existing interfaces.' }]} />
```

### `Diagram`
Two-dimensional architecture / data-flow / state diagrams. Two authoring modes:

- **Mermaid**: `mermaid={`flowchart LR; A --> B`}` — quickest for flows/graphs.
- **Custom HTML/CSS**: `html={…}` (+ optional `css={…}`) using the renderer's
  primitives so it themes correctly: `.diagram-panel`, `.diagram-card`,
  `.diagram-node`, `.diagram-box`, `.diagram-pill`, `.diagram-muted`. Reference
  `--wf-*` tokens for any color; never hard-code hex or `font-family`.

`frame`: `auto` (default, no outer frame) | `show` (drawn frame) | `hide`.
Prefer paired before/after panels, layers, matrices, or grouped regions over a
plain left-to-right chain. Do not use a `Diagram` for a product screen — that's
a `Screen` wireframe on the canvas.

```mdx
<Diagram mermaid={`flowchart LR
  A[accountId] --> R[research] --> X[extract] --> P[(profile)]`} />
```

### `DataModel`
Entity/schema map. `entities`: `[{ name, fields: [{ name, type, note? }] }]`.
`relations?`: `[{ from, to, label? }]`.

```mdx
<DataModel entities={[{ name: 'Signal', fields: [{ name: 'score', type: 'Double' }] }]}
  relations={[{ from: 'Profile', to: 'Signal', label: '1..*' }]} />
```

### `FileTree`
The file map. `paths`: array of strings, or `{ path, note?, status? }` where
`status` is `new` | `changed` | `removed`. Highlight only files worth reading.

```mdx
<FileTree paths={[
  { path: 'platform/enrichment/EnrichmentRunner.kt', status: 'new', note: 'the orchestrator' },
  { path: 'platform/enrichment/ProfileRepository.kt', status: 'changed' },
]} />
```

### `ApiEndpoint`
One endpoint. Props: `method`, `path`, `summary?`, `request?`, `response?`
(objects are pretty-printed as JSON; strings shown verbatim).

```mdx
<ApiEndpoint method="POST" path="/v1/accounts/{id}/enrich"
  summary="Run enrichment, return the profile."
  request={{ force: false }} response={{ signals: 4 }} />
```

### `OpenApiSpec`
Compact operation list from an OpenAPI object. Prop: `spec` (with `info` + `paths`).

### `JsonExplorer`
Collapsible JSON tree. Prop: `data` (any JSON value).

### `QuestionForm`
The single bottom "Open Questions" section — the ONLY place open questions are
enumerated. Props: `title?` (default "Open Questions"), `questions`: array of
`{ id, title, mode, options?, allowOther? }`.
- `mode`: `single` (radio) | `multi` (checkbox) | `freeform` (text).
- `options`: `[{ id, label, detail?, recommended? }]`. Mark the default you'd
  pick with `recommended: true`.
- A write-in field always renders unless `allowOther: false`.

```mdx
<QuestionForm questions={[{
  id: 'sync', title: 'Sync endpoint or background job?', mode: 'single',
  options: [
    { id: 'sync', label: 'Synchronous', detail: 'Simplest at POC scale.', recommended: true },
    { id: 'job', label: 'Background job', detail: 'Only if latency > 30s.' },
  ],
}]} />
```

### `CustomHtml`
Bounded escape hatch for a single fragment the native blocks can't express.
Prop: `html` (string). Author against theme tokens (`--wf-paper`, `--wf-card`,
`--wf-ink`, `--wf-muted`, `--wf-line`, `--wf-radius`); never hard-code a light
palette. Prefer native blocks; use `Diagram` HTML for rich diagrams, not this.

---

## Wireframe + canvas blocks

For UI/product plans only. See `references/wireframe.md` (HTML quality bar) and
`references/canvas.md` (placement) before authoring. Put these in a sibling
`canvas.mdx` (rendered as the top visual surface) — or inline for a single
document-body screen.

### `Screen`
An HTML wireframe. Props: `surface` (`browser` | `desktop` | `mobile` |
`popover` | `panel`), `html` (a semantic fragment), `url?` (browser chrome),
`label?`, `skeleton?`, `frame?`. The renderer owns the footprint, chrome, theme,
and icons; you write real product content with `.wf-*` helper classes
(`.wf-card`, `.wf-box`, `.wf-pill`/`.wf-chip`, `.wf-muted`, `button.primary`),
`--wf-*` color tokens (never hex), and `data-icon="mail"` markers for icons.
Never write `<html>`/`<style>`/`font-family` or fixed pixel width/height.

Icon names for `data-icon`: `mail`, `lock`, `search`, `plus`, `x`, `check`,
`chevronDown/Up/Left/Right`, `dots`, `user`, `settings`, `calendar`, `bell`,
`send`, `edit`, `arrowLeft`, `arrowRight` (plus aliases `email`, `password`,
`add`, `close`, `more`).

### `DesignBoard`
The canvas container. `title?`. Holds `Artboard`, `Section`, and `Connector`.

### `Section`
Optional titled grouping of artboards within a board.

### `Artboard`
One frame on the board. Props: `id` (referenced by connectors), `label?`.
Contains one `Screen` and optional `Annotation`s.

### `Annotation`
A plain-text designer note beside a frame. Props: `head?`, `placement`
(`top` | `right` | `bottom` | `left`). Never a bordered card around a frame.

### `Connector`
An arrow between two artboards for a real sequence only. Props: `from`, `to`
(artboard ids), `label?`.

```mdx
<DesignBoard title="Enrichment — operator surface">
  <Artboard id="list" label="Accounts">
    <Screen surface="browser" url="app/accounts" html={`…`} />
    <Annotation head="Entry point" placement="right">Operator triggers a run here.</Annotation>
  </Artboard>
  <Artboard id="detail" label="Profile">
    <Screen surface="browser" url="app/accounts/acme" html={`…`} />
  </Artboard>
  <Connector from="list" to="detail" label="run → open" />
</DesignBoard>
```
