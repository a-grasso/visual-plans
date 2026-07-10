# Canvas & artboard mechanics — the bar

How the canvas works in this renderer: artboard layout, annotations, and
connectors. Read it before authoring a `canvas.mdx`. The concepts are adapted
from BuilderIO/skills (MIT); the mechanics match this renderer, which lays
artboards out in flowing lanes and draws connectors by measuring real positions
(no manual coordinates).

**Structure.** A `canvas.mdx` default-exports one `<DesignBoard>` containing
`<Artboard>`s (optionally grouped in `<Section>`s) and `<Connector>`s. The board
renders above the plan document as the top visual surface.

```mdx
---
kind: canvas
---
<DesignBoard title="…">
  <Artboard id="list" label="Accounts"> <Screen surface="browser" html={`…`} /> </Artboard>
  <Artboard id="detail" label="Profile"> <Screen surface="browser" html={`…`} /> </Artboard>
  <Connector from="list" to="detail" label="run → open" />
</DesignBoard>
```

**Placement is automatic.** Artboards flow in wrapping lanes; you don't set
width/height or x/y coordinates (the `surface` locks each frame's footprint — see
`wireframe.md`). Order artboards in reading order: main flow first, then compact
surfaces (popover/panel), then loading/error states.

**Every artboard carries a real wireframe.** Each `<Artboard>` must contain one
`<Screen>` with real `html`. Never place a titled artboard with no interior
wireframe — a label-only frame renders empty. If you only have a title, use a
`<Section title>` or an `<Annotation>`, not an empty artboard.

**One artboard per user-visible state.** Model the default view, an overflow
menu/popover, a side panel, a loading state, and an error state as separate
artboards — not as one crowded frame. Reuse the same real labels and statuses
across related artboards.

**Annotations are designer notes beside a frame.** Put an `<Annotation>` inside
the `<Artboard>` it explains, with `placement` (`right` default, or `left`/`top`/
`bottom`) and an optional `head`. They are plain text — never a bordered card
around a frame, never architecture prose baked into the screen itself. Keep them
short: what the user sees, or the delta being reviewed.

```mdx
<Artboard id="detail" label="Profile">
  <Screen surface="browser" html={`…`} />
  <Annotation head="Result view" placement="right">
    Profile rendered read-only; signals ranked by score.
  </Annotation>
</Artboard>
```

**Connectors are for real sequences only.** A `<Connector from="a" to="b"
label="…">` draws a measured arrow between two artboards by their `id`. Use one
only for a genuine transition (a click leads from A to B). Never draw "Step 1 →
Step 2" lines between independent states, and never connect non-adjacent frames.
Keep labels short; they sit on the arrow midpoint.

**Keep product screens pure; put mechanics in the document.** The canvas holds
static UI/product mockups. Architecture, dependency, and data-flow diagrams stay
inline in the document body as `Diagram` blocks (see `document-quality.md`), not
on the canvas. For an abstract concept, make the first artboard one real app
state that shows how the concept appears to a user — inspectable as product UI on
its own — and explain mechanics separately.

**Editing.** Plans are plain MDX: to change a wireframe, edit its `html` in the
`.mdx` file; the dev server hot-reloads. There is no separate patch step.
