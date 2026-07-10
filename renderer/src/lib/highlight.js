import hljs from 'highlight.js/lib/common'

export function highlight(code, lang) {
  const src = String(code == null ? '' : code)
  try {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(src, { language: lang }).value
    }
    return hljs.highlightAuto(src).value
  } catch {
    return escapeHtml(src)
  }
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
