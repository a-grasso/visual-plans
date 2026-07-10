// Vite's import.meta.glob needs a literal path, so we can't glob an arbitrary
// runtime directory directly. Instead we (re)point a stable symlink,
// renderer/.plans-link, at the chosen plans directory before Vite starts.
//
// Resolution order:
//   1. VISUAL_PLAN_DIR env var (explicit, wins)
//   2. renderer/.plans-dir file (per-project default written by install.sh)
//   3. this repo's own plans/ (standalone demo)
//
//   VISUAL_PLAN_DIR=/path/to/some-repo/doc/plans npm run serve
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url)) // renderer/scripts
const renderer = path.resolve(here, '..')
const repoRoot = path.resolve(renderer, '..')

const configFile = path.join(renderer, '.plans-dir')
const fromConfig = fs.existsSync(configFile)
  ? fs.readFileSync(configFile, 'utf8').trim()
  : ''

const target = process.env.VISUAL_PLAN_DIR
  ? path.resolve(process.env.VISUAL_PLAN_DIR)
  : fromConfig
    ? path.resolve(fromConfig)
    : path.join(repoRoot, 'plans')

if (!fs.existsSync(target)) {
  console.error(`[link-plans] plans directory does not exist: ${target}`)
  process.exit(1)
}

const link = path.join(renderer, '.plans-link')
try { fs.unlinkSync(link) } catch {}
fs.symlinkSync(target, link, 'dir')
console.log(`[link-plans] plans -> ${target}`)
