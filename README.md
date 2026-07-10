# visual-plans

Two Claude Code skills — **visual-plan** and **visual-recap** — plus a local
renderer that turns them into interactive, human-reviewable documents.

- **visual-plan** — before writing code, turn a text implementation plan into a
  scannable visual plan: diagrams, file maps, annotated code, data models,
  wireframes, and a bottom open-questions form. The approval gate before you
  start editing.
- **visual-recap** — after a change lands, summarize a diff (branch/commit/PR)
  as a visual recap: annotated diffs, before/after wireframes, schema/API
  deltas, a file map, and focused review notes.

Plans and recaps are plain **MDX** checked into whatever repo they describe.

## Why this exists

It's a self-engineered, fully-local stand-in for BuilderIO's `@agent-native`
`visual-plan` / `visual-recap` skills. Those are excellent, but their **default
mode uploads repo-grounded plan content to a hosted third-party service**
(`plan.agent-native.com`, Neon Postgres, plus Amplitude/Sentry/rrweb in the web
app) behind an account and OAuth. For a repo containing customer/PII data that's
a GDPR problem and a data-governance non-starter.

This implementation keeps the valuable part — the planning discipline and the
block vocabulary (adapted from their MIT-licensed prompts) — and drops
everything hosted:

- **No hosted service, no account, no OAuth, no telemetry, nothing uploaded.**
- Plans/recaps are MDX in your repo, rendered by a local Vite dev server.
- The renderer is an independent implementation (no BuilderIO code).

Both skills share the same renderer and the same reference/quality-bar docs,
which is why they live in one repo rather than two.

## Layout

```
visual-plans/
  renderer/                 Vite + React + MDX renderer (the local dev server)
    src/components/         the block kit (document, wireframe, canvas)
    src/theme.css           the --wf-* token system (light/dark)
    scripts/                link-plans (configurable dir) + ssr render check
  skills/
    visual-plan/            SKILL.md + references/ (blocks, quality bars)
    visual-recap/           SKILL.md + references/ -> ../visual-plan/references
  plans/                    example plan + example recap
```

## Install

Self-bootstrapping installer (same model as reflock): clones-or-updates to
`~/.local/share/visual-plans`, installs renderer deps, and symlinks the skills.
Idempotent — safe to re-run.

**User-global (recommended)** — skills available in every project on the machine,
nothing machine-specific committed anywhere:

```bash
# once the repo is public — one line from anywhere:
curl -fsSL https://raw.githubusercontent.com/a-grasso/visual-plans/main/install.sh | bash

# from a local checkout (works now, private):
./install.sh
```

**Into one project** — symlinks into `<project>/.claude/skills` and adds them to
that project's `.gitignore` (so a clone stays portable; each machine re-runs it):

```bash
./install.sh --project ~/Projects/my-project
```

Env overrides: `VISUAL_PLANS_SRC` (use an existing checkout instead of cloning),
`VISUAL_PLANS_HOME` (clone location), `SKILLS_DIR` (global skills dir).

> **Why not commit the symlinks?** A committed symlink only survives a clone if
> its target lives inside the repo (or a submodule). An absolute symlink to an
> external checkout dangles on every other machine. So skills install
> per-machine (global, once) — like a tool on `PATH` — rather than being vendored
> per repo.

## Quick start

```bash
cd renderer
npm run serve        # http://localhost:5178
```

`npm run serve` renders the last-installed project's plans (or this repo's own
`plans/` demo if none). Override any time:

```bash
VISUAL_PLAN_DIR=/path/to/your-repo/doc/plans npm run serve
```

Editing any `plan.mdx` / `canvas.mdx` hot-reloads the view. `npm run check`
runs the render self-test; `npm run build` produces a static export in `dist/`.

## Using the skills with a coding agent

After `install.sh`, the skills are standard Claude Code skills in
`~/.claude/skills/` (or a project's `.claude/skills/` with `--project`). In a
session, invoke `/visual-plan` or `/visual-recap`; the skill instructs the agent
to author the MDX and start the renderer pointed at your plans dir.

## Attribution

The planning-discipline prose and quality bars in `skills/*/SKILL.md` and
`skills/*/references/` are adapted from
[BuilderIO/skills](https://github.com/BuilderIO/skills) (`visual-plan`,
`visual-recap`), MIT licensed. See [LICENSE](LICENSE). The renderer is original.
