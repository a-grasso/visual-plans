---
name: visual-plan
description: >-
  Turn a text implementation plan into a rich, reviewable visual plan — diagrams,
  file maps, annotated code, data models, wireframes, and an open-questions form —
  rendered locally as MDX. Use before writing code on multi-file, ambiguous,
  risky, architecture-heavy, data-heavy, or UI-heavy work, when the user should
  react to a direction before you implement.
---

# Visual Plan (local)

Build the plan you would normally write in Markdown, but as a scannable document
with editable blocks: inline diagrams, data models, annotated code, file trees,
API contracts, optional wireframes, and a bottom open-questions form. The
deliverable is an MDX file rendered by the `renderer/` app in this repo.

**Fully local.** No hosted service, no account, no telemetry, nothing uploaded.
Plans are plain MDX at `<plans-dir>/<slug>/plan.mdx` (+ optional `canvas.mdx`),
versioned in whatever repo they describe. A bare `<slug>` marks a plan; a recap
of already-shipped work uses `/visual-recap` instead, which prefixes its slug
`recap-<slug>` — so `<plans-dir>` stays self-describing without opening a file.

> Planning discipline and quality bars below are adapted from
> [BuilderIO/skills](https://github.com/BuilderIO/skills) (`visual-plan`, MIT);
> the hosted/collab machinery is removed and the renderer is our own. See
> `../../LICENSE`.

## When to use

Create a visual plan whenever the plan reads better as a reviewable artifact
than a chat paragraph: multi-file, ambiguous, long-running, risky, or UI-heavy
work, or a component/API/data-shape decision that needs alignment. Also for a
modest but reviewable change (one UI surface with states, a small workflow, a
before/after). **Skip it** for truly trivial, unambiguous work — typos, one-line
fixes, a single well-specified function — and just make the change. Never pad a
plan with filler and never ship a single-step plan.

## Plan discipline

- **Research before you draft.** Read the real files, symbols, schema, and
  patterns first; delegate wide exploration to a sub-agent. Name actual files,
  symbols, and data shapes instead of inventing them. Lead with reuse: for each
  step, name what it reuses before what it adds, so the plan explains the
  genuinely new delta.
- **Decide the hard-to-reverse bets first.** For non-trivial backend/data/API
  work, call out the decisions expensive to undo once callers depend on them —
  wire format, public ids, data-model shape, auth/ownership — and get those right
  in the plan even if most of the feature ships later. Then scope the smallest
  first cut that proves the approach, stating what's in and what's deferred.
- **Keep examples at the right altitude.** Separate the core abstraction from
  motivating examples; label examples as examples unless they are the whole scope.
- **The plan stands alone.** A reader who never saw the chat should understand
  it. No revision language ("unlike the previous version", "as discussed above").
  State the positive model directly.
- **Planning is read-only.** Make no source edits while building or reviewing
  the plan. Start editing only after the user approves the direction.
- **Clarify vs. assume.** Don't ask how to build it — explore and present the
  approach and options in the plan. Ask a clarifying question (via the host's
  normal ask-user flow, batch 2–4) only when an ambiguity would change the design
  and you can't resolve it from the code. Otherwise state the assumption and
  proceed, and keep anything unresolved in the single bottom Open Questions form.
- **The plan is the approval gate.** After surfacing it, ask the user to review
  and approve before you write code, and name which files/areas the work touches.
  Presenting the plan and requesting sign-off *is* the approval step.

## Workflow

1. **Research** the codebase per the discipline above.
2. **Read the quality bars** before authoring: `references/document-quality.md`,
   and `references/wireframe.md` + `references/canvas.md` if the plan has a
   visual surface. Author blocks from `references/blocks.md` (the authoritative
   catalog of component names + props) — do not invent tags.
3. **Write** `<plans-dir>/<slug>/plan.mdx` with YAML frontmatter (`title`,
   `status`, optional `owner`, `summary`) and the document blocks. `<plans-dir>`
   is wherever the target repo keeps plans (e.g. `doc/plans/`). For UI/product
   plans, add a sibling `canvas.mdx` with the top visual surface (`<DesignBoard>`
   of `<Artboard>`/`<Screen>` wireframes).
4. **Render + review.** Start the renderer and hand the user the URL:
   ```bash
   cd <visual-plans-repo>/renderer && npm run serve   # http://localhost:5178
   ```
   If the project was set up with `install.sh`, `npm run serve` already targets
   its plans dir. Otherwise point it explicitly:
   `VISUAL_PLAN_DIR=<abs path to plans-dir> npm run serve`. Open the URL, pick
   the plan in the sidebar; light/dark toggle top-left. Editing the MDX
   hot-reloads.
5. **Self-review** high-stakes plans (architecture, backend, data, migration,
   multi-file) once before final: spawn one skeptical reviewer to find weak,
   missing, or wrong parts — unanchored steps, an unmade hard-to-reverse
   decision, a menu where the plan should commit, single-step filler. Apply
   clear-cut fixes; route genuine judgment calls into the Open Questions form.
6. **Iterate** by editing the MDX (hot reload).
7. **Approval gate.** Ask for sign-off, naming the files/areas the work touches.
   Begin implementation only after approval.

## Visual surface choice

Don't add visual chrome by default.

- **No visual surface** for architecture-only, backend-only, data-migration, or
  copy-only plans. Write a strong document with local inline `<Diagram>` blocks
  where relationships need a spatial explanation (usually one per recommendation).
- **Canvas** (`canvas.mdx`) for UI/product work: put the primary wireframes as
  `<Artboard>`/`<Screen>` at the top; one artboard per user-visible state
  (default, popover, panel, loading, error). Keep implementation detail, file
  maps, contracts, risks, and verification in the document body below.
- The document and the canvas never duplicate each other. For architecture/code
  reviews the document *is* the visual surface (each claim carries its own nearby
  diagram + file evidence); for UI work the canvas carries the UI story and the
  document carries the technical depth.

## References

- `references/blocks.md` — authoritative local block catalog (names, props, examples).
- `references/document-quality.md` — the document quality bar.
- `references/wireframe.md` — HTML wireframe / `<Screen>` quality bar.
- `references/canvas.md` — canvas / artboard / connector mechanics.
- `references/exemplar.md` — worked good vs. bad examples.

A complete worked plan exercising every block: `plans/example/` in this repo.
