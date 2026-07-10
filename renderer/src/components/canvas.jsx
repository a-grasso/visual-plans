import React, {
  createContext, useContext, useRef, useState, useLayoutEffect, useEffect, useCallback, useMemo, Children, isValidElement,
} from 'react'
import { Screen } from './wireframe.jsx'

// The canvas lays artboards out in wrapping lanes and draws connectors between
// them by measuring their real positions. Artboards register their DOM node by
// id; DesignBoard computes an SVG overlay of paths after layout + on resize.
const BoardCtx = createContext(null)

export function DesignBoard({ title, children }) {
  const boardRef = useRef(null)
  const nodes = useRef(new Map())
  const [, force] = useState(0)
  const recompute = useCallback(() => force((n) => n + 1), [])

  const register = useCallback((id, el) => {
    if (el) nodes.current.set(id, el)
    else nodes.current.delete(id)
    recompute()
  }, [recompute])

  useLayoutEffect(() => {
    const ro = new ResizeObserver(recompute)
    if (boardRef.current) ro.observe(boardRef.current)
    window.addEventListener('resize', recompute)
    const t = setTimeout(recompute, 120) // let fonts/layout settle
    return () => { ro.disconnect(); window.removeEventListener('resize', recompute); clearTimeout(t) }
  }, [recompute])

  const kids = Children.toArray(children)
  const connectors = kids.filter((c) => isValidElement(c) && c.type === Connector)
  const flow = kids.filter((c) => !(isValidElement(c) && c.type === Connector))

  const ctxValue = useMemo(() => ({ register }), [register])

  return (
    <BoardCtx.Provider value={ctxValue}>
      <div className="vp-board" ref={boardRef}>
        {title && <div className="vp-board-title">{title}</div>}
        <ConnectorLayer boardRef={boardRef} nodes={nodes.current} connectors={connectors} />
        <div className="vp-board-lanes">{flow}</div>
      </div>
    </BoardCtx.Provider>
  )
}

export function Section({ title, children }) {
  return (
    <div className="vp-board-section" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {title && <div className="vp-artboard-label">{title}</div>}
      <div className="vp-board-lanes">{children}</div>
    </div>
  )
}

export function Artboard({ id, label, placement, children }) {
  const ctx = useContext(BoardCtx)
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (ctx && id) ctx.register(id, ref.current)
    return () => { if (ctx && id) ctx.register(id, null) }
  }, [ctx, id])

  const kids = Children.toArray(children)
  const screens = kids.filter((c) => isValidElement(c) && c.type === Screen)
  const notes = kids.filter((c) => isValidElement(c) && c.type === Annotation)
  const side = notes.filter((n) => (n.props.placement || 'right') === 'right' || n.props.placement === 'left')
  const stack = notes.filter((n) => n.props.placement === 'top' || n.props.placement === 'bottom')

  return (
    <div className="vp-artboard">
      <div className="vp-artboard-col" ref={ref} data-artboard={id}>
        {label && <div className="vp-artboard-label">{label}</div>}
        {stack.filter((n) => n.props.placement === 'top')}
        {screens}
        {stack.filter((n) => n.props.placement === 'bottom')}
      </div>
      {side.length > 0 && (
        <div className="vp-artboard-col" style={{ maxWidth: 190 }}>{side}</div>
      )}
    </div>
  )
}

export function Annotation({ head, children, targetId, placement }) {
  return (
    <div className="vp-annotation" data-target={targetId} data-placement={placement}>
      {head && <div className="vp-annotation-head">{head}</div>}
      <div className="vp-annotation-note">{children}</div>
    </div>
  )
}

// Declarative connector; consumed by DesignBoard, renders nothing itself.
export function Connector() { return null }

function ConnectorLayer({ boardRef, nodes, connectors }) {
  const [paths, setPaths] = useState([])

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    const brect = board.getBoundingClientRect()
    const next = []
    connectors.forEach((c, i) => {
      const from = nodes.get(c.props.from)
      const to = nodes.get(c.props.to)
      if (!from || !to) return
      const a = from.getBoundingClientRect()
      const b = to.getBoundingClientRect()
      const ax = a.left - brect.left, ay = a.top - brect.top
      const bx = b.left - brect.left, by = b.top - brect.top
      const ac = { x: ax + a.width / 2, y: ay + a.height / 2 }
      const bc = { x: bx + b.width / 2, y: by + b.height / 2 }
      const dx = bc.x - ac.x, dy = bc.y - ac.y
      let p1, p2
      if (Math.abs(dx) >= Math.abs(dy)) {
        // horizontal dominant: right edge -> left edge
        p1 = dx >= 0 ? { x: ax + a.width, y: ac.y } : { x: ax, y: ac.y }
        p2 = dx >= 0 ? { x: bx, y: bc.y } : { x: bx + b.width, y: bc.y }
      } else {
        p1 = dy >= 0 ? { x: ac.x, y: ay + a.height } : { x: ac.x, y: ay }
        p2 = dy >= 0 ? { x: bc.x, y: by } : { x: bc.x, y: by + b.height }
      }
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2
      const d = `M ${p1.x} ${p1.y} C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}`
      next.push({ d, label: c.props.label, mx, my, key: i })
    })
    setPaths(next)
  }, [connectors, nodes, boardRef])

  return (
    <svg className="vp-connectors">
      <defs>
        <marker id="vp-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path className="vp-conn-arrow" d="M0 0 L9 4.5 L0 9 z" />
        </marker>
      </defs>
      {paths.map((p) => (
        <g key={p.key}>
          <path d={p.d} markerEnd="url(#vp-arrow)" />
          {p.label && (
            <>
              <rect className="vp-conn-label-bg" x={p.mx - p.label.length * 3.2 - 4} y={p.my - 9} width={p.label.length * 6.4 + 8} height={16} rx={4} />
              <text className="vp-conn-label" x={p.mx} y={p.my + 3} textAnchor="middle">{p.label}</text>
            </>
          )}
        </g>
      ))}
    </svg>
  )
}
