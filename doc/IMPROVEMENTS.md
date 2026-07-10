# Upstream comparison & improvement actions

Audit date: 2026-07-10. Compared against BuilderIO's upstream at that date:
[BuilderIO/skills](https://github.com/BuilderIO/skills) (the published
`visual-plan` / `visual-recap` skills, MIT, ~3.6k stars) and
[BuilderIO/agent-native](https://github.com/BuilderIO/agent-native) (the
framework monorepo containing the Plan app renderer and block registry,
**no license file**, active daily). Method: full read of this repo, headless
Chromium screenshots of our renderer (light + dark, plan + recap + canvas),
and a deep-dive of upstream's SKILL.md files, references, block registry,
and Plan-app action surface.

**Verdict in one paragraph.** Our document surface is genuinely good — the
recap and document blocks render clean, scannable, and close to upstream
quality. Our skill/reference prose preserves the upstream planning discipline
almost completely. The gaps are concentrated in four places: (1) renderer
correctness bugs found during this audit (one P0 crash), (2) the review
**feedback loop** — upstream plans are two-way media (comments, anchors,
persisted answers), ours are read-only pages with a dead form, (3) the
**canvas**, which upstream treats as a spatial board and we squeeze into the
article column, and (4) **validation** — upstream authors against a live
schema registry; we author against a static doc and crash on bad props.
Everything in (2)–(4) has a local-first answer that keeps our core advantage.

---

## 1. What upstream has that we don't

**The feedback loop (their biggest structural advantage).** The hosted Plan
app persists question-form answers (`visual-answer`), anchored comments
(element-relative %, canvas px, wireframe node paths, text quotes with
context), comment→agent routing (`resolutionTarget`), and focused screenshots
with the commented point marked. The skill instructs the agent to poll
`get-plan-feedback` before editing, after review, and before final response.
Review round-trips never leave the artifact. Ours: the user fills a
`QuestionForm` whose state lives in React and goes nowhere; answers must be
retyped into chat.

**Live block registry + validation.** `get-plan-blocks` renders the catalog
from the same zod-schema registry the renderer executes, with authoring
examples generated through the real serializer ("docs can never drift").
Local-files mode still gets `plan local check` (offline lint) and
`plan local verify` (headless validation with exact schema-path errors). Ours:
a hand-maintained `blocks.md` with no drift guard, and no validation — a bad
prop shape (`entities={{}}`) crashes the entire app (verified).

**Richer block schemas.** Their `Diff` takes `before`/`after` +
`mode: unified|split` + per-side annotations; `DataModel` fields and
`Endpoint` params carry `change: added|modified|removed|renamed` + `was`
(diff chips for recaps); `Endpoint` has `auth`, `params[]`, `responses[]`,
`deprecated`; `Code` collapses after N lines; `FileTree` entries can carry a
`snippet`; there's a `Table` block with density. Ours are simpler on all of
these (our `Diff` is a single prefixed-line string; our recap example fakes a
contract delta with two `Code` blocks in `Columns`).

**Prototype + design modes.** `create-prototype-plan` produces clickable
prototypes (semantic HTML + `data-goto="screenId"` navigation, Alpine-like
local state); design plans expose per-element `data-design-id` styling. We
have static wireframes only.

**The sketch aesthetic.** Upstream renders wireframes with Excalifont
hand-drawn text + a rough.js sketch overlay, and mermaid via
mermaid-to-excalidraw. The blog argues this is deliberate psychology: a plan
that *looks* like a whiteboard sketch invites reaction to direction, not
pixel-nitpicking. Ours renders clean and flat — it reads as a finished doc.

