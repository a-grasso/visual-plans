// Discover every plan under the configured plans dir (renderer/.plans-link,
// pointed at VISUAL_PLAN_DIR by scripts/link-plans.mjs — default: repo plans/).
// Vite's import.meta.glob keeps these hot: editing a plan.mdx re-runs its
// loader and the view updates live.
const planMods = import.meta.glob('../.plans-link/**/plan.mdx')
const canvasMods = import.meta.glob('../.plans-link/**/canvas.mdx')

const slugOf = (path) => {
  const m = path.match(/\.plans-link\/(.+)\/(plan|canvas)\.mdx$/)
  return m ? m[1] : path
}

export function listPlans() {
  return Object.entries(planMods)
    .map(([path, load]) => {
      const slug = slugOf(path)
      const canvasEntry = Object.entries(canvasMods).find(
        ([cPath]) => slugOf(cPath) === slug,
      )
      return { slug, load, loadCanvas: canvasEntry ? canvasEntry[1] : null }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))
}
