#!/usr/bin/env bash
# Install the visual-plan / visual-recap skills into a project and prepare the
# renderer. Idempotent — safe to re-run. Works from a local clone (private repo
# friendly; uses your existing git/npm auth).
#
# Usage:
#   ./install.sh [TARGET_PROJECT_DIR] [PLANS_DIR]
#
#   TARGET_PROJECT_DIR  project to wire the skills into (default: none — just
#                       installs renderer deps). Symlinks both skills into
#                       <target>/.claude/skills/.
#   PLANS_DIR           where that project keeps plans
#                       (default: <target>/doc/plans). Becomes the renderer's
#                       default plans dir so `npm run serve` just works.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RENDERER="$REPO/renderer"

echo "▸ visual-plans repo: $REPO"

# 1. Renderer deps (idempotent; fast when already up to date)
echo "▸ Installing renderer dependencies…"
( cd "$RENDERER" && npm install --silent )

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "✓ Renderer ready. No target project given."
  echo "  Demo:  cd $RENDERER && npm run serve"
  echo "  Wire a project:  ./install.sh /path/to/your-project"
  exit 0
fi

# 2. Resolve target + plans dir to absolute paths
TARGET="$(cd "$TARGET" && pwd)"
PLANS_DIR="${2:-$TARGET/doc/plans}"
mkdir -p "$PLANS_DIR"
PLANS_DIR="$(cd "$PLANS_DIR" && pwd)"

# 3. Symlink both skills into the project's .claude/skills
SKILLS_DST="$TARGET/.claude/skills"
mkdir -p "$SKILLS_DST"
for skill in visual-plan visual-recap; do
  ln -sfn "$REPO/skills/$skill" "$SKILLS_DST/$skill"
  echo "▸ linked $SKILLS_DST/$skill -> $REPO/skills/$skill"
done

# 4. Make this the renderer's default plans dir
printf '%s\n' "$PLANS_DIR" > "$RENDERER/.plans-dir"
echo "▸ renderer default plans dir: $PLANS_DIR"

cat <<EOF

✓ Installed into: $TARGET
  Skills:      /visual-plan, /visual-recap  (via .claude/skills symlinks)
  Plans dir:   $PLANS_DIR

Next:
  • In a Claude Code session in $TARGET, run /visual-plan or /visual-recap.
  • Review a plan:  cd $RENDERER && npm run serve   # http://localhost:5178
    (override any time with VISUAL_PLAN_DIR=/other/plans npm run serve)
EOF
