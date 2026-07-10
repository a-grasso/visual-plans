import React, { useRef, useEffect, useLayoutEffect } from 'react'
import { hydrateIcons } from '../icons.jsx'

// Chrome per surface preset. The renderer owns footprint + chrome; the authored
// `html` fragment is real product content styled by .vp-wf + --wf-* tokens.
function Chrome({ surface, url }) {
  if (surface === 'browser') {
    return (
      <div className="vp-chrome">
        <div className="vp-chrome-dots">
          <span className="vp-chrome-dot" /><span className="vp-chrome-dot" /><span className="vp-chrome-dot" />
        </div>
        <div className="vp-chrome-url">{url || 'app.local'}</div>
      </div>
    )
  }
  if (surface === 'desktop') {
    return (
      <div className="vp-chrome">
        <div className="vp-chrome-dots">
          <span className="vp-chrome-dot" /><span className="vp-chrome-dot" /><span className="vp-chrome-dot" />
        </div>
      </div>
    )
  }
  if (surface === 'mobile') return <div className="vp-notch" />
  return null
}

export function Screen({ surface = 'browser', html = '', skeleton = false, frame = 'auto', url, label, style }) {
  const bodyRef = useRef(null)

  useLayoutEffect(() => {
    hydrateIcons(bodyRef.current)
  }, [html])

  const framed = frame !== 'hide'
  return (
    <div className="vp-screen">
      {label && <div className="vp-screen-label">{label}</div>}
      <div className={`vp-frame vp-surface-${surface}${framed ? '' : ' frame-hide'}`} style={style}>
        <Chrome surface={surface} url={url} />
        <div
          ref={bodyRef}
          className={`vp-canvas-body vp-wf${skeleton ? ' vp-wf-skeleton' : ''}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
