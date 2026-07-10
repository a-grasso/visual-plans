import React from 'react'
import {
  Callout, Columns, Column, Tabs, Tab, Checklist,
  Code, Diff, AnnotatedCode, Diagram, DataModel, FileTree,
  ApiEndpoint, OpenApiSpec, JsonExplorer, QuestionForm, CustomHtml,
} from './components/blocks.jsx'
import { Screen } from './components/wireframe.jsx'
import { DesignBoard, Section, Artboard, Annotation, Connector } from './components/canvas.jsx'
import { Icon } from './icons.jsx'
import { highlight } from './lib/highlight.js'

// Fenced ```lang code blocks arrive as <pre><code class="language-lang">…</code>.
// Render them with the framed, highlighted Code surface.
function Pre({ children }) {
  const child = React.Children.toArray(children)[0]
  if (child && child.props) {
    const cls = child.props.className || ''
    const lang = (cls.match(/language-(\w+)/) || [])[1]
    const code = typeof child.props.children === 'string' ? child.props.children : ''
    const html = highlight(code, lang)
    return (
      <div className="vp-code">
        {lang && <div className="vp-code-title"><span /><span className="vp-code-lang">{lang}</span></div>}
        <pre><code className="hljs" dangerouslySetInnerHTML={{ __html: html }} /></pre>
      </div>
    )
  }
  return <pre>{children}</pre>
}

export const components = {
  pre: Pre,
  // block kit
  Callout, Columns, Column, Tabs, Tab, Checklist,
  Code, Diff, AnnotatedCode, Diagram, DataModel, FileTree,
  ApiEndpoint, OpenApiSpec, JsonExplorer, QuestionForm, CustomHtml,
  // wireframe + canvas
  Screen, DesignBoard, Section, Artboard, Annotation, Connector,
  Icon,
}
