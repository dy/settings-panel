const css = `
.case-native-frame {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  width: 100%;
  height: 100%;
  border: 0;
  background: inherit;
}
.case-render-switch {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 2147483001;
  display: inline-flex;
  padding: 2px;
  border: 1px solid color-mix(in oklab, CanvasText 18%, transparent);
  border-radius: 6px;
  background: color-mix(in oklab, Canvas 86%, transparent);
  box-shadow: 0 2px 10px rgba(0,0,0,.18);
  color: CanvasText;
  font: 500 11px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.case-render-switch button {
  min-width: 52px;
  height: 24px;
  padding: 0 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.case-render-switch button[aria-pressed="true"] {
  background: CanvasText;
  color: Canvas;
}
.case-render-switch button:focus-visible {
  outline: 2px solid #0d99ff;
  outline-offset: 2px;
}
`

const ensureStyle = () => {
  if (document.getElementById('case-render-switch-style')) return
  const style = document.createElement('style')
  style.id = 'case-render-switch-style'
  style.textContent = css
  document.head.appendChild(style)
}

const currentMode = () => new URLSearchParams(location.search).get('render') === 'native' ? 'native' : 'settings'

const setQuery = mode => {
  const url = new URL(location.href)
  if (mode === 'native') url.searchParams.set('render', 'native')
  else url.searchParams.delete('render')
  history.replaceState(null, '', url)
}

export function nativeToggle({ ref, nativeLabel = 'native' }) {
  if (!ref) return
  ensureStyle()

  let iframe
  const root = document.createElement('div')
  root.className = 'case-render-switch'
  root.innerHTML = `
    <button type="button" data-mode="settings">ours</button>
    <button type="button" data-mode="native"></button>
  `
  const [ours, native] = root.querySelectorAll('button')
  native.textContent = nativeLabel
  document.body.appendChild(root)

  const show = mode => {
    if (mode === 'native' && !iframe) {
      iframe = document.createElement('iframe')
      iframe.className = 'case-native-frame'
      iframe.src = ref
      iframe.title = `${nativeLabel} render`
      document.body.appendChild(iframe)
    }
    if (iframe) iframe.hidden = mode !== 'native'
    ours.setAttribute('aria-pressed', String(mode === 'settings'))
    native.setAttribute('aria-pressed', String(mode === 'native'))
    setQuery(mode)
  }

  root.addEventListener('click', e => {
    const button = e.target.closest('button[data-mode]')
    if (button) show(button.dataset.mode)
  })

  show(currentMode())
}
