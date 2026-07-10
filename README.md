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

Clone once (private repo — uses your git/SSH auth), then wire it into a project:

```bash
git clone git@github.com:a-grasso/visual-plans ~/.visual-plans
cd ~/.visual-plans
./install.sh ~/Projects/my-project     # or: just install ~/Projects/my-project
```

`install.sh <project>` is idempotent — it installs the renderer deps, symlinks
`visual-plan` + `visual-recap` into `<project>/.claude/skills/`, and sets that
project's `doc/plans` as the renderer's default plans dir. Re-run it per project.

Once the repo is public, the same thing in one line from inside a project:

```bash
curl -fsSL https://raw.githubusercontent.com/a-grasso/visual-plans/main/bootstrap.sh | bash
```

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

After `install.sh`, the skills are standard Claude Code skills in the project's
`.claude/skills/`. In a session, invoke `/visual-plan` or `/visual-recap`; the
skill instructs the agent to author the MDX and start the renderer pointed at
your plans dir.

## Attribution

The planning-discipline prose and quality bars in `skills/*/SKILL.md` and
`skills/*/references/` are adapted from
[BuilderIO/skills](https://github.com/BuilderIO/skills) (`visual-plan`,
`visual-recap`), MIT licensed. See [LICENSE](LICENSE). The renderer is original.
