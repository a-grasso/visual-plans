# Plan document quality — the bar

The quality bar for the plan document (below any canvas): how it reads, which
blocks to use, how open questions are surfaced, and the pre-handoff check. Read
it in full before authoring. Adapted from BuilderIO/skills (MIT).

**The document is a serious technical plan, not marketing.** Write it the way a
strong implementation plan reads: outcome-first, prose-first, self-contained, and
specific. State the objective and what "done" means, the scope and non-goals, the
proposed approach with the key decisions and their rationale, ordered steps that
name real files, symbols, and data shapes, the risks, and a closing verification
step. Replace vague prose with specifics; never ship a step like "make it work."
No hero art, logos, nav bars, slogans, value props, or landing-page headings.

**Every plan stands alone.** The output is a plan to do the work, not a changelog
of the conversation. Don't write "preserve the previous plan", "as discussed
above", "this revision", or "unlike the prior version". Fold the right decisions
into normal objective/architecture/scope/roadmap prose. A reviewer opening the
plan cold should understand it. Avoid negative framing against absent context;
state the positive model directly.

**Make abstract plans instantly legible.** If the idea is broad or intended for a
third-party reviewer, put one concrete example near the top before dense
architecture, mode tables, or roadmaps. Then put mechanics, data flow, and
implementation detail in separate diagrams or sections.

**Preserve the user's level of abstraction.** A motivating use case is not
automatically the architecture. When the prompt describes a broader framework or
reusable primitive, separate the reusable core from specific apps, providers, or
examples. Use the concrete example to make the plan understandable, then make
clear which parts are core, which are adapters, and which are future examples.

**Visuals and document never duplicate each other.** For UI work the UI story
lives in the top canvas (see `canvas.md`); the document carries the technical
depth the visuals can't show — file/symbol maps, API and data contracts, code
snippets, phases, risks, validation. For architecture/code reviews, invert it:
the document is the visual surface, and each recommendation carries its own
nearby inline `Diagram` / `DataModel` plus file evidence.

**Use the right block, and make it carry substance.** The authoritative catalog
of block types and props is `references/blocks.md` — author from it, don't
memorize tags. Guidance on the load-bearing ones:

- Native Markdown (`rich-text`) for plan prose with real bold/italic/code/links
  and nested lists.
- `AnnotatedCode` for the file map: when a load-bearing file is worth
  highlighting, prefer the annotated walkthrough over a bare `Code` block — carry
  the real, syntax-highlighted code AND anchor short margin notes to the lines
  that actually change. A few high-signal notes per file, not one per line.
  Highlight only files worth reading; never an exhaustive list. Drop to `Code`
  only for a throwaway snippet. When more than one file matters, group them in a
  `Tabs` block.
- For a decision the reviewer must still make: put it in the bottom Open Questions
  `QuestionForm` as a `single` question — one option per real alternative, each
  with a short `detail` and `recommended: true` on the one you'd choose. If you
  have already committed, state it as settled prose or a `Callout tone="decision"`,
  optionally with a `Columns` block comparing the options you weighed — not as a
  mid-document form for a question you've answered.
- `Columns` for before/after or current/target comparisons where each side needs
  real nested blocks.
- `Diagram` for two-dimensional architecture, dependency, data-flow, or state
  relationships, only when it clarifies something real. Prefer paired before/after
  panels, layered diagrams, matrices, or grouped regions; don't default to
  left-to-right chains, and use a line only when the relationship is truly a
  sequence. Don't use a body `Diagram` for a product screen — that belongs in the
  canvas as a `Screen`. For rich architecture diagrams use `Diagram` HTML with
  the renderer primitives and `--wf-*` tokens (never hex, never `font-family`).
- `Tabs` for multiple states/directions/comparisons. A tab that reveals only
  prose usually means the plan is under-specified.
- `table`, `Checklist`, `Callout` for scannable structure.

**Open questions live at the bottom as one `QuestionForm`.** Surface answerable
unresolved decisions in a single final `QuestionForm` titled "Open Questions".
That form is the ONLY place open questions are enumerated — never a second list
or a parallel questions/decisions section earlier. A one-line pointer in the
overview ("a few decisions are open — see Open Questions") is fine. Use `single`
or `multi` for clear choices, `freeform` for constraints, `recommended: true` for
your default. Keep non-answerable assumptions or risks as concise `Callout`
blocks in the relevant section. Never ask the same question twice.

For complex plans, do an open-question audit before finishing: if architecture,
scope, UX, data shape, rollout, or ownership still depends on a choice, either
commit to a recommendation with rationale or add it to the bottom form with a
recommended default. A complex plan with no open questions is fine only when
every meaningful decision has been explicitly made.

**Verification must exercise the real workflow.** The final verification section
should go beyond typecheck/unit tests when the plan changes UI, data, sync, or
multi-step flows. Include at least one end-to-end smoke that matches the user
journey, and name the command or manual path when known.

**`CustomHtml` is a bounded escape hatch only** — a single fragment the native
blocks can't express, authored against theme tokens (`--wf-paper`, `--wf-card`,
`--wf-ink`, `--wf-muted`, `--wf-line`, `--wf-radius`) so it reads in dark mode.
Prefer native blocks; use `Diagram` HTML for rich diagrams, not this.

**Before handoff, open the plan and check it.** Fix overlap, excessive
whitespace, clipped fragments, poor contrast, and unreadable diagrams before
asking for approval. Check both light and dark themes: white mockup panels or
low-contrast muted text are defects — rewrite the HTML with `--wf-*` tokens.
