import React, { useState, useEffect, useRef, Children } from 'react'
import { highlight, escapeHtml } from '../lib/highlight.js'

/* ---------------- Callout ---------------- */
const CALLOUT_ICON = { note: '✎', info: 'ℹ', decision: '◆', warn: '▲', ok: '✓' }
export function Callout({ tone = 'note', title, children }) {
  return (
    <div className={`vp-callout vp-callout-${tone}`}>
      <span className="vp-callout-icon">{CALLOUT_ICON[tone] || '•'}</span>
      <div className="vp-callout-body">
        {title && <div className="vp-callout-title">{title}</div>}
        {children}
      </div>
    </div>
  )
}

/* ---------------- Columns ---------------- */
export function Columns({ children }) {
  const cols = Children.count(children)
  return (
    <div className="vp-columns" style={{ '--cols': cols }}>
      {children}
    </div>
  )
}
export function Column({ label, children }) {
  return (
    <div className="vp-column">
      {label && <div className="vp-column-label">{label}</div>}
      <div className="vp-column-body">{children}</div>
    </div>
  )
}

/* ---------------- Tabs ---------------- */
export function Tabs({ orientation = 'horizontal', children }) {
  const tabs = Children.toArray(children).filter(Boolean)
  const [active, setActive] = useState(0)
  return (
    <div className={`vp-tabs${orientation === 'vertical' ? ' vp-tabs-vertical' : ''}`}>
      <div className="vp-tablist" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={i}
            role="tab"
            className={`vp-tab${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {t.props.label || `Tab ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="vp-tabpanel" role="tabpanel">
        {tabs[active]}
      </div>
    </div>
  )
}
export function Tab({ children }) {
  return <>{children}</>
}

/* ---------------- Checklist ---------------- */
export function Checklist({ items = [] }) {
  return (
    <ul className="vp-checklist">
      {items.map((it) => (
        <li key={it.id || it.label}>
          <span className={`vp-check-box${it.done ? ' is-done' : ''}`}>{it.done ? '✓' : ''}</span>
          <span className={it.done ? 'vp-check-done' : ''}>{it.label}</span>
        </li>
      ))}
    </ul>
  )
}

/* ---------------- Code ---------------- */
export function Code({ code = '', lang, title, children }) {
  const src = code || (typeof children === 'string' ? children : '')
  const html = highlight(src, lang)
  return (
    <div className="vp-code">
      {(title || lang) && (
        <div className="vp-code-title">
          <span>{title}</span>
          {lang && <span className="vp-code-lang">{lang}</span>}
        </div>
      )}
      <pre>
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}

/* ---------------- Diff ---------------- */
export function Diff({ code = '', lang, title, children }) {
  const src = code || (typeof children === 'string' ? children : '')
  const lines = src.replace(/\n$/, '').split('\n')
  return (
    <div className="vp-diff">
      {title && <div className="vp-code-title"><span>{title}</span>{lang && <span className="vp-code-lang">{lang}</span>}</div>}
      <pre>
        {lines.map((ln, i) => {
          const kind = ln[0] === '+' ? 'add' : ln[0] === '-' ? 'del' : 'ctx'
          const body = kind === 'ctx' ? ln : ln.slice(1)
          const html = highlight(body, lang)
          return (
            <span key={i} className={`vp-diff-line vp-diff-${kind}`} dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
          )
        })}
      </pre>
    </div>
  )
}

/* ---------------- AnnotatedCode ---------------- */
function parseRange(spec) {
  // "12" | "12-18" -> [start, end]
  const [a, b] = String(spec).split('-').map((n) => parseInt(n, 10))
  return [a, b || a]
}
export function AnnotatedCode({ code = '', lang, file, annotations = [], children }) {
  const src = (code || (typeof children === 'string' ? children : '')).replace(/\n$/, '')
  const lines = src.split('\n')
  const annotatedLines = new Set()
  annotations.forEach((a) => {
    const [s, e] = parseRange(a.lines)
    for (let n = s; n <= e; n++) annotatedLines.add(n)
  })
  return (
    <div className="vp-acode">
      {file && <div className="vp-acode-file">{file}</div>}
      <div className="vp-acode-grid">
        <div className="vp-acode-code">
          {lines.map((ln, i) => {
            const num = i + 1
            const html = highlight(ln, lang)
            return (
              <div key={i} className={`vp-acode-row${annotatedLines.has(num) ? ' is-annotated' : ''}`}>
                <span className="vp-acode-gutter">{num}</span>
                <span className="vp-acode-line hljs" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
              </div>
            )
          })}
        </div>
        <div className="vp-acode-notes">
          {annotations.map((a, i) => (
            <div key={i} className="vp-acode-note">
              <span className="vp-acode-note-lines">L{a.lines}</span>
              {a.label && <span className="vp-acode-note-label">{a.label}</span>}
              <div>{a.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Diagram (custom HTML/CSS or Mermaid) ---------------- */
let mermaidPromise = null
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      const mermaid = m.default
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' })
      return mermaid
    })
  }
  return mermaidPromise
}

export function Diagram({ html, css, mermaid, frame = 'auto', children }) {
  const ref = useRef(null)
  const framed = frame === 'show'

  useEffect(() => {
    if (!mermaid || !ref.current) return
    let live = true
    const theme = document.documentElement.dataset.theme
    loadMermaid().then(async (m) => {
      m.initialize({ startOnLoad: false, securityLevel: 'strict', theme: theme === 'dark' ? 'dark' : 'default' })
      try {
        const id = 'vpm-' + Math.abs(hashStr(mermaid)).toString(36)
        const { svg } = await m.render(id, mermaid)
        if (live && ref.current) ref.current.innerHTML = svg
      } catch (err) {
        if (live && ref.current) ref.current.textContent = 'Mermaid error: ' + err.message
      }
    })
    return () => { live = false }
  }, [mermaid])

  if (mermaid) {
    return <div className={`vp-diagram${framed ? ' framed' : ''}`}><div className="vp-mermaid" ref={ref} /></div>
  }
  return (
    <div className={`vp-diagram${framed ? ' framed' : ''}`}>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div dangerouslySetInnerHTML={{ __html: html || '' }} />
      {!html && children}
    </div>
  )
}
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h }

/* ---------------- DataModel ---------------- */
export function DataModel({ entities = [], relations = [] }) {
  return (
    <div className="vp-datamodel">
      <div className="vp-dm-grid">
        {entities.map((e) => (
          <div key={e.name} className="vp-dm-entity">
            <div className="vp-dm-entity-head">{e.name}</div>
            {(e.fields || []).map((f) => (
              <div key={f.name} className="vp-dm-field">
                <span className="vp-dm-field-name">{f.name}</span>
                <span className="vp-dm-field-type">{f.type}{f.note ? ` · ${f.note}` : ''}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {relations.length > 0 && (
        <ul className="vp-dm-relations">
          {relations.map((r, i) => (
            <li key={i}>{r.from} → {r.to}{r.label ? `  (${r.label})` : ''}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------------- FileTree ---------------- */
export function FileTree({ paths = [] }) {
  const norm = paths.map((p) => (typeof p === 'string' ? { path: p } : p))
  // Build a nested tree
  const root = {}
  norm.forEach(({ path, note, status }) => {
    const parts = path.split('/')
    let node = root
    parts.forEach((part, i) => {
      const isLeaf = i === parts.length - 1
      node.children = node.children || {}
      node.children[part] = node.children[part] || { name: part, isDir: !isLeaf }
      if (isLeaf) { node.children[part].note = note; node.children[part].status = status }
      node = node.children[part]
    })
  })
  const rows = []
  const walk = (node, depth) => {
    const entries = Object.values(node.children || {}).sort((a, b) => (b.isDir - a.isDir) || a.name.localeCompare(b.name))
    entries.forEach((child) => {
      rows.push({ ...child, depth })
      if (child.children) walk(child, depth + 1)
    })
  }
  walk(root, 0)
  return (
    <div className="vp-filetree">
      {rows.map((r, i) => (
        <div key={i} className="vp-ft-row">
          <span>{'  '.repeat(r.depth)}</span>
          <span className={r.isDir ? 'vp-ft-dir' : 'vp-ft-name'}>{r.isDir ? r.name + '/' : r.name}</span>
          {r.status && <span className={`vp-ft-tag vp-ft-${r.status}`}>{r.status}</span>}
          {r.note && <span className="vp-ft-note">{r.note}</span>}
        </div>
      ))}
    </div>
  )
}

/* ---------------- ApiEndpoint ---------------- */
export function ApiEndpoint({ method = 'GET', path, summary, request, response }) {
  const m = method.toLowerCase()
  return (
    <div className="vp-api">
      <div className="vp-api-head">
        <span className={`vp-api-method ${m}`}>{method.toUpperCase()}</span>
        <span className="vp-api-path">{path}</span>
      </div>
      {summary && <div className="vp-api-summary">{summary}</div>}
      {request && (
        <div className="vp-api-section">
          <h5>Request</h5>
          <Code code={typeof request === 'string' ? request : JSON.stringify(request, null, 2)} lang="json" />
        </div>
      )}
      {response && (
        <div className="vp-api-section">
          <h5>Response</h5>
          <Code code={typeof response === 'string' ? response : JSON.stringify(response, null, 2)} lang="json" />
        </div>
      )}
    </div>
  )
}

/* ---------------- OpenApiSpec ---------------- */
export function OpenApiSpec({ spec = {} }) {
  const paths = spec.paths || {}
  const ops = []
  Object.entries(paths).forEach(([p, methods]) => {
    Object.entries(methods).forEach(([m, op]) => {
      ops.push({ path: p, method: m, summary: op.summary || op.description })
    })
  })
  return (
    <div className="vp-api">
      <div className="vp-api-head">
        <span className="vp-api-path">{spec.info?.title || 'OpenAPI'}{spec.info?.version ? ` v${spec.info.version}` : ''}</span>
      </div>
      <div className="vp-api-section">
        {ops.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '4px 0' }}>
            <span className={`vp-api-method ${o.method}`}>{o.method.toUpperCase()}</span>
            <span className="vp-api-path" style={{ fontSize: 13 }}>{o.path}</span>
            {o.summary && <span className="vp-muted">{o.summary}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- JsonExplorer ---------------- */
function JsonNode({ k, value, depth }) {
  const [open, setOpen] = useState(depth < 2)
  const isObj = value && typeof value === 'object'
  if (!isObj) {
    let cls = 'vp-json-null', text = 'null'
    if (typeof value === 'string') { cls = 'vp-json-string'; text = `"${value}"` }
    else if (typeof value === 'number') { cls = 'vp-json-number'; text = String(value) }
    else if (typeof value === 'boolean') { cls = 'vp-json-bool'; text = String(value) }
    return (
      <div>{k != null && <span className="vp-json-key">{k}: </span>}<span className={cls}>{text}</span></div>
    )
  }
  const isArr = Array.isArray(value)
  const entries = isArr ? value.map((v, i) => [i, v]) : Object.entries(value)
  return (
    <div>
      <button className="vp-json-toggle" onClick={() => setOpen(!open)}>
        {open ? '▾' : '▸'} {k != null && <span className="vp-json-key">{k}: </span>}
        {isArr ? `[${entries.length}]` : `{${entries.length}}`}
      </button>
      {open && (
        <div className="vp-json-children">
          {entries.map(([ck, cv]) => (
            <JsonNode key={ck} k={ck} value={cv} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
export function JsonExplorer({ data }) {
  return <div className="vp-json"><JsonNode value={data} depth={0} /></div>
}

/* ---------------- QuestionForm ---------------- */
function Question({ q }) {
  const [choice, setChoice] = useState(q.mode === 'multi' ? [] : '')
  const [other, setOther] = useState('')
  const options = q.options || []
  const toggle = (id) => {
    if (q.mode === 'multi') {
      setChoice((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
    } else {
      setChoice(id)
    }
  }
  return (
    <div className="vp-question">
      <div className="vp-q-title">{q.title}</div>
      {q.mode !== 'freeform' && (
        <div className="vp-q-options">
          {options.map((o) => {
            const checked = q.mode === 'multi' ? choice.includes(o.id) : choice === o.id
            return (
              <label key={o.id} className="vp-q-option">
                <input
                  type={q.mode === 'multi' ? 'checkbox' : 'radio'}
                  name={q.id}
                  checked={checked}
                  onChange={() => toggle(o.id)}
                />
                <span>
                  {o.label}
                  {o.recommended && <span className="vp-q-recommended">recommended</span>}
                  {o.detail && <span className="vp-q-option-detail">{o.detail}</span>}
                </span>
              </label>
            )
          })}
        </div>
      )}
      {(q.mode === 'freeform' || q.allowOther !== false) && (
        <div className="vp-q-writein">
          {q.mode === 'freeform' ? (
            <textarea rows={3} placeholder="Your answer…" value={other} onChange={(e) => setOther(e.target.value)} />
          ) : (
            <input placeholder="Write in another option…" value={other} onChange={(e) => setOther(e.target.value)} />
          )}
        </div>
      )}
    </div>
  )
}
export function QuestionForm({ title = 'Open Questions', questions = [] }) {
  return (
    <section className="vp-qform">
      <div className="vp-qform-head">{title}</div>
      <div className="vp-qform-body">
        {questions.map((q) => (
          <Question key={q.id} q={q} />
        ))}
      </div>
    </section>
  )
}

/* ---------------- CustomHtml ---------------- */
export function CustomHtml({ html, children }) {
  if (html) return <div className="vp-customhtml" dangerouslySetInnerHTML={{ __html: html }} />
  return <div className="vp-customhtml">{children}</div>
}
