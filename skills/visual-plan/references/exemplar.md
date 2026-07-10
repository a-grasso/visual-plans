# Good vs. bad exemplar — the bar

Worked examples of a great plan and the anti-patterns to avoid. Read alongside
`document-quality.md` and `canvas.md`. Adapted from BuilderIO/skills (MIT).

**GOOD — a UI-first plan.** A `canvas.mdx` with a `desktop` artboard whose `html`
is a real flex layout: a sidebar of links (`Inbox 12`, `Today 4`), a main column
with an `<h1>Today</h1>`, accent `.wf-pill` filters, and `.wf-card` rows carrying
real titles, dates, and a `button.primary` — styled only through bare elements,
helper classes, and `--wf-*` tokens. Plain-text annotations sit beside the frame,
pointing only at controls that need explanation. Below, the document: objective
and done-criteria, a few `Code` blocks (grouped in a `Tabs` block when more than
one) showing the real shape of the load-bearing files, a `Callout tone="decision"`
stating the chosen approach with a `Columns` block weighing the two real options
behind it, and a validation step — none of it repeating the canvas.

**GOOD — a broad product-architecture plan.** Opens with a plain recommendation
and one concrete app state before the abstraction. The first canvas artboard is
pure product UI matching the current app shell; nearby annotations explain the
user-visible delta. A separate `Diagram` below shows the mechanics. The document
separates the reusable core from app/provider adapters and examples, covers
contracts, folder/schema shape, roadmap, non-goals, a bottom `QuestionForm` for
unresolved decisions, and a verification section with a realistic end-to-end
smoke. A reviewer who wasn't in the chat gets the idea from the top snapshot.

**GOOD — a backend architecture review.** No canvas. The document opens with
context and a legend, then repeats recommendation sections: title, a
confidence/category `Callout`, a `FileTree` or monospace grid of real file paths,
one inline two-dimensional before/after or layered `Diagram`, and terse
Problem/Solution/Why bullets in the codebase's vocabulary. The diagram uses space
to show boundaries and ownership; it is not a default left-to-right chain. Ends
with a top recommendation and a bottom `QuestionForm` only if the next direction
is genuinely open. Better than a top canvas because each diagram is local to the
claim it supports.

**BAD.** Wireframe `html` with hard-coded hex colors, a `font-family`, or fixed
pixel width/height; gray placeholder bars faking text on a non-skeleton frame; a
forced desktop + mobile pair for a popover; floating bordered annotation cards
hugging frames; a mockup escaped into a `CustomHtml` document block; and a
marketing-style document with a hero heading and value props restating what the
canvas already shows. Also bad: an architecture-only plan forced into a top
canvas of labeled boxes with overlapping text; a product wireframe mixing a real
screen with repo names, file-contract arrows, or architecture explanations; a
plan that describes itself as a revision of a prior conversation; and a
single-step plan or one padded with filler. Never produce these.
