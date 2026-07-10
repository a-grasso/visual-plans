#!/usr/bin/env bash
# Install the visual-plan / visual-recap skills, plus the local renderer.
# Self-bootstrapping and idempotent (same model as reflock's install.sh):
#
#   # once public — one-liner from anywhere:
#   curl -fsSL https://raw.githubusercontent.com/a-grasso/visual-plans/main/install.sh | bash
#
#   # from a local checkout:
#   ./install.sh                      # install skills user-GLOBAL (~/.claude/skills)
#   ./install.sh --project ~/repo     # install into one project's .claude/skills
#
# Global is the default and the recommended shape (matches "single install":
# every project on the machine sees the skills, nothing machine-specific is
# committed). Project mode symlinks into the repo but gitignores them, so a
# clone stays portable — each machine re-runs this script.
#
# Env overrides:
#   VISUAL_PLANS_SRC   use this existing checkout instead of cloning
#   VISUAL_PLANS_HOME  clone location (default ~/.local/share/visual-plans)
#   SKILLS_DIR         global skills dir (default ~/.claude/skills)
set -euo pipefail

REPO_SSH="git@github.com:a-grasso/visual-plans.git"
REPO_HTTPS="https://github.com/a-grasso/visual-plans.git"
CLONE_DIR="${VISUAL_PLANS_HOME:-$HOME/.local/share/visual-plans}"

# --- args ---
MODE="global"
PROJECT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --project|-p) MODE="project"; PROJECT="${2:-}"; shift 2 ;;
    --global) MODE="global"; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

# --- resolve source checkout (existing checkout, this checkout, or clone) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ -n "${VISUAL_PLANS_SRC:-}" ]; then
  SRC="$(cd "$VISUAL_PLANS_SRC" && pwd)"
elif [ -n "$SCRIPT_DIR" ] && [ -d "$SCRIPT_DIR/skills" ] && [ -d "$SCRIPT_DIR/renderer" ]; then
  SRC="$SCRIPT_DIR"                                   # run from a local checkout
elif [ -d "$CLONE_DIR/.git" ]; then
  echo "▸ Updating $CLONE_DIR"; git -C "$CLONE_DIR" pull --ff-only; SRC="$CLONE_DIR"
else
  echo "▸ Cloning into $CLONE_DIR"
  git clone --depth 1 "$REPO_SSH" "$CLONE_DIR" 2>/dev/null \
    || git clone --depth 1 "$REPO_HTTPS" "$CLONE_DIR"
  SRC="$CLONE_DIR"
fi
echo "▸ source: $SRC"

# --- renderer deps ---
echo "▸ Installing renderer dependencies…"
( cd "$SRC/renderer" && npm install --silent )

link_skills() {  # $1 = destination .claude/skills dir
  mkdir -p "$1"
  for skill in visual-plan visual-recap; do
    ln -sfn "$SRC/skills/$skill" "$1/$skill"
    echo "▸ linked $1/$skill -> $SRC/skills/$skill"
  done
}

if [ "$MODE" = "global" ]; then
  SKILLS_DIR="${SKILLS_DIR:-$HOME/.claude/skills}"
  link_skills "$SKILLS_DIR"
  cat <<EOF

✓ Installed user-global. /visual-plan and /visual-recap are available in every
  project on this machine.
  Render a project's plans:
    cd $SRC/renderer && VISUAL_PLAN_DIR=/path/to/repo/doc/plans npm run serve
EOF
else
  [ -n "$PROJECT" ] || { echo "--project needs a directory" >&2; exit 2; }
  PROJECT="$(cd "$PROJECT" && pwd)"
  link_skills "$PROJECT/.claude/skills"
  # keep the machine-specific symlinks OUT of the project's history
  IGN="$PROJECT/.gitignore"
  for entry in ".claude/skills/visual-plan" ".claude/skills/visual-recap"; do
    if [ ! -f "$IGN" ] || ! grep -qxF "$entry" "$IGN"; then
      printf '%s\n' "$entry" >> "$IGN"
    fi
  done
  # make this project's plans the renderer default
  mkdir -p "$PROJECT/doc/plans"
  printf '%s\n' "$PROJECT/doc/plans" > "$SRC/renderer/.plans-dir"
  cat <<EOF

✓ Installed into $PROJECT (symlinks gitignored — re-run this on each machine).
  Plans dir: $PROJECT/doc/plans
  Render:    cd $SRC/renderer && npm run serve
EOF
fi
