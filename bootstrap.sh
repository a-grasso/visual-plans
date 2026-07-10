#!/usr/bin/env bash
# One-line remote installer: clone-or-update visual-plans, then install into the
# current project (or $TARGET). Uses git over your existing auth, so it works
# for a private repo too.
#
#   # from inside the project you want to wire up:
#   curl -fsSL https://raw.githubusercontent.com/a-grasso/visual-plans/main/bootstrap.sh | bash
#
# Env:
#   INSTALL_DIR   where to clone/keep the repo (default: ~/.visual-plans)
#   TARGET        project to install into      (default: current directory)
#   REPO_URL      clone URL (default: git@github.com:a-grasso/visual-plans.git)
#
# NOTE: while the repo is private, curl to raw.githubusercontent needs auth —
# either make the repo public, or just clone once and run ./install.sh locally.
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-$HOME/.visual-plans}"
TARGET="${TARGET:-$PWD}"
REPO_URL="${REPO_URL:-git@github.com:a-grasso/visual-plans.git}"

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "▸ Updating $INSTALL_DIR"
  git -C "$INSTALL_DIR" pull --ff-only
else
  echo "▸ Cloning $REPO_URL -> $INSTALL_DIR"
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

exec "$INSTALL_DIR/install.sh" "$TARGET"
