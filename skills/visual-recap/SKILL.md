---
name: visual-recap
description: >-
  Summarize a completed code change — a branch, commit range, or PR diff — as a
  rich, reviewable visual recap: annotated diffs, before/after wireframes, schema
  and API changes, a file map, and focused review notes, rendered locally as MDX.
  Use to make a diff readable for review instead of scrolling raw patch output.
---

# Visual Recap (local)

The reverse of `visual-plan`: instead of planning a future change, summarize one
that already happened. Read a diff, understand what actually changed, and produce
a scannable MDX document that a reviewer can absorb quickly — annotated diffs,
before/after UI, contract/schema deltas, a file map, and the decisions worth
flagging. Rendered by the same `renderer/` app; same block vocabulary.

**Fully local.** No hosted service, no account, no telemetry, nothing uploaded.
Recaps are plain MDX at `<plans-dir>/<slug>/plan.mdx`, `kind: recap` in the
frontmatter.

> Adapted from [BuilderIO/skills](https://github.com/BuilderIO/skills)
> (`visual-recap`, MIT); hosted/collab machinery removed. See `../../LICENSE`.

## When to use

Use a visual recap when a change is large or subtle enough that raw diff output
is a poor review surface: multi-file refactors, contract/schema changes, a UI
change worth showing before/after, or a PR where the *shape* of the change
matters more than every line. Skip it for trivial diffs a reviewer can read in
one screen.

## Workflow

1. **Collect the diff, locally.** Determine the range (branch vs. base, a commit
   range, or a PR's head vs. base) and read it with local git only:
   ```bash
   git diff <base>...<head> --stat        # the file map + churn
   git diff <base>...<head>               # the actual changes
   git log <base>..<head> --oneline       # the commits
   ```
   Then **read the changed files themselves** for context — a recap explains the
   change, so you need to understand it, not just quote the patch.
2. **Read the quality bars**: `references/document-quality.md`, plus
   `references/wireframe.md` + `references/canvas.md` for any before/after UI.
   Author from `references/blocks.md`.
3. **Summarize strategically — do not dump raw line-by-line diffs.** Lead with
   what changed and why it matters. Use:
   - `FileTree` with `status` (`new`/`changed`/`removed`) as the file map — the
     files worth reading, not every touched path.
   - `Diff` for the handful of load-bearing hunks; `AnnotatedCode` when a changed
     file needs margin notes explaining the delta.
   - `DataModel` / `ApiEndpoint` before-and-after in a `Columns` block for schema
     or contract evolution — the changes that outlive the PR.
   - `Columns` of `Screen` wireframes (`label` `Before`/`After`) for UI changes,
     preserving unchanged controls so the reviewer sees exactly what moved.
   - `Diagram` for an architecture shift the diff implies but doesn't show.
   - `Callout tone="warn"` for anything a reviewer must not miss (a breaking
     change, a migration, a public-id change).
4. **Optional review questions.** If the change leaves a genuine open decision or
   a "please confirm X" for the reviewer, add a bottom `QuestionForm`.
5. **Render + review.** Same as visual-plan:
   ```bash
   cd <visual-plans-repo>/renderer && npm run serve   # http://localhost:5178
   ```
   If set up with `install.sh`, this already targets the project's plans dir;
   otherwise `VISUAL_PLAN_DIR=<abs path> npm run serve`. Hand the reviewer the
   URL. Editing the MDX hot-reloads.

## Recap discipline

- **The recap stands alone.** A reviewer who didn't write the change should
  understand what happened and why from the recap, without reading the raw diff.
- **Ground everything in the real diff.** Name actual files, symbols, and hunks;
  never invent a change that isn't in the diff. If something is unclear from the
  diff, read the file — don't guess.
- **Strategic, not exhaustive.** Omit noise (formatting, mechanical renames);
  spend the reader's attention on contract changes, architecture shifts, schema
  evolution, and behavior changes.
- **Facts, not praise.** A recap reports what changed and its implications, not
  how good the change is.

## References

Shared with `visual-plan` (identical renderer + blocks):
`references/blocks.md`, `references/document-quality.md`,
`references/wireframe.md`, `references/canvas.md`, `references/exemplar.md`.
A worked recap example: `plans/recap-example/` in this repo.
