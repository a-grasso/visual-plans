// End-to-end render check: load the example plan through Vite's SSR pipeline
// (same MDX + component code the browser runs) and assert the output markup
// contains every block. Effects (mermaid, icon hydration, connectors) don't
// run under SSR — this verifies structure + data flow, not canvas geometry.
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Self-test always renders the shipped example under this repo's plans/,
// regardless of VISUAL_PLAN_DIR.
const PLAN = '../../plans/example/plan.mdx'
const CANVAS = '../../plans/example/canvas.mdx'

const server = await createServer({
  configFile: new URL('../vite.config.js', import.meta.url).pathname,
  server: { middlewareMode: true, hmr: false },
  logLevel: 'error',
})

let failures = 0
const assert = (cond, msg) => {
  if (!cond) { console.error('  ✗ ' + msg); failures++ }
  else console.log('  ✓ ' + msg)
}

try {
  const { components } = await server.ssrLoadModule(
    new URL('../src/mdx-components.jsx', import.meta.url).pathname,
  )
  const plan = await server.ssrLoadModule(new URL(PLAN, import.meta.url).pathname)
  const canvas = await server.ssrLoadModule(new URL(CANVAS, import.meta.url).pathname)

  assert(plan.frontmatter?.title === 'Wire the account-enrichment runner', 'plan frontmatter title exported')

  const planHtml = renderToStaticMarkup(React.createElement(plan.default, { components }))
  const canvasHtml = renderToStaticMarkup(React.createElement(canvas.default, { components }))

  const doc = [
    ['vp-callout-decision', 'Callout (decision tone)'],
    ['vp-columns', 'Columns'],
    ['vp-mermaid', 'Diagram (mermaid container)'],
    ['vp-datamodel', 'DataModel'],
    ['AccountProfile', 'DataModel entity name rendered'],
    ['vp-filetree', 'FileTree'],
    ['vp-ft-new', 'FileTree status tag'],
    ['vp-acode', 'AnnotatedCode'],
    ['vp-acode-note', 'AnnotatedCode margin note'],
    ['vp-code', 'Code block'],
    ['vp-diff-add', 'Diff added line'],
    ['vp-diff-del', 'Diff removed line'],
    ['vp-api-method', 'ApiEndpoint method pill'],
    ['vp-tabs', 'Tabs'],
    ['vp-api-head', 'OpenApiSpec (active tab)'],
    ['vp-checklist', 'Checklist'],
    ['vp-check-box is-done', 'Checklist done item'],
    ['vp-customhtml', 'CustomHtml'],
    ['vp-qform', 'QuestionForm'],
    ['vp-q-recommended', 'QuestionForm recommended badge'],
    ['hljs', 'syntax highlighting applied'],
  ]
  console.log('\nDocument blocks:')
  doc.forEach(([needle, label]) => assert(planHtml.includes(needle), label))

  const cv = [
    ['vp-board', 'DesignBoard'],
    ['vp-artboard', 'Artboard'],
    ['vp-annotation', 'Annotation'],
    ['vp-frame vp-surface-browser', 'Screen (browser surface)'],
    ['Acme Robotics', 'wireframe product content rendered'],
    ['data-icon="plus"', 'icon marker present pre-hydration'],
    ['vp-connectors', 'connector SVG layer'],
  ]
  console.log('\nCanvas + wireframe:')
  cv.forEach(([needle, label]) => assert(canvasHtml.includes(needle), label))

  // JsonExplorer lives in a non-active tab (Tabs mounts only the active panel),
  // so render it directly to confirm the component itself works.
  console.log('\nDirect component render:')
  const blocks = await server.ssrLoadModule(new URL('../src/components/blocks.jsx', import.meta.url).pathname)
  const jsonHtml = renderToStaticMarkup(
    React.createElement(blocks.JsonExplorer, { data: { a: 1, b: ['x', true, null] } }),
  )
  assert(jsonHtml.includes('vp-json'), 'JsonExplorer renders')
  assert(jsonHtml.includes('vp-json-string'), 'JsonExplorer typed leaf styling')

  // Recap example renders through the same pipeline.
  console.log('\nRecap example:')
  const recap = await server.ssrLoadModule(
    new URL('../../plans/recap-example/plan.mdx', import.meta.url).pathname,
  )
  assert(recap.frontmatter?.kind === 'recap', 'recap frontmatter kind=recap')
  const recapHtml = renderToStaticMarkup(React.createElement(recap.default, { components }))
  ;[
    ['vp-callout-warn', 'breaking-change callout'],
    ['vp-ft-changed', 'FileTree changed status'],
    ['vp-columns', 'before/after columns'],
    ['vp-acode-note', 'annotated hunk'],
  ].forEach(([needle, label]) => assert(recapHtml.includes(needle), label))
} catch (err) {
  console.error('RENDER THREW:', err)
  failures++
} finally {
  await server.close()
}

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`)
process.exit(failures === 0 ? 0 : 1)
