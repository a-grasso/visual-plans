# HTML wireframe quality — the bar

The quality bar for `<Screen>` HTML wireframes (document-body or canvas). Read it
in full before authoring any wireframe. Adapted from BuilderIO/skills (MIT).

**A wireframe is an HTML mockup. The renderer owns the look; you write the
content.** Set `html` to a self-contained, semantic HTML fragment and set
`surface`. The renderer owns the surface footprint, the dark/light theme, and the
icons — you never write `<html>`/`<body>`/`<style>`/`<script>` tags or any
width/height/coordinates. You write real HTML layout and real product content.

**Write PLAIN semantic HTML and let the renderer style it.** Bare elements
(`h1`/`h2`/`h3`, `p`, `button`, `input`, `<input type="checkbox">`, `a`, `hr`,
`small`) are auto-themed — no classes needed. Helper classes carry the rest:

- `.wf-card` / `.wf-box` — a bordered, padded container (a panel, a list item).
- `.wf-pill` / `.wf-chip` — a rounded tag or filter; add `.accent` for the
  accent-filled variant (`<span class="wf-pill accent">`).
- `.wf-muted` — secondary/muted text (or use `<small>`).
- `button.primary` or any element with `[data-primary]` — the accent-filled
  primary button.

**Use renderer icons, not visible icon words.** For icon-only buttons or leading
icons, write an empty marker: `<span data-icon="mail"></span>` or
`<i data-icon="lock"></i>`. The renderer replaces it with an SVG sized to the
text. Names: `mail`/`email`, `lock`/`password`, `search`, `plus`/`add`,
`x`/`close`, `check`, `chevronDown`/`Up`/`Left`/`Right`, `dots`/`more`, `user`,
`settings`, `calendar`, `bell`, `send`, `edit`, `arrowLeft`, `arrowRight`. Never
put visible words like "email" or "search" where the product would show an icon.

**Use `--wf-*` tokens for any custom color, never hex.** The renderer flips these
on light/dark, so reading tokens is what keeps a mockup correct in both themes.
For any inline border/background/text color, reference a token:
`style="border:1.4px solid var(--wf-line)"`. Tokens: `--wf-ink` (text),
`--wf-muted` (secondary), `--wf-line` (borders), `--wf-paper` (page),
`--wf-card` (container), `--wf-accent` / `--wf-accent-fg` / `--wf-accent-soft`
(brand action), `--wf-warn`, `--wf-ok`, `--wf-radius`. Never hard-code a hex
color and never set `font-family`.

**Never use Tailwind/host theme classes** (`bg-white`, `text-zinc-950`,
`border-zinc-200`, `shadow-xl`, `bg-[#fff]`, …). They leak host CSS and can make
dark-mode frames unreadable. Use bare elements, `.wf-*` helpers, and `--wf-*`
tokens. Before finishing, scan every `class`/`style`: if a class sets background,
text, border, fill, gradient, or shadow color, rewrite it to tokens or remove it.

**No decorative shadows.** Don't put `box-shadow`, `drop-shadow`, or `shadow-*`
on a frame, root container, `.wf-card`/`.wf-box`, or artboard. Mockups read as
flat, bordered surfaces; use spacing, borders, and labels for separation.

**Use literal CSS lengths for spacing** (`padding:16px`, `gap:12px`,
`minmax(0,1fr)`) — the `--wf-*` tokens are for color, not layout.

**Lay out with inline `style` flex/grid.** You write the real layout; the
renderer never repositions anything. Reproduce the current screen, then show the
modification with real labels, counts, and dates — not lorem or gray bars.

**Surface presets — match the real footprint, never default to desktop+mobile.**
- `browser`: a web page needing a browser chrome frame (pass `url` for the bar).
- `desktop`: a full desktop app page or app shell.
- `mobile`: a phone screen, only when the work is genuinely mobile.
- `popover`: a small floating menu, dropdown, or inline popover.
- `panel`: a side panel, inspector, or sidebar widget.

A sidebar popover renders as a small surface, not a desktop page plus a phone
frame. Don't emit `desktop` + `mobile` variants unless responsive behavior
actually changes the layout.

**Model the actual component shell.** Reproduce the current screen's real layout
and footprint first, then change only the delta. Show real chrome: title/header
row, top-right actions, separators, fields, selected states, footer actions.
Popovers/menus/command palettes use `surface: "popover"`; dialogs/sheets/panels
use `panel`/`desktop`. Don't restack the page into a new layout.

**Keep product screens pure.** A product wireframe shows the app state a user
would see. Don't embed file contracts, architecture arrows, repo pills, or
implementation callouts inside the screen — put those in canvas annotations, a
separate `Diagram`, or the document body.

**Loading / skeleton states.** Set `skeleton` on the `<Screen>` and fill `html`
with neutral, textless placeholder geometry — `<div>`s with
`background:var(--wf-line)` and explicit heights/widths, no labels.

**Fill the frame; keep labels short.** Compose enough realistic HTML to fill the
surface top to bottom with even rhythm; never leave a large empty band. Let nav
stacks `flex:1` to fill; keep each label on one line (shorten copy rather than
letting it wrap). For single-line rows (toolbars, tabs, breadcrumbs, file names)
add `white-space:nowrap`.

**Persistent chrome bars span the full frame width.** Lay a top/bottom bar as one
flex row filling the frame (`display:flex;align-items:center;width:100%`) and push
trailing actions right with a spacer (`<div style="flex:1"></div>`). Pin bottom
bars: make the frame a flex column at `height:100%`, give the body `flex:1`, and
place the bar last (or `margin-top:auto`).

**Inner padding matters.** Wrap content in a root with real inner padding
(≥14–16px), `box-sizing:border-box`, `height:100%`, and `gap` between rows, so
the first row never sits flush against the edge.

**Before / after must be comparable.** Preserve the unchanged controls in both
states so the reviewer sees exactly what moved. Use a `Columns` block with column
`label`s `Before`/`After` (the renderer draws the label above each frame) — never
bake a Before/After pill into the wireframe `html`. Same frame size and density on
both sides unless the change itself alters them.

**Good example — a contacts list, surface `browser`:**

```html
<div style="display:flex;flex-direction:column;gap:12px;padding:16px;height:100%">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <h1>Contacts</h1>
    <button class="primary"><span data-icon="plus"></span> New contact</button>
  </div>
  <div style="display:flex;gap:6px">
    <span class="wf-pill accent">All 128</span>
    <span class="wf-pill">Favorites</span>
  </div>
  <div class="wf-card" style="display:flex;flex-direction:column;gap:0;padding:0">
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1.4px solid var(--wf-line)">
      <div style="width:32px;height:32px;border-radius:999px;background:var(--wf-accent-soft)"></div>
      <div style="flex:1"><strong>Jane Cooper</strong><br /><small>jane@acme.co</small></div>
      <span class="wf-pill">Lead</span>
    </div>
  </div>
</div>
```