**Recap-specific discipline we dropped in adaptation.** Their visual-recap
SKILL.md has concrete budgets (3–8 key-change tabs, <~150 lines per tab,
title ≤70 chars, brief 1–3 sentences), a "recap the whole work unit" scope
rule, a surface/state inventory coverage pass (entry surface, interaction
surface, destination state, access/role variants), a mechanical diff→block
mapping table, the grounding rule ("structured blocks are true by
construction only if derived from actual changed lines; the model writes only
prose freely"), and secret redaction (`sk-•••`). Our recap SKILL.md kept the
spirit but lost the budgets, the inventory pass, the mapping table, and the
redaction rule.

**Ecosystem.** Claude Code plugin marketplace + Codex plugin + npx installer,
a GitHub Action that generates a recap per PR, plan versioning/restore,
sharing/visibility/guest editing, Notion round-trip, `visualize-repo`. Mostly
hosted-shaped; the GitHub Action idea and the versioning-by-git are the parts
that translate locally (we already get versioning free via git; per-branch
recap automation is actions 28–30 below).

## 2. What we have that upstream doesn't

- **Actually local.** Upstream's "local-files mode" keeps *content* local but
  still loads the hosted Plan UI over a localhost bridge
  (`plan.agent-native.com/local-plans/<slug>?bridge=…`), needs network and
  their app to be up, and fetches the block catalog remotely. Ours is fully
  offline: no account, no OAuth, no telemetry, no third-party page. For
  customer/PII repos that's the whole ballgame — and it was the reason this
  repo exists.
- **License-clean.** The agent-native monorepo has **no license file**; only
  the skills repo is MIT. Reimplementing the renderer from scratch wasn't
  just privacy hygiene, it was the only legally safe route. Worth stating in
  the README.
- **Git-first as the only mode.** Plans/recaps are plain MDX in the target
  repo — reviewable in PRs, versioned, greppable. Upstream defaults DB-first
  with export as an afterthought.
- **A radically smaller surface.** ~1.4k LOC renderer, 5 runtime deps,
  auditable in an afternoon; their Plan app is a full database-backed
  template (Drizzle/libsql, TipTap, Radix, node-pty…).
- **Direct MDX editing as the patch mechanism.** The agent edits `plan.mdx`
  with its normal Edit tool and Vite hot-reloads. Upstream needs a whole
  `contentPatches` op vocabulary because their canonical copy lives in a DB.
  Ours is simpler *and* more capable — don't copy their patch machinery.

## 3. Holes found in ours (this audit)

| # | Severity | Finding | Root cause |
|---|---|---|---|
| H1 | **P0** | Any plan with a canvas crashed the whole app (blank page, `Maximum update depth exceeded`) | `DesignBoard` passed a fresh `{ register }` object to `BoardCtx.Provider` each render; `Artboard`'s `useLayoutEffect` deps `[ctx, id]` re-fired → `recompute()` → re-render → new ctx → loop. **Fixed in working tree** ([canvas.jsx](../renderer/src/components/canvas.jsx): memoized provider value) — commit it. |
| H2 | P0 | One render-crashing plan blanks the entire app; hash-navigating to a good plan stays blank (verified with a bad `DataModel entities={{}}`) | No React error boundary around `PlanView`; `App.jsx` only catches *load* errors, not render throws. |
| H3 | P1 | Dark mode: plain `Code` blocks and `ApiEndpoint` JSON bodies render **white** with light-theme token colors | `main.jsx` imports `highlight.js/styles/github.css` (light-only); `.hljs { background:#fff }` wins over `--vp-code-bg`. |
| H4 | P1 | Mermaid diagrams don't re-theme on light/dark toggle (stay in the theme they mounted with) | `Diagram`'s effect deps are `[mermaid]` only; theme is read once at render time. |
| H5 | P1 | Canvas artboards always stack vertically; connector arrows draw awkward vertical hops; big feature of the format lost | The canvas lives inside `article.vp-doc` (max-width 840px) while one artboard = 720px frame + 190px annotation column — two can never sit side by side. |
| H6 | P1 | Wireframe frames show large dead bands (guidance says "fill the frame", renderer makes it impossible for short content) | `.vp-canvas-body` hard-codes `height: 440px` (520px mobile) regardless of content. |
| H7 | P1 | `QuestionForm` answers go nowhere — the form is decorative | No submit path; state is component-local. |
| H8 | P1 | The SSR self-test (`npm run check`) is blind to client-only crashes — it passed while H1 blanked every canvas plan in a real browser | Effects don't run under `renderToStaticMarkup`; no browser-level smoke exists. |
| H9 | P2 | Option detail text runs into its label ("…move behind a jobDefer unless…") | `.vp-q-option-detail` is an inline span; needs `display:block`. |
| H10 | P2 | Unknown `data-icon` names silently render nothing; agents get no signal they used a bad name; icon set is small (19 + aliases) | `svgFor()` returns null → marker left empty. |
| H11 | P2 | `npm run serve` hard-fails when `.plans-dir` points at a deleted directory (happened live during this audit when another repo's plans dir moved) | `link-plans.mjs` exits 1 instead of falling back to the demo plans with a warning. |
| H12 | P2 | Sidebar lists raw slugs only — no titles, no plan/recap badge, no status, alphabetical order | `plans.js` lazy-loads modules, so frontmatter isn't available at list time. |
| H13 | P2 | `blocks.md` can silently drift from the renderer (upstream's whole registry design exists to prevent this) | No check ties the catalog doc to `mdx-components.jsx`. |
| H14 | P3 | SSR check output is noisy with `useLayoutEffect` warnings | Canvas/wireframe use `useLayoutEffect` unconditionally; use a `useIsomorphicLayoutEffect` shim. |

## 4. Actions

Effort: S = <1h, M = half-day, L = day+.

### P0 — correctness (do first)

1. **[S] Commit the H1 canvas-crash fix** already in the working tree
   (memoized `BoardCtx` value in `canvas.jsx`).
2. **[S] Add a per-plan error boundary.** Wrap `<PlanView>` in an error
   boundary keyed by slug; render the existing `vp-error` pane with the stack
   instead of unmounting the app. One bad plan must never take down the
   viewer or block navigation. (H2)
3. **[S] Theme-aware syntax highlighting.** Replace the global
   `github.css` import with both themes scoped by `[data-theme]` (import as
   `?inline` and inject under scoped selectors), or set
   `.vp-code .hljs { background: transparent }` and define `--hljs-*` token
   colors per theme in `theme.css`. Verify `Code`, `Diff`, `AnnotatedCode`,
   `ApiEndpoint` JSON in dark mode. (H3)
4. **[M] Browser-level smoke test.** `npm run check:browser`: launch
   Playwright/Chromium (reuse `~/Library/Caches/ms-playwright` when present;
   skip gracefully otherwise), load each demo plan, assert no `pageerror` and
   non-empty body, screenshot light+dark. Wire into `just check`. H1 proved
   the SSR check alone is not enough. (H8; also fixes the confidence story
   for every renderer change that follows)

### P1 — close the feedback loop (biggest win, local-first)

5. **[M] QuestionForm write-back.** Add a Vite dev-server middleware
   (`configureServer`) exposing `POST /api/answers/<slug>`; the form gets a
   Submit button that writes `answers.json` next to the plan's `plan.mdx`
   (`{ questionId: { choice | choices | text, other? }, submittedAt }`).
   Update both SKILL.md workflows: after the user reviews, **read
   `<plans-dir>/<slug>/answers.json`** instead of asking them to retype
   answers in chat. This is ~70% of upstream's feedback machinery for ~50
   lines, with zero hosting. (H7)
6. **[S] Freeform review-note box.** Same middleware, a small "Notes to the
   agent" textarea at the doc bottom writing into the same `answers.json`.
   Cheap stand-in for upstream's anchored comments; skip full anchor
   machinery (see §5).
7. **[M] Plan lint for arbitrary dirs.** Extend `ssr-check.mjs` (or add
   `check-plans.mjs`) to SSR-render **every** `plan.mdx`/`canvas.mdx` under
   `VISUAL_PLAN_DIR`, reporting per-file errors. Skills gain a step: run the
   lint before handing over the URL. Catches MDX syntax + prop-shape mistakes
   the moment the agent authors them — our answer to `plan local verify`.
8. **[M] Agent visual self-check.** `npm run shot [slug]` → full-page PNGs
   (light + dark) into a temp dir, printed as paths. Update the "Before
   handoff, open the plan and check it" bar in
   `references/document-quality.md` to be executable: the agent Reads the
   screenshots and checks contrast/overlap/clipping itself. Upstream's agent
   cannot do this against their hosted app; ours can — this leapfrogs them.

### P1 — canvas & wireframe quality

9. **[M] Full-bleed canvas.** Let `.vp-canvas-surface` escape the 840px
   column (e.g. `width: calc(100vw - sidebar)` breakout or `vp-doc` grows
   when a canvas exists). Keep lanes wrapping, but two browser-surface
   artboards side by side must be possible on a 1440px screen. Consider a
   simple CSS `transform: scale()` zoom control (75/100%) instead of a
   pan/zoom lib. (H5)
10. **[S] Auto-height screens.** Replace the fixed `440px` body height with
    `min-height` per surface + content-driven height (cap with `max-height`
    + scroll). Kills the dead bands; "fill the frame" guidance stops fighting
    the renderer. (H6)
11. **[S] Fix `.vp-q-option-detail` to `display:block`** (H9); sweep other
    small CSS nits (connector label width estimate breaks on long labels —
    measure text or cap label length).
12. **[M] Icon set + loud fallback.** Add the ~15 icons agents will actually
    reach for (trash, download, upload, filter, star, folder, file, link,
    external, play, refresh, copy, eye, clock, warning, git-branch). Unknown
    names render a visible dashed placeholder box + `console.warn`, so the
    browser smoke test / screenshots surface them. Update the name list in
    `blocks.md` + `wireframe.md`. (H10)

### P2 — block vocabulary upgrades (adopt selectively from upstream)

13. **[M] `Diff` v2**: accept `before`/`after` props with computed diff (the
    `diff` npm package is small) + `mode: unified|split`, and optional
    annotations with `side`. Keep the current prefixed-string mode as-is for
    hand-authored hunks. Recaps get real side-by-side contract deltas instead
    of two `Code` blocks in `Columns`.
14. **[M] Change chips on `DataModel` + `ApiEndpoint`**: `change:
    added|modified|removed|renamed` and `was` on fields/params/responses,
    rendered as small status tags (reuse `vp-ft-*` styles). This is
    upstream's key recap trick — schema evolution readable at a glance.
15. **[S] `Code` collapse**: `collapseAfter={N}` prop with an expand toggle,
    so recap tabs can carry ~150-line files without walls of code.
16. **[S] Blocks-catalog drift guard**: extend `ssr-check` to assert the set
    of exported components in `mdx-components.jsx` matches the set of block
    names documented in `references/blocks.md` (parse headings). Our static
    answer to their live registry. (H13)
17. **[L, optional] Prototype-lite**: intercept clicks on `[data-goto=
    "<artboardId>"]` inside `Screen` html → scroll to + flash-highlight that
    artboard. A 30-line nod to their prototype mode that makes flows
    reviewable without a state machine.
18. **[L, optional] Sketch mode**: a `sketch` toggle (board- or app-level)
    applying rough.js borders + a hand-drawn display font to wireframes.
    Pure aesthetics, but it's upstream's signature and it changes how
    reviewers *treat* the artifact (draft, not spec). Do after everything
    above.

### P2 — app shell

19. **[M] Sidebar with metadata.** Load frontmatter eagerly (glob the MDX
    raw with `{ query: '?raw', eager: true }` and regex the YAML, or a tiny
    Vite plugin) → show title, status pill, and a plan/recap badge; group
    recaps under their own heading; sort by file mtime, newest first. Kills
    the `recap-` slug-prefix convention. (H12)
20. **[S] Robust `link-plans`.** Dangling `.plans-dir` → warn and fall back
    to the demo `plans/` instead of exiting 1 (happened in the wild during
    this audit). (H11)
21. **[S] TOC rail** for long plans: collect `h2`s, render anchor links in a
    right gutter or under the sidebar nav.
22. **[S] `--open` + port hygiene**: pass `open: true` in dev, set
    `strictPort: true` so the printed URL in the skills is never wrong.

### P2 — automation: recaps per feature branch

Upstream ships a GitHub Action that generates a recap per PR — into their
hosted DB. Ours can do the same shape with the recap landing as a normal
`doc/plans/recap-<branch>/plan.mdx` commit, which keeps the local-first
stance: the diff goes to the LLM exactly as it does in an interactive
session, and the artifact stays in the repo.

28. **[M] Headless recap command.** A `just recap [base]` recipe (or
    `bin/recap` in this repo) that: resolves the base
    (`git merge-base origin/<default> HEAD`), derives the slug from the
    branch name (`recap-<branch-slug>`, matching the existing convention),
    and runs `claude -p "/visual-recap <base>...HEAD"` headless. The skill
    writes the recap with `branch`, `base`, and `head` SHAs in the
    frontmatter so staleness is detectable (`head` ≠ current branch tip →
    regenerate). Prerequisite for CI, immediately useful locally
    ("recap this branch before I open the MR").
29. **[L] CI recipe: GitHub Action + GitLab CI job.** On PR/MR open and
    subsequent pushes: check out the branch, run `install.sh` (skills only —
    the renderer isn't needed to author MDX), run action 28's command with
    the API key from CI secrets, and commit the recap back to the branch
    with `[skip ci]` (or attach as artifact + MR comment when the branch is
    protected). Skip regeneration when frontmatter `head` already matches
    the tip. Ship both a `.github/workflows/recap.yml` and a
    `.gitlab-ci.yml` include template in this repo. The recap then renders
    for reviewers via the normal local renderer — or via `npm run build`'s
    static export published as a CI pages artifact if a clickable link per
    MR is wanted.
30. **[S] Recap frontmatter contract.** Document `branch`/`base`/`head` in
    `blocks.md`/the recap SKILL.md and teach the plan-lint (action 7) to
    warn on stale recaps (`head` behind branch tip), so manual and
    CI-generated recaps share one freshness rule.

### P3 — skill/reference text upgrades (cheap, port from upstream MIT text)

23. **[S] Recap budgets + scope**: add to `visual-recap/SKILL.md`: 3–8
    key-change tabs, <~150 lines per tab, title ≤70 chars, brief 1–3
    sentences; "recap the whole work unit" scope rule; the surface/state
    inventory pass (entry, interaction, destination, access variants).
24. **[S] Diff→block mechanical mapping table** in the recap skill
    (schema/migration → `DataModel` + change chips; route → `ApiEndpoint`;
    new file → `AnnotatedCode` not one-sided diff; hunks → `Diff` split with
    one-line summary; architecture shift → `Diagram` panels; narrative →
    prose — "the only place the model writes freely"), plus the grounding
    rule and secret-redaction rule verbatim-adapted.
25. **[S] Wide-layout allowlist**: if/when H5's breakout lands, mirror
    upstream's rule that only `Diff`, `AnnotatedCode`, and `Tabs` may render
    wider than prose; everything else stays in the column.
26. **[S] Make the pre-handoff check executable** (ties to action 8): the
    quality bar should name the exact commands (`npm run check-plans`,
    `npm run shot <slug>`) instead of "open the plan and check it".
27. **[S] README: state the license position** — renderer is original work
    because upstream's monorepo is unlicensed; skills prose adapted from the
    MIT skills repo only.

### Explicitly not adopting

Hosted DB/accounts/sharing/guest editing, TipTap in-browser editing, Notion
compat, the `contentPatches` op vocabulary (direct MDX editing + HMR is
strictly simpler here), full comment-anchor machinery (percent coordinates,
node paths, detached-thread reconciliation), MCP connector plumbing, and the
embedded terminal. They all exist to serve the hosted, multi-tenant shape —
the thing this repo exists to avoid.

---

## Suggested sequencing

Week 1: actions 1–4 (correctness + test harness) then 9–11 (canvas layout).
Week 2: 5, 7, 8 (feedback loop + lint + self-check) and 19–20.
Then branch-recap automation (28 → 29/30 — 28 is useful standalone), and
vocabulary upgrades (13–16) as recap demand appears. The optional
sketch/prototype work only when everything else is boring.
