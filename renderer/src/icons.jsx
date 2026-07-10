// Tabler-style inline icon paths. Wireframe HTML uses <span data-icon="mail">
// markers; hydrateIcons() replaces them with these SVGs so mockups never show
// visible icon words. Stroke uses currentColor so icons inherit text color.
import React from 'react'

const P = {
  mail: '<path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  chevronUp: '<path d="M6 15l6-6 6 6"/>',
  chevronLeft: '<path d="M15 6l-6 6 6 6"/>',
  chevronRight: '<path d="M9 6l6 6-6 6"/>',
  dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  bell: '<path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
}

const ALIAS = {
  email: 'mail', password: 'lock', add: 'plus', close: 'x', more: 'dots',
  chevron: 'chevronDown', caret: 'chevronDown', dropdown: 'chevronDown',
}

export const iconNames = Object.keys(P)

function svgFor(name) {
  const key = P[name] ? name : ALIAS[name]
  if (!key || !P[key]) return null
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[key]}</svg>`
}

export function Icon({ name, size = 18, ...rest }) {
  const key = P[name] ? name : ALIAS[name]
  if (!key) return null
  return (
    <span
      style={{ display: 'inline-flex', width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgFor(name) }}
      {...rest}
    />
  )
}

// Replace <span data-icon="mail"> / <i data-icon="lock"> markers in a rendered
// DOM subtree with real SVGs. Called after wireframe HTML mounts.
export function hydrateIcons(root) {
  if (!root) return
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (el.dataset.iconDone) return
    const svg = svgFor(el.dataset.icon)
    if (!svg) return
    el.classList.add('wf-icon')
    el.innerHTML = svg
    el.dataset.iconDone = '1'
  })
}
