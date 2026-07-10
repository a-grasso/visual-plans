import React, { useEffect, useState } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { listPlans } from './plans.js'
import { components } from './mdx-components.jsx'

const plans = listPlans()

function useHashSlug() {
  const [slug, setSlug] = useState(() => decodeURIComponent(location.hash.slice(1)))
  useEffect(() => {
    const onHash = () => setSlug(decodeURIComponent(location.hash.slice(1)))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return [slug, (s) => { location.hash = s }]
}

function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('vp-theme') || 'light',
  )
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('vp-theme', theme)
  }, [theme])
  return [theme, setTheme]
}

function PlanView({ entry }) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let live = true
    setState({ status: 'loading' })
    ;(async () => {
      try {
        const mod = await entry.load()
        const canvasMod = entry.loadCanvas ? await entry.loadCanvas() : null
        if (!live) return
        setState({
          status: 'ready',
          Content: mod.default,
          frontmatter: mod.frontmatter || {},
          Canvas: canvasMod ? canvasMod.default : null,
        })
      } catch (err) {
        if (live) setState({ status: 'error', error: err })
      }
    })()
    return () => {
      live = false
    }
  }, [entry])

  if (state.status === 'loading') return <div className="vp-empty">Loading…</div>
  if (state.status === 'error')
    return (
      <div className="vp-empty vp-error">
        <strong>Failed to render this plan.</strong>
        <pre>{String(state.error && state.error.stack ? state.error.stack : state.error)}</pre>
      </div>
    )

  const { Content, Canvas, frontmatter } = state
  const status = frontmatter.status
  return (
    <MDXProvider components={components}>
      <article className="vp-doc">
        {frontmatter.title && (
          <header className="vp-doc-head">
            <h1 className="vp-doc-title">{frontmatter.title}</h1>
            {(status || frontmatter.owner) && (
              <div className="vp-doc-meta">
                {status && (
                  <span className={`vp-status vp-status-${String(status).toLowerCase()}`}>
                    {status}
                  </span>
                )}
                {frontmatter.owner && <span className="vp-muted">{frontmatter.owner}</span>}
              </div>
            )}
            {frontmatter.summary && <p className="vp-doc-summary">{frontmatter.summary}</p>}
          </header>
        )}
        {Canvas && (
          <section className="vp-canvas-surface">
            <Canvas />
          </section>
        )}
        <Content />
      </article>
    </MDXProvider>
  )
}

export default function App() {
  const [slug, setSlug] = useHashSlug()
  const [theme, setTheme] = useTheme()
  const entry = plans.find((p) => p.slug === slug) || plans[0]

  return (
    <div className="vp-shell">
      <aside className="vp-sidebar">
        <div className="vp-brand">
          <span className="vp-brand-mark">◆</span> Visual Plan
        </div>
        <nav className="vp-nav">
          {plans.length === 0 && (
            <p className="vp-muted vp-nav-empty">
              No plans yet. Create one at <code>doc/plans/&lt;slug&gt;/plan.mdx</code>.
            </p>
          )}
          {plans.map((p) => (
            <button
              key={p.slug}
              className={`vp-nav-item${entry && entry.slug === p.slug ? ' is-active' : ''}`}
              onClick={() => setSlug(p.slug)}
            >
              {p.slug}
            </button>
          ))}
        </nav>
        <button
          className="vp-theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </aside>
      <main className="vp-main">
        {entry ? (
          <PlanView key={entry.slug} entry={entry} />
        ) : (
          <div className="vp-empty">
            No plans found under <code>doc/plans/</code>.
          </div>
        )}
      </main>
    </div>
  )
}
