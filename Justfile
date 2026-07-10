# visual-plans — task runner

# list recipes
default:
    @just --list

# install skills user-global (~/.claude/skills) + renderer deps (idempotent)
install:
    ./install.sh

# install skills into one project's .claude/skills (gitignored, per-machine)
#   just install-project ~/Projects/my-project
install-project project:
    ./install.sh --project {{project}}

# run the renderer (uses the installed default plans dir; override with dir=)
#   just serve                       # last-installed project's plans
#   just serve ~/Projects/x/doc/plans
serve dir="":
    cd renderer && {{ if dir == "" { "npm run serve" } else { "VISUAL_PLAN_DIR=" + dir + " npm run serve" } }}

# render self-test (asserts every block renders)
check:
    cd renderer && npm run check

# static build to renderer/dist
build:
    cd renderer && npm run build
